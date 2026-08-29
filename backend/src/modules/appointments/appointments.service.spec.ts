import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppointmentStatus, AppointmentType, Role } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EventsPublisherService } from '../../rabbitmq/events-publisher.service';
import { MothersService } from '../mothers/mothers.service';
import { AppointmentsService } from './appointments.service';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let prisma: {
    appointment: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      findFirst: jest.Mock;
    };
  };
  let mothersService: { getProfileIdOrThrow: jest.Mock };
  let eventsPublisher: {
    publishAppointmentCreated: jest.Mock;
    publishAppointmentMissed: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      appointment: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findFirst: jest.fn(),
      },
    };
    mothersService = {
      getProfileIdOrThrow: jest.fn(),
    };
    eventsPublisher = {
      publishAppointmentCreated: jest.fn(),
      publishAppointmentMissed: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        { provide: PrismaService, useValue: prisma },
        { provide: MothersService, useValue: mothersService },
        { provide: EventsPublisherService, useValue: eventsPublisher },
      ],
    }).compile();

    service = moduleRef.get(AppointmentsService);
  });

  it("denies mother A access to mother B's appointment", async () => {
    // Mother A is authenticated and resolves to her own profile...
    mothersService.getProfileIdOrThrow.mockResolvedValue('mother-profile-A');
    // ...but the requested appointment belongs to mother B's profile.
    prisma.appointment.findUnique.mockResolvedValue({
      id: 'appt-1',
      motherProfileId: 'mother-profile-B',
      status: AppointmentStatus.SCHEDULED,
    });

    await expect(service.getOne('user-A', Role.MOTHER, 'appt-1')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('throws NotFoundException for a nonexistent appointment', async () => {
    mothersService.getProfileIdOrThrow.mockResolvedValue('mother-profile-A');
    prisma.appointment.findUnique.mockResolvedValue(null);

    await expect(service.getOne('user-A', Role.MOTHER, 'missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('allows a mother to read her own appointment', async () => {
    mothersService.getProfileIdOrThrow.mockResolvedValue('mother-profile-A');
    prisma.appointment.findUnique.mockResolvedValue({
      id: 'appt-1',
      motherProfileId: 'mother-profile-A',
      status: AppointmentStatus.SCHEDULED,
    });

    const result = await service.getOne('user-A', Role.MOTHER, 'appt-1');
    expect(result.id).toBe('appt-1');
  });

  it('rejects non-MOTHER roles until Phase 2 adds support', async () => {
    await expect(service.list('user-chw', Role.CHW)).rejects.toThrow(ForbiddenException);
  });

  it('scopes appointment creation to the caller own profile', async () => {
    mothersService.getProfileIdOrThrow.mockResolvedValue('mother-profile-A');
    prisma.appointment.create.mockResolvedValue({
      id: 'appt-new',
      type: AppointmentType.ANC_VISIT,
      scheduledAt: new Date(),
      facilityName: 'Kacyiru Health Center',
    });

    await service.create('user-A', Role.MOTHER, {
      type: AppointmentType.ANC_VISIT,
      scheduledAt: new Date().toISOString(),
      facilityName: 'Kacyiru Health Center',
    });

    expect(prisma.appointment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          motherProfileId: 'mother-profile-A',
          createdByUserId: 'user-A',
        }),
      }),
    );
  });

  it('publishes an appointment.created event on create()', async () => {
    mothersService.getProfileIdOrThrow.mockResolvedValue('mother-profile-A');
    prisma.appointment.create.mockResolvedValue({
      id: 'appt-new',
      type: AppointmentType.ANC_VISIT,
      scheduledAt: new Date('2026-09-01T10:00:00Z'),
      facilityName: 'Kacyiru Health Center',
    });

    await service.create('user-A', Role.MOTHER, {
      type: AppointmentType.ANC_VISIT,
      scheduledAt: '2026-09-01T10:00:00Z',
      facilityName: 'Kacyiru Health Center',
    });

    expect(eventsPublisher.publishAppointmentCreated).toHaveBeenCalledWith(
      expect.objectContaining({ appointmentId: 'appt-new', motherUserId: 'user-A' }),
    );
  });

  it('still succeeds and returns the created appointment when the event publisher throws', async () => {
    mothersService.getProfileIdOrThrow.mockResolvedValue('mother-profile-A');
    prisma.appointment.create.mockResolvedValue({
      id: 'appt-new',
      type: AppointmentType.ANC_VISIT,
      scheduledAt: new Date(),
      facilityName: 'Kacyiru Health Center',
    });
    eventsPublisher.publishAppointmentCreated.mockImplementation(() => {
      throw new Error('broker unavailable');
    });

    const result = await service.create('user-A', Role.MOTHER, {
      type: AppointmentType.ANC_VISIT,
      scheduledAt: new Date().toISOString(),
      facilityName: 'Kacyiru Health Center',
    });

    expect(result.id).toBe('appt-new');
  });

  describe('updateStatus', () => {
    it('publishes appointment.missed only on a genuine transition into MISSED', async () => {
      mothersService.getProfileIdOrThrow.mockResolvedValue('mother-profile-A');
      prisma.appointment.findUnique.mockResolvedValue({
        id: 'appt-1',
        motherProfileId: 'mother-profile-A',
        status: AppointmentStatus.SCHEDULED,
      });
      prisma.appointment.update.mockResolvedValue({
        id: 'appt-1',
        motherProfileId: 'mother-profile-A',
        status: AppointmentStatus.MISSED,
      });

      await service.updateStatus('user-A', Role.MOTHER, 'appt-1', AppointmentStatus.MISSED);

      expect(eventsPublisher.publishAppointmentMissed).toHaveBeenCalledWith(
        expect.objectContaining({ appointmentId: 'appt-1', motherProfileId: 'mother-profile-A' }),
      );
    });

    it('does not re-publish appointment.missed on an idempotent re-PATCH', async () => {
      mothersService.getProfileIdOrThrow.mockResolvedValue('mother-profile-A');
      prisma.appointment.findUnique.mockResolvedValue({
        id: 'appt-1',
        motherProfileId: 'mother-profile-A',
        status: AppointmentStatus.MISSED,
      });
      prisma.appointment.update.mockResolvedValue({
        id: 'appt-1',
        motherProfileId: 'mother-profile-A',
        status: AppointmentStatus.MISSED,
      });

      await service.updateStatus('user-A', Role.MOTHER, 'appt-1', AppointmentStatus.MISSED);

      expect(eventsPublisher.publishAppointmentMissed).not.toHaveBeenCalled();
    });

    it('still succeeds and returns the updated appointment when the event publisher throws', async () => {
      mothersService.getProfileIdOrThrow.mockResolvedValue('mother-profile-A');
      prisma.appointment.findUnique.mockResolvedValue({
        id: 'appt-1',
        motherProfileId: 'mother-profile-A',
        status: AppointmentStatus.SCHEDULED,
      });
      prisma.appointment.update.mockResolvedValue({
        id: 'appt-1',
        motherProfileId: 'mother-profile-A',
        status: AppointmentStatus.MISSED,
      });
      eventsPublisher.publishAppointmentMissed.mockImplementation(() => {
        throw new Error('broker unavailable');
      });

      const result = await service.updateStatus(
        'user-A',
        Role.MOTHER,
        'appt-1',
        AppointmentStatus.MISSED,
      );

      expect(result.status).toBe(AppointmentStatus.MISSED);
    });

    it('does not publish appointment.missed for a non-MISSED status change', async () => {
      mothersService.getProfileIdOrThrow.mockResolvedValue('mother-profile-A');
      prisma.appointment.findUnique.mockResolvedValue({
        id: 'appt-1',
        motherProfileId: 'mother-profile-A',
        status: AppointmentStatus.SCHEDULED,
      });
      prisma.appointment.update.mockResolvedValue({
        id: 'appt-1',
        motherProfileId: 'mother-profile-A',
        status: AppointmentStatus.COMPLETED,
      });

      await service.updateStatus('user-A', Role.MOTHER, 'appt-1', AppointmentStatus.COMPLETED);

      expect(eventsPublisher.publishAppointmentMissed).not.toHaveBeenCalled();
    });
  });

  describe('getNextAppointmentSummary', () => {
    it('returns null when there is no upcoming appointment', async () => {
      prisma.appointment.findFirst.mockResolvedValue(null);

      const result = await service.getNextAppointmentSummary('mother-profile-A');
      expect(result).toBeNull();
    });

    it('returns only the narrow projection fields', async () => {
      prisma.appointment.findFirst.mockResolvedValue({
        id: 'appt-1',
        motherProfileId: 'mother-profile-A',
        type: AppointmentType.ANC_VISIT,
        scheduledAt: new Date('2026-09-01T10:00:00Z'),
        facilityName: 'Kacyiru Health Center',
        status: AppointmentStatus.SCHEDULED,
        notes: 'sensitive clinical notes',
      });

      const result = await service.getNextAppointmentSummary('mother-profile-A');

      expect(result).toEqual({
        type: AppointmentType.ANC_VISIT,
        scheduledAt: new Date('2026-09-01T10:00:00Z'),
        facilityName: 'Kacyiru Health Center',
        status: AppointmentStatus.SCHEDULED,
      });
    });
  });
});
