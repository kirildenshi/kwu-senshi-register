-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ALLIANCE_MEMBER', 'DOJO_OPERATOR');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('SUBMITTED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('RANK_CERTIFICATE', 'DOJO_PROOF', 'GOVERNMENT_ID', 'INSURANCE');

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MASCULINE', 'FEMININE', 'OTHER');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "lang" TEXT NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sex" "Sex",
    "dateOfBirth" TIMESTAMP(3),
    "countryOfOrigin" TEXT,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "telephone" TEXT,
    "addressLine1" TEXT,
    "city" TEXT,
    "stateProvince" TEXT,
    "zipCode" TEXT,
    "country" TEXT,
    "governmentId" TEXT,
    "cpf" TEXT,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistrationApplication" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "currentRank" TEXT,
    "dojoName" TEXT,
    "dojoAddress" TEXT,
    "dojoCity" TEXT,
    "dojoCountry" TEXT,
    "dojoDescription" TEXT,
    "dataAccuracyDeclaration" BOOLEAN NOT NULL DEFAULT false,
    "ageConfirmation" BOOLEAN NOT NULL DEFAULT false,
    "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistrationApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationDocument" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_personId_key" ON "Account"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_personId_key" ON "Contact"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "RegistrationApplication_accountId_key" ON "RegistrationApplication"("accountId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistrationApplication" ADD CONSTRAINT "RegistrationApplication_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationDocument" ADD CONSTRAINT "ApplicationDocument_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "RegistrationApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
