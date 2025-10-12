'use server';

/**
 * @fileOverview A real-time word count AI agent.
 *
 * - realTimeWordCount - A function that handles the word count process.
 * - RealTimeWordCountInput - The input type for the realTimeWordCount function.
 * - RealTimeWordCountOutput - The return type for the realTimeWordCount function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RealTimeWordCountInputSchema = z.object({
  text: z.string().describe('The text to count words from.'),
});
export type RealTimeWordCountInput = z.infer<typeof RealTimeWordCountInputSchema>;

const RealTimeWordCountOutputSchema = z.object({
  wordCount: z.number().describe('The number of words in the text.'),
});
export type RealTimeWordCountOutput = z.infer<typeof RealTimeWordCountOutputSchema>;

export async function realTimeWordCount(input: RealTimeWordCountInput): Promise<RealTimeWordCountOutput> {
  return realTimeWordCountFlow(input);
}

const prompt = ai.definePrompt({
  name: 'realTimeWordCountPrompt',
  input: {schema: RealTimeWordCountInputSchema},
  output: {schema: RealTimeWordCountOutputSchema},
  prompt: `You are a word counter. Count the number of words in the following text and return the number.

Text: {{{text}}}`,
});

const realTimeWordCountFlow = ai.defineFlow(
  {
    name: 'realTimeWordCountFlow',
    inputSchema: RealTimeWordCountInputSchema,
    outputSchema: RealTimeWordCountOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
