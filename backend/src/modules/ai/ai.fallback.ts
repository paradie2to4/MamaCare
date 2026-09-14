import { findBestMatchingTopic, GENERIC_FALLBACK_CONTENT } from './ai.knowledge-base';

/**
 * Deterministic, keyword-matched reply used when AI_API_KEY is not configured — keeps the
 * assistant fully functional (and testable with zero external calls) before an LLM key
 * is available.
 */
export function generateFallbackReply(userMessage: string): string {
  const topic = findBestMatchingTopic(userMessage);
  return topic?.content ?? GENERIC_FALLBACK_CONTENT;
}
