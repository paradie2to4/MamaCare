import { z } from 'zod';

export const aiMessageRoleSchema = z.enum(['USER', 'ASSISTANT']);

export const aiMessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  role: aiMessageRoleSchema,
  content: z.string(),
  createdAt: z.string(),
});

export const aiMessageListSchema = z.array(aiMessageSchema);
