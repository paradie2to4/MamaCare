-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MOTHER', 'PARTNER', 'CHW', 'HEALTH_OFFICER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PregnancyStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'MISCARRIED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "AppointmentType" AS ENUM ('ANC_VISIT', 'ULTRASOUND', 'LAB_TEST', 'VACCINATION', 'POSTNATAL', 'OTHER');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'MISSED', 'CANCELLED', 'RESCHEDULED');

-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('APPOINTMENT', 'MEDICATION', 'DAILY_TIP', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('PENDING', 'SENT', 'DISMISSED', 'FAILED');

-- CreateEnum
CREATE TYPE "ReminderChannel" AS ENUM ('IN_APP', 'EMAIL', 'SMS');

-- CreateEnum
CREATE TYPE "EducationCategory" AS ENUM ('NUTRITION', 'ANTENATAL_CARE', 'EXERCISE_WELLBEING', 'BIRTH_PREPARATION', 'DANGER_SIGNS', 'MENTAL_WELLBEING', 'NEWBORN_CARE', 'BREASTFEEDING', 'POSTNATAL_CARE', 'IMMUNIZATION', 'HYGIENE', 'FAMILY_SUPPORT');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('APPOINTMENT', 'REMINDER', 'FOLLOW_UP', 'EDUCATION', 'SYSTEM');

-- CreateEnum
CREATE TYPE "FollowUpPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "FollowUpStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "PartnerLinkStatus" AS ENUM ('PENDING', 'ACTIVE', 'REVOKED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MOTHER',
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mother_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedCHWId" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "district" TEXT,
    "sector" TEXT,
    "cell" TEXT,
    "village" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mother_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pregnancies" (
    "id" TEXT NOT NULL,
    "motherProfileId" TEXT NOT NULL,
    "status" "PregnancyStatus" NOT NULL DEFAULT 'ACTIVE',
    "lmpDate" TIMESTAMP(3) NOT NULL,
    "eddDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pregnancies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "motherProfileId" TEXT NOT NULL,
    "pregnancyId" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "type" "AppointmentType" NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "facilityName" TEXT NOT NULL,
    "location" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "type" "ReminderType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "status" "ReminderStatus" NOT NULL DEFAULT 'PENDING',
    "channel" "ReminderChannel" NOT NULL DEFAULT 'IN_APP',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education_articles" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" "EducationCategory" NOT NULL,
    "titleEnglish" TEXT NOT NULL,
    "titleKinyarwanda" TEXT NOT NULL,
    "summaryEnglish" TEXT NOT NULL,
    "summaryKinyarwanda" TEXT NOT NULL,
    "contentEnglish" TEXT NOT NULL,
    "contentKinyarwanda" TEXT NOT NULL,
    "pregnancyStage" TEXT,
    "readTimeMinutes" INTEGER NOT NULL DEFAULT 3,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "reviewedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "education_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_follow_ups" (
    "id" TEXT NOT NULL,
    "motherProfileId" TEXT NOT NULL,
    "assignedCHWId" TEXT,
    "priority" "FollowUpPriority" NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "FollowUpStatus" NOT NULL DEFAULT 'OPEN',
    "dueDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_follow_ups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_links" (
    "id" TEXT NOT NULL,
    "partnerUserId" TEXT NOT NULL,
    "motherProfileId" TEXT NOT NULL,
    "status" "PartnerLinkStatus" NOT NULL DEFAULT 'PENDING',
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),

    CONSTRAINT "partner_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "mother_profiles_userId_key" ON "mother_profiles"("userId");

-- CreateIndex
CREATE INDEX "mother_profiles_assignedCHWId_idx" ON "mother_profiles"("assignedCHWId");

-- CreateIndex
CREATE INDEX "pregnancies_motherProfileId_idx" ON "pregnancies"("motherProfileId");

-- CreateIndex
CREATE INDEX "appointments_motherProfileId_idx" ON "appointments"("motherProfileId");

-- CreateIndex
CREATE INDEX "reminders_userId_idx" ON "reminders"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "education_articles_slug_key" ON "education_articles"("slug");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "health_follow_ups_motherProfileId_idx" ON "health_follow_ups"("motherProfileId");

-- CreateIndex
CREATE INDEX "partner_links_motherProfileId_idx" ON "partner_links"("motherProfileId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mother_profiles" ADD CONSTRAINT "mother_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mother_profiles" ADD CONSTRAINT "mother_profiles_assignedCHWId_fkey" FOREIGN KEY ("assignedCHWId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pregnancies" ADD CONSTRAINT "pregnancies_motherProfileId_fkey" FOREIGN KEY ("motherProfileId") REFERENCES "mother_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_motherProfileId_fkey" FOREIGN KEY ("motherProfileId") REFERENCES "mother_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_pregnancyId_fkey" FOREIGN KEY ("pregnancyId") REFERENCES "pregnancies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_follow_ups" ADD CONSTRAINT "health_follow_ups_motherProfileId_fkey" FOREIGN KEY ("motherProfileId") REFERENCES "mother_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_follow_ups" ADD CONSTRAINT "health_follow_ups_assignedCHWId_fkey" FOREIGN KEY ("assignedCHWId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_links" ADD CONSTRAINT "partner_links_partnerUserId_fkey" FOREIGN KEY ("partnerUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_links" ADD CONSTRAINT "partner_links_motherProfileId_fkey" FOREIGN KEY ("motherProfileId") REFERENCES "mother_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
