
import { ComponentInfo } from './types';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API
});

export async function generateSimpleStoryContent(componentInfo: ComponentInfo): Promise<string> {
  const prompt = `
Generate a Storybook story file using classic Story pattern.
The component is a React component from the file: ${componentInfo.filePath}
Do generate only code, no explanations or comments.
Collocate the story file with the component file.
REQUIREMENTS:
1. Use Template pattern with StoryFn type from @storybook/react like "import { Meta, StoryFn } from '@storybook/react'"
2. Create Template as Story<Props> with component rendering
3. Export stories using Template.bind({})
4. Include meaningful args for each story
5. Define appropriate argTypes with controls
6. Keep code clean and minimal
8. Use the latest Storybook 7.x+ patterns
9. replace all occurrences of "import { Story } from '@storybook/react'" with "import { StoryFn } from '@storybook/react'"
`;

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

  //
  // Extract code from md
  //
  if (storyContent.includes('```')) {
    const matches = storyContent.match(/```(?:typescript|tsx?)?\n([\s\S]*?)```/);
    if (matches && matches[1]) {
      storyContent = matches[1].trim();
    }
  }
  console.log('🐞 DEBUG: storyContent inside triple quote: ', storyContent)

  return storyContent
}
