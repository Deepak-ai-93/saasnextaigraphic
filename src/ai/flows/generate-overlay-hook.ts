
'use server';
/**
 * @fileOverview An AI agent for generating short, catchy overlay text (hooks) for social media images.
 *
 * - generateOverlayHook - A function that handles the hook generation process.
 * - GenerateOverlayHookInput - The input type for the generateOverlayHook function.
 * - GenerateOverlayHookOutput - The return type for the generateOverlayHook function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateOverlayHookInputSchema = z.object({
  postTopic: z.string().describe('The main topic or idea of the social media post.'),
  niche: z.string().describe('The niche of the post (e.g., Food, Travel, Technology).'),
  category: z.string().describe('The category of the post (e.g., Recipe, Landscape, Product Review).'),
  postType: z.string().optional().describe('The type of post (e.g., Tips, Educational, Promotional).'),
});
export type GenerateOverlayHookInput = z.infer<typeof GenerateOverlayHookInputSchema>;

const GenerateOverlayHookOutputSchema = z.object({
  hookText: z.string().describe('A short, catchy hook or quote (max 10-15 words) suitable for overlaying on an image. This text should be engaging and directly related to the post topic, niche, category, and type.'),
});
export type GenerateOverlayHookOutput = z.infer<typeof GenerateOverlayHookOutputSchema>;

export async function generateOverlayHook(input: GenerateOverlayHookInput): Promise<GenerateOverlayHookOutput> {
  return generateOverlayHookFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateOverlayHookPrompt',
  input: {schema: GenerateOverlayHookInputSchema},
  output: {schema: GenerateOverlayHookOutputSchema},
  prompt: `You are an AI assistant specializing in crafting short, engaging hooks or quotes for social media images.
Given the following details about a social media post:
- Topic/Idea: {{{postTopic}}}
- Niche: {{{niche}}}
- Category: {{{category}}}
{{#if postType}}- Post Type: {{{postType}}}{{/if}}

Generate a concise (maximum 10-15 words) and captivating text (a hook or a short quote) that would be highly effective when overlaid directly on an image for this post.
The text should be directly relevant, attention-grabbing, and enhance the visual message of the image.
Do not include quotation marks in the output unless they are part of the hook itself.
Output only the hook text.
  `,
});

const generateOverlayHookFlow = ai.defineFlow(
  {
    name: 'generateOverlayHookFlow',
    inputSchema: GenerateOverlayHookInputSchema,
    outputSchema: GenerateOverlayHookOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
