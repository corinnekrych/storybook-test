import { Command } from 'commander';
import { glob } from 'glob';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import inquirer from 'inquirer';
import { ComponentInfo, ExampleStory, ValidationResult } from './types';
import { analyzeTypeImports, generateStoryContent } from './prompt-story-content';
import { generateSimpleStoryContent } from './prompt-story-content-simple';
// Load environment variables from .env file
dotenv.config({ path: '../../.env' });

// Perform initial environment and dependency checks
function performInitialChecks() {
  if (!process.env.OPENAI_API) {
    console.error('Error: OPENAI_API environment variable is not set');
    process.exit(1);
  }

  if (parseInt(process.version.slice(1).split('.')[0], 10) < 22) {
    console.error('Error: Node.js version must be 22 or higher to use this script.');
    process.exit(1);
  }
}

// Call the function to perform checks
performInitialChecks();

async function getComponentInfo(filePath: string): Promise<ComponentInfo | null> {
  try {
    const code = fs.readFileSync(filePath, 'utf-8');
    const componentName = path.basename(filePath).replace(/\.(tsx|jsx)$/, '');

    return {
      componentName,
      componentCode: code,
      filePath,
    };
  } catch (error) {
    console.error(`Error reading component file ${filePath}:`, error);
    return null;
  }
}

async function getExampleStories(): Promise<ExampleStory[]> {
  // Look for stories in the same library first
  const storyFiles = glob.sync('../../libs/*/src/lib/**/*.stories.{tsx,jsx}', {
    ignore: ['**/node_modules/**', '**/dist/**']
  });

  const examples: ExampleStory[] = [];

  for (const storyFile of storyFiles) {
    try {
      const content = fs.readFileSync(storyFile, 'utf-8');

      // Only take stories that use classic Story pattern and proper context handling
      if (
        content.includes('Meta, Story') &&
        content.includes('as Meta') &&
        content.includes('Template.bind({})') &&
        (content.includes('StoryWrapper') || !content.includes('useContext')) &&
        !content.includes('TODO') &&
        !content.includes('// Add')
      ) {
        const name = path.basename(storyFile, path.extname(storyFile));
        examples.push({ name, content });

        // Stop after finding 5 examples
        if (examples.length >= 5) break;
      }
    } catch (error) {
      console.warn(`Could not read example story ${storyFile}:`, error);
    }
  }

  return examples;
}



