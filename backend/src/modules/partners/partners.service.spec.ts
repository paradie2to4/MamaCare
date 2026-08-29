import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PartnerLinkStatus, Role } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AppointmentsService } from '../appointments/appointments.service';
import { MothersService } from '../mothers/mothers.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PartnersService } from './partners.service';

describe('PartnersService', () => {
  let service: PartnersService;
  let prisma: {
    partnerLink: { findFirst: jest.Mock; create: jest.Mock; update: jest.Mock };
    user: { findUnique: jest.Mock };
  };
  let mothersService: { getProfileIdOrThrow: jest.Mock };
  let appointmentsService: { getNextAppointmentSummary: jest.Mock };
  let notificationsService: { createForUser: jest.Mock };

  beforeEach(async () => {
    prisma = {
      partnerLink: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
      user: { findUnique: jest.fn() },
    };
    mothersService = { getProfileIdOrThrow: jest.fn() };
    appointmentsService = { getNextAppointmentSummary: jest.fn() };
    notificationsService = { createForUser: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        PartnersService,
        { provide: PrismaService, useValue: prisma },
        { provide: MothersService, useValue: mothersService },
        { provide: AppointmentsService, useValue: appointmentsService },
        { provide: NotificationsService, useValue: notificationsService },
      ],
    }).compile();

    service = moduleRef.get(PartnersService);
  });

  describe('invite', () => {
    it('rejects when the mother already has a pending/active link', async () => {
      mothersService.getProfileIdOrThrow.mockResolvedValue('mother-profile-A');
      prisma.partnerLink.findFirst.mockResolvedValueOnce({ id: 'link-1' });

      await expect(service.invite('user-A', 'partner@example.com')).rejects.toThrow(
        ConflictException,
      );
    });

    it('rejects an email with no matching account', async () => {
      mothersService.getProfileIdOrThrow.mockResolvedValue('mother-profile-A');
      prisma.partnerLink.findFirst.mockResolvedValueOnce(null);
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.invite('user-A', 'nobody@example.com')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('rejects inviting an account that is not a PARTNER', async () => {
      mothersService.getProfileIdOrThrow.mockResolvedValue('mother-profile-A');
      prisma.partnerLink.findFirst.mockResolvedValueOnce(null);
      prisma.user.findUnique.mockResolvedValue({ id: 'user-X', role: Role.CHW });

      await expect(service.invite('user-A', 'chw@example.com')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejects inviting a partner already linked elsewhere', async () => {
      mothersService.getProfileIdOrThrow.mockResolvedValue('mother-profile-A');
      prisma.partnerLink.findFirst
        .mockResolvedValueOnce(null) // mother has no existing link
        .mockResolvedValueOnce({ id: 'link-existing' }); // partner already linked
      prisma.user.findUnique.mockResolvedValue({
        id: 'partner-1',
        role: Role.PARTNER,
        email: 'p@example.com',
      });

      await expect(service.invite('user-A', 'p@example.com')).rejects.toThrow(ConflictException);
    });

    it('creates a PENDING link and notifies the partner', async () => {
      mothersService.getProfileIdOrThrow.mockResolvedValue('mother-profile-A');
      prisma.partnerLink.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      prisma.user.findUnique.mockResolvedValue({
        id: 'partner-1',
        role: Role.PARTNER,
        firstName: 'Eric',
        lastName: 'Habimana',
        email: 'p@example.com',
      });
      prisma.partnerLink.create.mockResolvedValue({
        id: 'link-new',
        status: PartnerLinkStatus.PENDING,
      });

      await service.invite('user-A', 'p@example.com');

      expect(prisma.partnerLink.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            partnerUserId: 'partner-1',
            motherProfileId: 'mother-profile-A',
            status: PartnerLinkStatus.PENDING,
          }),
        }),
      );
      expect(notificationsService.createForUser).toHaveBeenCalledWith(
        'partner-1',
        expect.anything(),
        expect.any(String),
        expect.any(String),
      );
    });
  });

  describe('getDashboardAsPartner', () => {
    it("scopes the query to the requesting partner, never returning another partner's link", async () => {
      prisma.partnerLink.findFirst.mockResolvedValue(null);

      const result = await service.getDashboardAsPartner('partner-A');

      expect(prisma.partnerLink.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ partnerUserId: 'partner-A' }) }),
      );
      expect(result.status).toBe('NONE');
    });

    it('returns only firstName/lastName/nextAppointment for an ACTIVE link, never the full profile', async () => {
      prisma.partnerLink.findFirst.mockResolvedValue({
        id: 'link-1',
        status: PartnerLinkStatus.ACTIVE,
        motherProfileId: 'mother-profile-A',
        motherProfile: { user: { firstName: 'Grace', lastName: 'Uwase' } },
      });
      appointmentsService.getNextAppointmentSummary.mockResolvedValue({
        type: 'ANC_VISIT',
        scheduledAt: new Date(),
        facilityName: 'Kacyiru Health Center',
        status: 'SCHEDULED',
      });

      const result = await service.getDashboardAsPartner('partner-A');

      expect(result).toEqual({
        status: 'ACTIVE',
        mother: { firstName: 'Grace', lastName: 'Uwase' },
        nextAppointment: {
          type: 'ANC_VISIT',
          scheduledAt: expect.any(Date),
          facilityName: 'Kacyiru Health Center',
          status: 'SCHEDULED',
        },
      });
    });

    it('does not fetch the next appointment while the link is still PENDING', async () => {
      prisma.partnerLink.findFirst.mockResolvedValue({
        id: 'link-1',
        status: PartnerLinkStatus.PENDING,
        motherProfileId: 'mother-profile-A',
        motherProfile: { user: { firstName: 'Grace', lastName: 'Uwase' } },
      });

      const result = await service.getDashboardAsPartner('partner-A');

      expect(appointmentsService.getNextAppointmentSummary).not.toHaveBeenCalled();
      expect(result.nextAppointment).toBeNull();
    });
  });

  describe('revokeAsMother', () => {
    it('throws when there is no active/pending link to revoke', async () => {
      mothersService.getProfileIdOrThrow.mockResolvedValue('mother-profile-A');
      prisma.partnerLink.findFirst.mockResolvedValue(null);

      await expect(service.revokeAsMother('user-A')).rejects.toThrow(NotFoundException);
    });
  });
});
