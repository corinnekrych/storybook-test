import * as prettier from 'prettier';
import { ComponentInfo, ExampleStory } from './types';
import * as path from 'path';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API
});



export async function analyzeTypeImports(componentCode: string, componentFilePath: string): Promise<{ importPath: string; typeName: string }[]> {
  const typeImports: { importPath: string; typeName: string }[] = [];

  // Match type imports like: import type { TypeName } from './types';
  const typeImportRegex = /import\s+type\s*{\s*([^}]+)\s*}\s+from\s+['"]([^'"]+)['"]/g;
  let match;

  while ((match = typeImportRegex.exec(componentCode)) !== null) {
    const types = match[1].split(',').map(t => t.trim());
    const importPath = match[2];

    // Convert the import path to be relative to the story file
    const componentDir = path.dirname(componentFilePath);
    const absoluteImportPath = path.resolve(componentDir, importPath);
    const storyPath = componentFilePath.replace(/\.(tsx|jsx)$/, '.stories.tsx');
    const storyDir = path.dirname(storyPath);
    const relativeImportPath = path.relative(storyDir, absoluteImportPath)
      .replace(/\.(tsx|jsx|ts)$/, '');

    // Ensure the path starts with ./ or ../
    const finalImportPath = relativeImportPath.startsWith('.') ? relativeImportPath : './' + relativeImportPath;

    types.forEach(typeName => {
      typeImports.push({
        importPath: finalImportPath,
        typeName
      });
    });
  }

  return typeImports;
}

async function extractComponentInterface(componentCode: string): Promise<string> {
  const prompt = `
Analyze this React component code and extract the Props interface/type definition:

${componentCode}

IMPORTANT: Return ONLY the TypeScript interface or type definition for the component's props.
- If there are multiple interfaces, return the main Props interface used by the component
- If no props interface exists, return "interface Props {}"
- Do NOT include any explanations, just the interface code
- Remove any "export" keywords from the interface
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a TypeScript expert. Extract only the Props interface from React components. Return only code, no explanations."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.1,
  });

  let result = completion.choices[0].message.content || "interface Props {}";

  // Clean up the result - remove markdown formatting
  if (result.includes('```')) {
    const matches = result.match(/```(?:typescript|tsx?)?\n([\s\S]*?)```/);
    if (matches && matches[1]) {
      result = matches[1].trim();
    }
  }

  return result;
}
function formatTypeImports(typeImports: { importPath: string; typeName: string }[]): string {
  if (typeImports.length === 0) return '';

  const imports = typeImports.map(({ importPath, typeName }) =>
    'import type { ' + typeName + " } from '" + importPath + "';"
  );
  return '// Import types from their original locations\n' + imports.join('\n');
}
function generateImportPath(componentFilePath: string): string {
  // Get the relative path from the stories file to the component
  const storyPath = componentFilePath.replace(/\.(tsx|jsx)$/, '.stories.tsx');
  const storyDir = path.dirname(storyPath);
  const relativePath = path.relative(storyDir, componentFilePath)
    .replace(/\.(tsx|jsx)$/, '');

  // Ensure the path starts with ./ or ../
  return relativePath.startsWith('.') ? relativePath : './' + relativePath;
}

export async function generateStoryContent(componentInfo: ComponentInfo, exampleStories: ExampleStory[]): Promise<string> {

  const componentType = componentInfo.filePath.split('/libs/')[1].split('/')[0];
  const propsInterface = await extractComponentInterface(componentInfo.componentCode);
  const importPath = generateImportPath(componentInfo.filePath);
  const typeImports = await analyzeTypeImports(componentInfo.componentCode, componentInfo.filePath);
  console.log('🐞 DEBUG: componentType: ', componentType);
  console.log('🐞 DEBUG: propsInterface: ', propsInterface);
  console.log('🐞 DEBUG: typeImports: ', typeImports);

  // Generate type imports section
  const typeImportsSection = formatTypeImports(typeImports);

  const examplesSection = exampleStories.length > 0
    ? `
WORKING EXAMPLES FROM YOUR PROJECT:
${exampleStories.map((story, index) => `
Example ${index + 1}: ${story.name}
\`\`\`typescript
${story.content}
\`\`\`
`).join('\n')}
` : '';

  // Look for context usage in component code
  const needsContext = componentInfo.componentCode.includes('useContext') ||
    componentInfo.componentCode.includes('Context.Provider');

  const prompt = `
