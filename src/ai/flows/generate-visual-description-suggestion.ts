
'use server';
/**
 * @fileOverview An AI agent for generating image visual description suggestions based on partial user input.
 *
 * - generateVisualDescriptionSuggestion - A function that handles the suggestion generation.
 * - GenerateVisualDescriptionSuggestionInput - The input type for the function.
 * - GenerateVisualDescriptionSuggestionOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVisualDescriptionSuggestionInputSchema = z.object({
  partialVisualDescription: z.string().describe('The partial text typed by the user for an image visual description.'),
});
export type GenerateVisualDescriptionSuggestionInput = z.infer<typeof GenerateVisualDescriptionSuggestionInputSchema>;

const GenerateVisualDescriptionSuggestionOutputSchema = z.object({
  suggestedVisualDescription: z.string().describe('A single, concise, and relevant suggested completion or enhancement for the partial visual description. This should be the complete proposed visual description string.'),
});
export type GenerateVisualDescriptionSuggestionOutput = z.infer<typeof GenerateVisualDescriptionSuggestionOutputSchema>;

export async function generateVisualDescriptionSuggestion(input: GenerateVisualDescriptionSuggestionInput): Promise<GenerateVisualDescriptionSuggestionOutput> {
  return generateVisualDescriptionSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateVisualDescriptionSuggestionPrompt',
  input: {schema: GenerateVisualDescriptionSuggestionInputSchema},
  output: {schema: GenerateVisualDescriptionSuggestionOutputSchema},
  prompt: `You are an AI assistant that provides text suggestions for image visual descriptions.
Given the user is typing the following for an image visual description: "{{{partialVisualDescription}}}"

Provide a single, concise, and relevant suggestion to complete or enhance this visual description.
Your output should be the *complete* proposed visual description string.
For example:
- If the input is "a cat sitting on a", you might suggest "a cat sitting on a windowsill, bathed in sunlight".
- If input is "futuristic city", suggest "futuristic city skyline at night with flying vehicles".
- If input is "portrait of a woman with", suggest "portrait of a woman with flowing red hair, fantasy art style".
- If input is "serene beach", suggest "serene beach at sunset with gentle waves".

Ensure the suggestion is directly related and adds detail, atmosphere, or a specific visual element.
Output only the suggested visual description in the 'suggestedVisualDescription' field.
  `,
});

const generateVisualDescriptionSuggestionFlow = ai.defineFlow(
  {
    name: 'generateVisualDescriptionSuggestionFlow',
    inputSchema: GenerateVisualDescriptionSuggestionInputSchema,
    outputSchema: GenerateVisualDescriptionSuggestionOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
