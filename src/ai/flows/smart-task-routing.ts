'use server';

/**
 * @fileOverview An AI agent for smart task routing.
 *
 * - smartTaskRouting - A function that routes tasks to the appropriate department or worker.
 * - SmartTaskRoutingInput - The input type for the smartTaskRouting function.
 * - SmartTaskRoutingOutput - The return type for the smartTaskRouting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartTaskRoutingInputSchema = z.object({
  taskContent: z
    .string()
    .describe('The content of the task or notification to be routed.'),
});
export type SmartTaskRoutingInput = z.infer<typeof SmartTaskRoutingInputSchema>;

const SmartTaskRoutingOutputSchema = z.object({
  recipient: z
    .string()
    .describe(
      'The department or worker to whom the task or notification should be routed.'
    ),
  reason: z.string().describe('The reasoning behind the routing decision.'),
});
export type SmartTaskRoutingOutput = z.infer<typeof SmartTaskRoutingOutputSchema>;

export async function smartTaskRouting(
  input: SmartTaskRoutingInput
): Promise<SmartTaskRoutingOutput> {
  return smartTaskRoutingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartTaskRoutingPrompt',
  input: {schema: SmartTaskRoutingInputSchema},
  output: {schema: SmartTaskRoutingOutputSchema},
  prompt: `You are an expert task router, responsible for directing tasks and notifications to the correct department or worker within a hospital.

  Given the content of the task, determine the most appropriate recipient (department or worker) and explain your reasoning.

  Task Content: {{{taskContent}}}
  `,
});

const smartTaskRoutingFlow = ai.defineFlow(
  {
    name: 'smartTaskRoutingFlow',
    inputSchema: SmartTaskRoutingInputSchema,
    outputSchema: SmartTaskRoutingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
