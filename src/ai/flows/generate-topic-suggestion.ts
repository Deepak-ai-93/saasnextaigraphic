
'use server';
/**
 * @fileOverview An AI agent for generating topic suggestions based on partial user input.
 *
 * - generateTopicSuggestion - A function that handles the topic suggestion generation.
 * - GenerateTopicSuggestionInput - The input type for the function.
 * - GenerateTopicSuggestionOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTopicSuggestionInputSchema = z.object({
  partialTopic: z.string().describe('The partial text typed by the user for a social media post topic.'),
});
export type GenerateTopicSuggestionInput = z.infer<typeof GenerateTopicSuggestionInputSchema>;

const GenerateTopicSuggestionOutputSchema = z.object({
  suggestedTopic: z.string().describe('A single, concise, and relevant suggested completion or enhancement for the partial topic. This should be the complete proposed topic string.'),
});
export type GenerateTopicSuggestionOutput = z.infer<typeof GenerateTopicSuggestionOutputSchema>;

export async function generateTopicSuggestion(input: GenerateTopicSuggestionInput): Promise<GenerateTopicSuggestionOutput> {
  return generateTopicSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTopicSuggestionPrompt',
  input: {schema: GenerateTopicSuggestionInputSchema},
  output: {schema: GenerateTopicSuggestionOutputSchema},
  prompt: `You are an AI assistant that provides text suggestions.
Given the user is typing the following for a social media post topic: "{{{partialTopic}}}"

Provide a single, concise, and relevant suggestion to complete or enhance this topic.
Your output should be the *complete* proposed topic string.
For example:
- If the input is "best travel dest", you might suggest "best travel destinations for solo adventurers".
- If input is "learn javascript", suggest "learn javascript for web development".
- If input is "home decor ideas for", suggest "home decor ideas for small apartments".

Ensure the suggestion is directly related and a natural extension or a specific angle of the input.
Output only the suggested topic in the 'suggestedTopic' field.
  `,
});

const generateTopicSuggestionFlow = ai.defineFlow(
  {
    name: 'generateTopicSuggestionFlow',
    inputSchema: GenerateTopicSuggestionInputSchema,
    outputSchema: GenerateTopicSuggestionOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
