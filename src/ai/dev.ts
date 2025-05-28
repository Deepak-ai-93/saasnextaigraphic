
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-post-content.ts';
import '@/ai/flows/generate-post-image.ts';
import '@/ai/flows/generate-overlay-hook.ts';
import '@/ai/flows/generate-weekly-content-plan.ts';
import '@/ai/flows/generate-topic-suggestion.ts';
import '@/ai/flows/generate-visual-description-suggestion.ts'; // Added new flow
