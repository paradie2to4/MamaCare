import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { AiMessageRole } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { MothersService } from '../mothers/mothers.service';
import { PregnanciesService } from '../mothers/pregnancies.service';
import { getTrimester } from '../mothers/pregnancy-week.util';
import { buildSystemPrompt, PregnancyContext } from './ai.system-prompt';
import { generateFallbackReply } from './ai.fallback';

const HISTORY_MESSAGE_LIMIT = 20;
const DEFAULT_MODEL = 'claude-sonnet-5';
const MAX_RESPONSE_TOKENS = 1024;

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private anthropicClient: Anthropic | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mothersService: MothersService,
    private readonly pregnanciesService: PregnanciesService,
    private readonly configService: ConfigService,
  ) {}

  private getAnthropicClient(): Anthropic | null {
    const apiKey = this.configService.get<string>('AI_API_KEY');
    if (!apiKey) {
      return null;
    }
    if (!this.anthropicClient) {
      this.anthropicClient = new Anthropic({ apiKey });
    }
    return this.anthropicClient;
  }

  private async getOrCreateConversation(motherProfileId: string) {
    const existing = await this.prisma.aiConversation.findUnique({ where: { motherProfileId } });
    if (existing) {
      return existing;
    }
    return this.prisma.aiConversation.create({ data: { motherProfileId } });
  }

  async getHistory(userId: string) {
    const motherProfileId = await this.mothersService.getProfileIdOrThrow(userId);
    const conversation = await this.prisma.aiConversation.findUnique({
      where: { motherProfileId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    return conversation?.messages ?? [];
  }

  async sendMessage(userId: string, content: string) {
    const motherProfileId = await this.mothersService.getProfileIdOrThrow(userId);
    const conversation = await this.getOrCreateConversation(motherProfileId);

    await this.prisma.aiMessage.create({
      data: { conversationId: conversation.id, role: AiMessageRole.USER, content },
    });

    const history = await this.prisma.aiMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'desc' },
      take: HISTORY_MESSAGE_LIMIT,
    });
    const orderedHistory = history.reverse();

    const pregnancy = await this.pregnanciesService.getCurrentForUser(userId);
    const pregnancyContext: PregnancyContext | null = pregnancy
      ? { currentWeek: pregnancy.currentWeek, trimester: getTrimester(pregnancy.currentWeek) }
      : null;

    const replyContent = await this.generateReply(orderedHistory, pregnancyContext, content);

    return this.prisma.aiMessage.create({
      data: { conversationId: conversation.id, role: AiMessageRole.ASSISTANT, content: replyContent },
    });
  }

  private async generateReply(
    history: { role: AiMessageRole; content: string }[],
    pregnancyContext: PregnancyContext | null,
    latestMessage: string,
  ): Promise<string> {
    const client = this.getAnthropicClient();
    if (!client) {
      return generateFallbackReply(latestMessage);
    }

    try {
      const response = await client.messages.create({
        model: this.configService.get<string>('AI_MODEL') ?? DEFAULT_MODEL,
        max_tokens: MAX_RESPONSE_TOKENS,
        system: buildSystemPrompt(pregnancyContext),
        messages: history.map((message) => ({
          role: message.role === AiMessageRole.USER ? ('user' as const) : ('assistant' as const),
          content: message.content,
        })),
      });

      const textBlock = response.content.find((block) => block.type === 'text');
      if (!textBlock || textBlock.type !== 'text') {
        throw new Error('Anthropic response contained no text block.');
      }
      return textBlock.text;
    } catch (error) {
      this.logger.warn(`Anthropic API call failed: ${(error as Error)?.message}`);
      throw new ServiceUnavailableException(
        'The assistant is temporarily unavailable. Please try again shortly.',
      );
    }
  }
}
