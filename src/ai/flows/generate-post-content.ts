
'use server';

/**
 * @fileOverview A social media post content generation AI agent.
 *
 * - generatePostContent - A function that handles the post content generation process.
 * - GeneratePostContentInput - The input type for the generatePostContent function.
 * - GeneratePostContentOutput - The return type for the generatePostContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePostContentInputSchema = z.object({
  description: z.string().describe('The description of the desired social media post.'),
});
export type GeneratePostContentInput = z.infer<typeof GeneratePostContentInputSchema>;

const GeneratePostContentOutputSchema = z.object({
  postText: z.string().describe('The generated text for the social media post.'),
  hashtags: z.array(z.string()).describe('An array of relevant hashtags for the post.'),
});
export type GeneratePostContentOutput = z.infer<typeof GeneratePostContentOutputSchema>;

export async function generatePostContent(input: GeneratePostContentInput): Promise<GeneratePostContentOutput> {
  return generatePostContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePostContentPrompt',
  input: {schema: GeneratePostContentInputSchema},
  output: {schema: GeneratePostContentOutputSchema},
  prompt: `You are an AI assistant specializing in generating engaging content for social media posts.

  Based on the description provided, generate compelling post text and suggest relevant hashtags to maximize audience interaction.

  Description: {{{description}}}
  
  Ensure the post text is captivating and the hashtags are highly relevant to the post's content.
  The hashtags should be an array of strings.
  `,
});

const generatePostContentFlow = ai.defineFlow(
  {
    name: 'generatePostContentFlow',
    inputSchema: GeneratePostContentInputSchema,
    outputSchema: GeneratePostContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