Generate a Storybook story file using classic Story pattern. Analyze the component for any required React Context or other providers.

COMPONENT ANALYSIS REQUIREMENTS:
1. Check if the component uses any React Context (useContext hooks or Context.Provider)
2. Check for any required theme providers
3. Check for any required router context
4. Check for any required state management context

// Base Storybook imports
import { Meta, StoryFn } from '@storybook/react';

// Component import
import { ${componentInfo.componentName} } from '${importPath}';

${typeImportsSection}
${needsContext ? '// Add any required context imports here' : ''}

${needsContext ? `
// Story wrapper with required providers
const StoryWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  // Add necessary context providers here based on component requirements
  children
);` : ''}

export default {
  title: '${componentType}/${componentInfo.componentName}',
  component: ${componentInfo.componentName},
  parameters: {
    layout: 'centered',
    tags: ['autodocs'],
    docs: {
      description: {
        component: 'Add component description here',
        canvas: { sourceState: 'shown' },
      },
    },
  },
  ${needsContext ? 'decorators: [(Story) => <StoryWrapper><Story /></StoryWrapper>],' : ''}
  argTypes: {
    // Define control types here
  },
} as Meta;

COMPONENT PROPS:
${propsInterface}

COMPONENT SOURCE:
\`\`\`typescript
${componentInfo.componentCode}
\`\`\`

${examplesSection}

REQUIREMENTS:
1. Use Template pattern with Story type from @storybook/react
2. Create Template as Story<Props> with component rendering
3. Export stories using Template.bind({})
4. Include meaningful args for each story
5. Define appropriate argTypes with controls
6. Keep code clean and minimal
7. No markdown or comments in the output

Example Template structure:
const Template: Story<Props> = (args) => {
  // Add any necessary hooks or context setup here
  return <${componentInfo.componentName} {...args} />;
};

export const Default = Template.bind({});
Default.args = {
  // Add appropriate props here
};

// Add more story variants with different context values if needed

CRITICAL:
- Use only @storybook/react imports
- Follow exact naming and typing patterns
- Include proper arg controls
- Keep code clean and minimal`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are an expert Storybook developer specializing in the latest Storybook 7.x+ patterns. Generate modern, type-safe stories using current best practices."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.2,
    max_tokens: 2500
  });

  let storyContent = completion.choices[0].message.content || '';

  // More robust cleanup of markdown formatting

  if (storyContent.includes('```')) {
    const matches = storyContent.match(/```(?:typescript|tsx?)?\n([\s\S]*?)```/);
    if (matches && matches[1]) {
      storyContent = matches[1].trim();
    }
  }

  // Remove any leading/trailing explanatory text
  const lines = storyContent.split('\n');
  let startIndex = 0;
  let endIndex = lines.length - 1;

  // Find the first import statement
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import')) {
      startIndex = i;
      break;
    }
  }

  // Find the last export or closing brace
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (line.startsWith('export') || line === '};' || line === '}') {
      endIndex = i;
      break;
    }
  }

  storyContent = lines.slice(startIndex, endIndex + 1).join('\n');

  // Format the code using prettier
  try {
    const formattedCode = await prettier.format(storyContent, {
      parser: 'typescript',
      semi: true,
      singleQuote: true,
      trailingComma: 'es5',
      printWidth: 100,
      tabWidth: 2,
    });
    return formattedCode;
  } catch (error) {
    console.warn(`Prettier formatting failed for ${componentInfo.componentName}:`, error);
    return storyContent;
  }
}
