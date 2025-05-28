
'use server';
/**
 * @fileOverview AI flow for generating a 7-day social media content plan.
 *
 * - generateWeeklyContentPlan - A function that handles the weekly content plan generation.
 * - GenerateWeeklyContentPlanInput - The input type for the function.
 * - GenerateWeeklyContentPlanOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const companyTypeOptions = [
  "B2C (Business-to-Consumer)", 
  "B2B (Business-to-Business)", 
  "Non-profit", 
  "Personal Brand", 
  "E-commerce", 
  "Service Provider", 
  "Local Business",
  "Startup",
  "Educational Institution",
  "Content Creator"
];

const postGoalOptions = [
  "Increase Brand Awareness", 
  "Drive Website Traffic", 
  "Generate Leads", 
  "Boost Engagement", 
  "Promote Product/Service", 
  "Build Community",
  "Educate Audience",
  "Entertain Audience"
];

const GenerateWeeklyContentPlanInputSchema = z.object({
  companyDescription: z.string().describe('A detailed description of the company, its mission, values, and unique selling propositions.'),
  companyType: z.string().describe(`The type of company. Options could include: ${companyTypeOptions.join(', ')}.`),
  mainNiche: z.string().describe('The primary niche or industry the company operates in.'),
  targetAudience: z.string().optional().describe('A description of the ideal target audience (e.g., demographics, interests, pain points).'),
  postGoal: z.string().optional().describe(`The primary goal for the social media posts for the week. Options could include: ${postGoalOptions.join(', ')}. If not specified, aim for a balanced mix.`),
});
export type GenerateWeeklyContentPlanInput = z.infer<typeof GenerateWeeklyContentPlanInputSchema>;

const DailyPostPlanSchema = z.object({
  dayOfWeek: z.string().describe('The day of the week (e.g., Monday, Tuesday).'),
  postTopic: z.string().describe('A specific, engaging topic for the post for this day.'),
  postType: z.string().describe('The suggested type of post (e.g., Educational, Q&A, Behind-the-Scenes, Tip, Promotional, Story, Meme, Poll, Contest). Aim for variety throughout the week.'),
  nicheFocus: z.string().describe('A specific angle or sub-niche related to the mainNiche, tailored for this day\'s post to provide variety.'),
  contentOutline: z.string().describe('A brief 2-3 bullet point outline for the post\'s key message or structure. Use Markdown for bullet points (e.g., "- Point 1\\n- Point 2").'),
  suggestedHook: z.string().describe('A short, catchy hook or quote (max 10-15 words) suitable for overlaying on an image for this post.'),
  visualSuggestion: z.string().describe('A brief idea for the image visual (e.g., "Product in action shot", "Happy customer photo", "Relevant infographic snippet", "Team member highlight").'),
});

const GenerateWeeklyContentPlanOutputSchema = z.object({
  weeklyPlan: z.array(DailyPostPlanSchema).length(7).describe('An array of 7 daily post plans, covering Monday to Sunday.'),
});
export type GenerateWeeklyContentPlanOutput = z.infer<typeof GenerateWeeklyContentPlanOutputSchema>;

export async function generateWeeklyContentPlan(input: GenerateWeeklyContentPlanInput): Promise<GenerateWeeklyContentPlanOutput> {
  return generateWeeklyContentPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWeeklyContentPlanPrompt',
  input: {schema: GenerateWeeklyContentPlanInputSchema},
  output: {schema: GenerateWeeklyContentPlanOutputSchema},
  prompt: `You are an expert social media content strategist and copywriter. Your task is to generate a comprehensive 7-day social media content plan (Monday to Sunday) based on the provided company information.

Company Information:
- Description: {{{companyDescription}}}
- Company Type: {{{companyType}}}
- Main Niche: {{{mainNiche}}}
{{#if targetAudience}}- Target Audience: {{{targetAudience}}}{{/if}}
{{#if postGoal}}- Weekly Post Goal: {{{postGoal}}}{{else}}- Weekly Post Goal: Aim for a balanced mix of engagement, brand awareness, and value provision.{{/if}}

For each of the 7 days, you must provide the following details:
1.  **dayOfWeek**: The day of the week (e.g., "Monday").
2.  **postTopic**: A specific and engaging topic relevant to the company and its audience.
3.  **postType**: Suggest a suitable post type. Aim for a diverse mix throughout the week (e.g., Educational, Tip, Q&A, Behind-the-Scenes, Promotional, User-Generated Content Feature, Story, Meme, Poll, Contest, Thought Leadership).
4.  **nicheFocus**: A specific angle or sub-topic within the mainNiche to explore for that day. This should help add variety and depth to the weekly content.
5.  **contentOutline**: A concise 2-3 bullet point outline detailing the key messages or structure for the post. Format as Markdown bullet points.
6.  **suggestedHook**: A very short, catchy hook or quote (max 10-15 words) that could be overlaid on an image for this post.
7.  **visualSuggestion**: A brief, actionable idea for the visual content (image or video) accompanying the post.

Ensure the entire plan is cohesive and aligns with the company's identity and goals. The plan should provide a good mix of content to keep the audience engaged and interested throughout the week. Structure the output as a JSON object with a single key "weeklyPlan" containing an array of 7 daily plan objects.
Example for one day's contentOutline: "- Highlight feature X\\n- Explain benefit Y\\n- Call to action Z"
Make sure each day's plan is distinct and contributes to a well-rounded weekly strategy.
`,
});

const generateWeeklyContentPlanFlow = ai.defineFlow(
  {
    name: 'generateWeeklyContentPlanFlow',
    inputSchema: GenerateWeeklyContentPlanInputSchema,
    outputSchema: GenerateWeeklyContentPlanOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output || !output.weeklyPlan || output.weeklyPlan.length !== 7) {
      throw new Error('AI failed to generate a valid 7-day weekly plan.');
    }
    // Ensure days are in order if AI doesn't guarantee it (though prompt asks for Mon-Sun)
    const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    output.weeklyPlan.sort((a, b) => daysOrder.indexOf(a.dayOfWeek) - daysOrder.indexOf(b.dayOfWeek));
    
    return output;
  }
);