async function validateStoryContent(storyContent: string, componentInfo: ComponentInfo): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Essential validations that determine if the story will work
  // First analyze type imports in the component
  const typeImports = await analyzeTypeImports(componentInfo.componentCode, componentInfo.filePath);

  const essentialChecks = [
    {
      pattern: /import\s*{\s*Meta,\s*Story(?:Fn)?\s*}\s+from\s+['"]@storybook\/react['"];?/,
      error: 'Missing or incorrect Storybook imports'
    },
    {
      pattern: new RegExp(`import\\s+{\\s*${componentInfo.componentName}\\s*}\\s+from\\s+['"][^'"]+['"];?`),
      error: 'Incorrect component import'
    },
    // Add checks for each required type import
    ...typeImports.map(({ importPath, typeName }) => ({
      pattern: new RegExp(`import\\s+type\\s*{[^}]*\\b${typeName}\\b[^}]*}\\s+from\\s+['"]${importPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"];?`),
      error: `Missing or incorrect type import for ${typeName} from ${importPath}`
    })),
    {
      pattern: /const\s+Template\s*:\s*Story(?:Fn)?</,
      error: 'Missing Template definition'
    },
    {
      pattern: /export\s+const\s+\w+\s*=\s*Template\.bind\({}\)/,
      error: 'No valid story exports found'
    }
  ];

  // Check essential patterns
  for (const { pattern, error } of essentialChecks) {
    if (!pattern.test(storyContent)) {
      errors.push(error);
    }
  }

  // Additional quality checks
  if (!storyContent.includes('parameters')) {
    warnings.push('No parameters defined in meta');
  }

  if (!storyContent.includes('args:')) {
    warnings.push('No args defined in stories');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
async function writeStoryFile(componentInfo: ComponentInfo, storyContent: string): Promise<void> {
  const storyPath = componentInfo.filePath.replace(/\.(tsx|jsx)$/, '.stories.tsx');

  if (fs.existsSync(storyPath)) {
    console.log(`❌ Story already exists for ${componentInfo.componentName}, skipping...`);
    return;
  }
  try {
    fs.writeFileSync(storyPath, storyContent);
    console.log(`✅ Created story for ${componentInfo.componentName}`);
    return;
  } catch (error) {
    console.error(`Error writing story:`, error);
    throw error;
  }
}

function generateImprovedPrompt(validationResult: ValidationResult, storyContent: string): string {
  const errorFixes = validationResult.errors.map(error => {
    if (error.includes('type import')) {
      return '- Types must be imported from their original source files, not from the component';
    }
    if (error.includes('Template definition')) {
      return '- Template must be properly typed with Story<Props> and match the component props exactly';
    }
    if (error.includes('meta export')) {
      return '- Meta export must include all required configurations and proper component reference';
    }
    if (error.includes('story exports')) {
      return '- Export at least Default story using Template.bind({}) with all required props';
    }
    return `- ${error}`;
  }).join('\n');

  return `
Previous generation attempt had these issues:
VALIDATION ERRORS:
${validationResult.errors.map(error => `- ${error}`).join('\n')}
Please fix these issues in the next attempt:
${errorFixes}
Previous generated content for reference:
\`\`\`typescript
${storyContent}
\`\`\`
`;
}

// @ts-ignore
async function validateGenerateAndWriteStoryFile(componentInfo: ComponentInfo, storyContent: string): Promise<void> {
  const storyPath = componentInfo.filePath.replace(/\.(tsx|jsx)$/, '.stories.tsx');

  if (fs.existsSync(storyPath)) {
    console.log(`❌ Story already exists for ${componentInfo.componentName}, skipping...`);
    return;
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    const validationResult = await validateStoryContent(storyContent, componentInfo);

    if (validationResult.isValid) {
      try {
        fs.writeFileSync(storyPath, storyContent);
        console.log(`✅ Created story for ${componentInfo.componentName} (attempt ${attempt})`);

        if (validationResult.warnings.length > 0) {
          console.log(`⚠️  Warnings:`, validationResult.warnings.join(', '));
        }
        return;
      } catch (error) {
        console.error(`Error writing story:`, error);
        throw error;
      }
    }

    if (attempt < 3) {
      console.log(`❌ Validation failed (attempt ${attempt})`);
      console.log(`🔄 Retrying with improved prompt...`);

      const improvedPrompt = generateImprovedPrompt(validationResult, storyContent);
      const exampleStories = await getExampleStories();
      storyContent = await generateStoryContent(
        {
          ...componentInfo,
          componentCode: componentInfo.componentCode + '\n\n' + improvedPrompt
        },
        exampleStories
      );
    } else {
      console.error(`❌ Failed to generate valid story after ${attempt} attempts`);
      console.error(`Final errors:`, validationResult.errors);

      // Save invalid story for debugging
      const debugPath = storyPath.replace('.stories.tsx', '.story.debug.tsx');
      fs.writeFileSync(debugPath, storyContent);
      console.log(`📝 Debug version saved to: ${debugPath}`);
    }
  }
}



async function main() {
  const program = new Command();
  console.log("🤖 Generating Storybook stories for React components...")

  program
    .name('generate-stories')
    .description('Generate Storybook stories for React components')
    .option('-p, --pattern <pattern>', 'Glob pattern to match component files', 'libs/*/src/lib/**/*.{tsx,jsx}')
    .option('-c, --component <component>', 'Generate story for a specific component')
    .option('-l, --lib <library>', 'Generate stories for a specific library (atoms, molecules, etc.)')
    .option('-m, --model <model>', 'Specify the type of code generation model to use: simple, advanced')
    .option('--debug', 'Enable debug mode for detailed logging')
    .parse();

  const options = program.opts();

  // Get example stories to use as templates
  console.log('📚 Loading example stories...');
  const exampleStories = await getExampleStories();
  console.log(`🔍 Found ${exampleStories.length} example stories to use as templates`);

  let componentPaths: string[] = [];
  const storiesPaths = glob.sync(`../../libs/${options.lib}/src/lib/**/*.stories.{tsx,jsx}`, {})
  const model = options.model || 'simple';
  if (options.component) {
    componentPaths = [options.component];
  } else if (options.lib) {
    componentPaths = glob.sync(`../../libs/${options.lib}/src/lib/**/*.{tsx,jsx}`, {
      ignore: [`../../libs/${options.lib}/src/lib/**/*.debug.{tsx,jsx}`, `../../libs/${options.lib}/src/lib/**/*.stories.{tsx,jsx}`, '**/index.{ts,tsx,jsx}', '**/*.spec.{tsx,jsx}'],
    });
    console.log('🐞 DEBUG: componentPaths: ', componentPaths)
  } else {
    componentPaths = glob.sync(options.pattern, {
      ignore: [`../../libs/${options.pattern}/src/lib/**/*.debug.{tsx,jsx}`, `../../libs/${options.pattern}/src/lib/**/*.stories.{tsx,jsx}`, '**/index.{ts,tsx,jsx}', '**/*.spec.{tsx,jsx}'],
    });
  }

  // filter removing Components that have associated stories with same name
  componentPaths = componentPaths.filter((componentPath) => storiesPaths.includes(componentPath.replace(/\.(tsx|jsx)$/, '.stories.tsx')) === false);
  console.log('🐞 DEBUG: filtered componentPaths: ', componentPaths)
  console.log(`🔍 Found ${componentPaths.length} components to process`);

  let successCount = 0;
  let failureCount = 0;

  for (const componentPath of componentPaths) {
    let doContinue = false
    program.action(async () => {
      const { userInput } = await inquirer.prompt([
        {
          type: 'input',
          name: 'userInput',
          message: `Do you want to proceed (Y|n) with : ${componentPath}`,
        },
      ]);
      doContinue = userInput.toLowerCase() === 'y' || userInput.trim() === '';
    });
    await program.parseAsync(process.argv);
    if (!doContinue) {
      console.error('❌ Exiting story generation...');
      return;
    }

    const componentInfo = await getComponentInfo(componentPath);
    if (componentInfo === null) {
      console.error(`❌ Failed to generate story for this component ${componentPath} as we could not extract information from it.`);
      return
    };

    console.log(`\n🔄 Processing ${componentInfo.componentName} with ${options.model} code generation model...`);

    try {
      if (model === 'advanced') {
        const storyContent = await generateStoryContent(componentInfo, exampleStories);
        await validateGenerateAndWriteStoryFile(componentInfo, storyContent);

      } else {
        const storyContent = await generateSimpleStoryContent(componentInfo);
        await writeStoryFile(componentInfo, storyContent);
      }

      successCount++;
    } catch (error) {
      console.error(`❌ Failed to generate story for ${componentInfo.componentName}:`, error);
      failureCount++;
    }
  }

  console.log(`\n✨ Story generation complete!`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);
}

main().catch(console.error);
