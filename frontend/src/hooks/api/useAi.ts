import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as aiApi from '../../lib/api/ai.api';
import { aiKeys } from '../../lib/query/keys';
import type { AiMessage } from '../../types';

export function useAiMessages() {
  return useQuery({
    queryKey: aiKeys.messages,
    queryFn: aiApi.fetchAiMessages,
  });
}

export function useSendAiMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => aiApi.sendAiMessage(content),
    onMutate: async (content: string) => {
      await queryClient.cancelQueries({ queryKey: aiKeys.messages });
      const previous = queryClient.getQueryData<AiMessage[]>(aiKeys.messages);

      const optimisticMessage: AiMessage = {
        id: `optimistic-${Date.now()}`,
        conversationId: 'optimistic',
        role: 'USER',
        content,
        createdAt: new Date().toISOString(),
      };
      queryClient.setQueryData<AiMessage[]>(aiKeys.messages, (existing) => [
        ...(existing ?? []),
        optimisticMessage,
      ]);

      return { previous };
    },
    onError: (_error, _content, context) => {
      if (context?.previous) {
        queryClient.setQueryData(aiKeys.messages, context.previous);
      }
    },
    onSuccess: (assistantMessage) => {
      queryClient.setQueryData<AiMessage[]>(aiKeys.messages, (existing) => [
        ...(existing ?? []),
        assistantMessage,
      ]);
    },
  });
}
