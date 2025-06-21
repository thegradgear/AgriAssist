
'use server';
/**
 * @fileOverview A flow to validate if a search topic is related to agriculture.
 *
 * - validateSearchTopic - A function that validates a search query.
 * - ValidateSearchTopicInput - The input type for the validateSearchTopic function.
 * - ValidateSearchTopicOutput - The return type for the validateSearchTopic function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateSearchTopicInputSchema = z.object({
  searchQuery: z.string().describe('The user-provided search query to validate.'),
});
export type ValidateSearchTopicInput = z.infer<typeof ValidateSearchTopicInputSchema>;

const ValidateSearchTopicOutputSchema = z.object({
  isRelevant: z.boolean().describe('True if the topic is related to farming/agriculture, false otherwise.'),
  reasoning: z.string().describe('A brief explanation for the decision.'),
});
export type ValidateSearchTopicOutput = z.infer<typeof ValidateSearchTopicOutputSchema>;

export async function validateSearchTopic(input: ValidateSearchTopicInput): Promise<ValidateSearchTopicOutput> {
  return validateSearchTopicFlow(input);
}

const prompt = ai.definePrompt({
  name: 'validateSearchTopicPrompt',
  input: {schema: ValidateSearchTopicInputSchema},
  output: {schema: ValidateSearchTopicOutputSchema},
  prompt: `You are an intelligent content filter for an agricultural news application. Your primary role is to determine if a user's search query is STRICTLY relevant to the topics of farming, agriculture, crop science, horticulture, animal husbandry, agricultural technology (AgriTech), soil health, or sustainable farming practices.

The context is for farmers in India. While global agricultural news is relevant, topics unrelated to agriculture are not.

Analyze the following search query: "{{{searchQuery}}}"

- If the query is relevant to these topics, set 'isRelevant' to true.
- If the query is clearly not relevant, set 'isRelevant' to false.

BE VERY STRICT. For example:
- "Modern Farming": isRelevant: true. Reasoning: "Directly relates to agricultural techniques."
- "Water Harvesting": isRelevant: true. Reasoning: "Relates to water management in agriculture."
- "Japanese farming techniques": isRelevant: true. Reasoning: "Relates to global agricultural methods."
- "Anime": isRelevant: false. Reasoning: "This is about entertainment, not agriculture."
- "Seafood": isRelevant: false. Reasoning: "This is about aquaculture/fishing, which is distinct from land-based farming for this app."
- "Latest movies": isRelevant: false. Reasoning: "The query is unrelated to agriculture."

Provide a concise 'reasoning' for your decision.`,
});

const validateSearchTopicFlow = ai.defineFlow(
  {
    name: 'validateSearchTopicFlow',
    inputSchema: ValidateSearchTopicInputSchema,
    outputSchema: ValidateSearchTopicOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      // Fallback in case of an unexpected model failure. Assume not relevant as a safe default.
      return {
        isRelevant: false,
        reasoning: 'AI model could not determine the relevance of the topic.',
      };
    }
    return output;
  }
);
