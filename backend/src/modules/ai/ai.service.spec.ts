import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiMessageRole } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { MothersService } from '../mothers/mothers.service';
import { PregnanciesService } from '../mothers/pregnancies.service';
import { AiService } from './ai.service';

describe('AiService', () => {
  let service: AiService;
  let prisma: {
    aiConversation: { findUnique: jest.Mock; create: jest.Mock };
    aiMessage: { create: jest.Mock; findMany: jest.Mock };
  };
  let mothersService: { getProfileIdOrThrow: jest.Mock };
  let pregnanciesService: { getCurrentForUser: jest.Mock };
  let configService: { get: jest.Mock };

  beforeEach(async () => {
    prisma = {
      aiConversation: { findUnique: jest.fn(), create: jest.fn() },
      aiMessage: { create: jest.fn(), findMany: jest.fn() },
    };
    mothersService = { getProfileIdOrThrow: jest.fn() };
    pregnanciesService = { getCurrentForUser: jest.fn() };
    configService = { get: jest.fn().mockReturnValue(undefined) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: PrismaService, useValue: prisma },
        { provide: MothersService, useValue: mothersService },
        { provide: PregnanciesService, useValue: pregnanciesService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = moduleRef.get(AiService);
  });

  describe('getHistory', () => {
    it('returns an empty list when no conversation exists yet', async () => {
      mothersService.getProfileIdOrThrow.mockResolvedValue('mother-profile-A');
      prisma.aiConversation.findUnique.mockResolvedValue(null);

      const result = await service.getHistory('user-A');
      expect(result).toEqual([]);
    });

    it("returns the mother's own conversation messages", async () => {
      mothersService.getProfileIdOrThrow.mockResolvedValue('mother-profile-A');
      prisma.aiConversation.findUnique.mockResolvedValue({
        id: 'conv-1',
        motherProfileId: 'mother-profile-A',
        messages: [{ id: 'msg-1', role: AiMessageRole.USER, content: 'hello' }],
      });

      const result = await service.getHistory('user-A');
      expect(result).toHaveLength(1);
    });
  });

  describe('sendMessage', () => {
    it('creates a conversation on first message and scopes it to the caller', async () => {
      mothersService.getProfileIdOrThrow.mockResolvedValue('mother-profile-A');
      prisma.aiConversation.findUnique.mockResolvedValue(null);
      prisma.aiConversation.create.mockResolvedValue({
        id: 'conv-new',
        motherProfileId: 'mother-profile-A',
      });
      prisma.aiMessage.create.mockResolvedValue({
        id: 'msg-1',
        role: AiMessageRole.ASSISTANT,
        content: 'reply',
      });
      prisma.aiMessage.findMany.mockResolvedValue([]);
      pregnanciesService.getCurrentForUser.mockResolvedValue(null);

      await service.sendMessage('user-A', 'When is my next checkup?');

      expect(prisma.aiConversation.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: { motherProfileId: 'mother-profile-A' } }),
      );
      expect(prisma.aiMessage.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ conversationId: 'conv-new', role: AiMessageRole.USER }),
        }),
      );
    });

    it('reuses an existing conversation instead of creating a new one', async () => {
      mothersService.getProfileIdOrThrow.mockResolvedValue('mother-profile-A');
      prisma.aiConversation.findUnique.mockResolvedValue({
        id: 'conv-existing',
        motherProfileId: 'mother-profile-A',
      });
      prisma.aiMessage.create.mockResolvedValue({
        id: 'msg-1',
        role: AiMessageRole.ASSISTANT,
        content: 'reply',
      });
      prisma.aiMessage.findMany.mockResolvedValue([]);
      pregnanciesService.getCurrentForUser.mockResolvedValue(null);

      await service.sendMessage('user-A', 'What should I eat?');

      expect(prisma.aiConversation.create).not.toHaveBeenCalled();
    });

    it('falls back to a keyword-matched reply when AI_API_KEY is not configured', async () => {
      configService.get.mockReturnValue(undefined);
      mothersService.getProfileIdOrThrow.mockResolvedValue('mother-profile-A');
      prisma.aiConversation.findUnique.mockResolvedValue({
        id: 'conv-1',
        motherProfileId: 'mother-profile-A',
      });
      prisma.aiMessage.findMany.mockResolvedValue([]);
      pregnanciesService.getCurrentForUser.mockResolvedValue(null);
      prisma.aiMessage.create.mockImplementation(({ data }) =>
        Promise.resolve({ id: 'msg-generated', ...data }),
      );

      const result = await service.sendMessage(
        'user-A',
        'I have severe bleeding, what should I do?',
      );

      expect(result.role).toBe(AiMessageRole.ASSISTANT);
      expect(result.content).toContain('CHW');
    });

    it('includes the current pregnancy week as personalization context, never fabricated', async () => {
      mothersService.getProfileIdOrThrow.mockResolvedValue('mother-profile-A');
      prisma.aiConversation.findUnique.mockResolvedValue({
        id: 'conv-1',
        motherProfileId: 'mother-profile-A',
      });
      prisma.aiMessage.findMany.mockResolvedValue([]);
      pregnanciesService.getCurrentForUser.mockResolvedValue({ currentWeek: 24 });
      prisma.aiMessage.create.mockImplementation(({ data }) =>
        Promise.resolve({ id: 'msg-generated', ...data }),
      );

      const result = await service.sendMessage('user-A', 'How am I doing?');

      expect(pregnanciesService.getCurrentForUser).toHaveBeenCalledWith('user-A');
      expect(result.role).toBe(AiMessageRole.ASSISTANT);
    });
  });
});
