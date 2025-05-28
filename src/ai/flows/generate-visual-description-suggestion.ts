
'use server';
/**
 * @fileOverview An AI agent for generating image visual description suggestions based on partial user input,
 * specifically tailored to help craft effective prompts for AI image generators.
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
  suggestedVisualDescription: z.string().describe('A single, concise, and relevant suggested completion or enhancement for the partial visual description. This should be the complete proposed visual description string, aimed at improving an AI image generation prompt.'),
});
export type GenerateVisualDescriptionSuggestionOutput = z.infer<typeof GenerateVisualDescriptionSuggestionOutputSchema>;

export async function generateVisualDescriptionSuggestion(input: GenerateVisualDescriptionSuggestionInput): Promise<GenerateVisualDescriptionSuggestionOutput> {
  return generateVisualDescriptionSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateVisualDescriptionSuggestionPrompt',
  input: {schema: GenerateVisualDescriptionSuggestionInputSchema},
  output: {schema: GenerateVisualDescriptionSuggestionOutputSchema},
  prompt: `You are an AI assistant that provides text suggestions to help users craft effective prompts for AI image generators.
Given the user is typing the following for an image visual description: "{{{partialVisualDescription}}}"

Provide a single, concise, and relevant suggestion to complete or enhance this visual description.
Your output should be the *complete* proposed visual description string.
The suggestion should aim to make the prompt more vivid and effective for an AI image generator by adding specific details, describing atmosphere, suggesting visual elements, or hinting at artistic styles.

For example:
- If the input is "a cat sitting on a", you might suggest "a cat sitting on a windowsill, bathed in sunlight, photorealistic".
- If input is "futuristic city", suggest "futuristic city skyline at night with flying vehicles, cyberpunk aesthetic".
- If input is "portrait of a woman with", suggest "portrait of a woman with flowing red hair, fantasy art style, intricate details".
- If input is "serene beach", suggest "serene beach at sunset with gentle waves and long shadows, impressionistic painting".

Ensure the suggestion is directly related and enhances the potential for a detailed and specific image generation.
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

