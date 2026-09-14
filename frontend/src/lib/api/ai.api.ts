import { apiClient, unwrap } from './client';
import { aiMessageListSchema, aiMessageSchema } from '../schemas/ai.schema';

export async function fetchAiMessages() {
  const response = await apiClient.get('/ai/messages');
  return aiMessageListSchema.parse(unwrap(response));
}

export async function sendAiMessage(content: string) {
  const response = await apiClient.post('/ai/messages', { content });
  return aiMessageSchema.parse(unwrap(response));
}
