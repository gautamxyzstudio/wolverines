-- CreateEnum
CREATE TYPE "YearEndPaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "PendingYearEndRegistration" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "primaryContactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "secondaryCountryCode" TEXT,
    "secondaryContactNumber" TEXT,
    "notes" TEXT,
    "ticketDetails" JSONB NOT NULL,
    "totalAttendees" INTEGER NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "processingFee" DECIMAL(10,2) NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "paymentStatus" "YearEndPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "stripeCheckoutSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PendingYearEndRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YearEndRegistration" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "primaryContactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "secondaryCountryCode" TEXT,
    "secondaryContactNumber" TEXT,
    "notes" TEXT,
    "ticketDetails" JSONB NOT NULL,
    "totalAttendees" INTEGER NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "processingFee" DECIMAL(10,2) NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "paymentStatus" "YearEndPaymentStatus" NOT NULL DEFAULT 'PAID',
    "stripeCheckoutSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YearEndRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PendingYearEndRegistration_registrationId_key" ON "PendingYearEndRegistration"("registrationId");

-- CreateIndex
CREATE UNIQUE INDEX "PendingYearEndRegistration_stripeCheckoutSessionId_key" ON "PendingYearEndRegistration"("stripeCheckoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "YearEndRegistration_registrationId_key" ON "YearEndRegistration"("registrationId");

-- CreateIndex
CREATE UNIQUE INDEX "YearEndRegistration_stripeCheckoutSessionId_key" ON "YearEndRegistration"("stripeCheckoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "YearEndRegistration_stripePaymentIntentId_key" ON "YearEndRegistration"("stripePaymentIntentId");
