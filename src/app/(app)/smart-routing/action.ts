
'use server';

import { smartTaskRouting, SmartTaskRoutingOutput } from '@/ai/flows/smart-task-routing';
import { z } from 'zod';

const schema = z.object({
  taskContent: z.string().min(10, { message: 'Task content must be at least 10 characters long.' }),
});

type State = {
  success: boolean;
  message: string;
  data?: SmartTaskRoutingOutput;
};

export async function routeTaskAction(
  prevState: State,
  formData: FormData
): Promise<State> {
  const validatedFields = schema.safeParse({
    taskContent: formData.get('taskContent'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid form data. Please check your input.',
    };
  }

  try {
    const output = await smartTaskRouting(validatedFields.data);
    return {
      success: true,
      message: 'Task routed successfully.',
      data: output,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: 'An error occurred while routing the task.',
    };
  }
}
