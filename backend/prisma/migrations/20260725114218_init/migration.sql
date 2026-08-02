-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MEMBRE');

-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('COMMUNE', 'PRIVEE');

-- CreateEnum
CREATE TYPE "GpioType" AS ENUM ('RELAIS', 'INTERRUPTEUR', 'CAPTEUR');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('ALLUMAGE', 'EXTINCTION', 'CONNEXION', 'DECONNEXION', 'MODIFICATION', 'CREATION', 'SUPPRESSION');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "codeAcces" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBRE',
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateExpiration" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "icone" TEXT NOT NULL DEFAULT '💡',
    "type" "RoomType" NOT NULL DEFAULT 'PRIVEE',
    "pinRelais" INTEGER NOT NULL,
    "pinInterrupteur" INTEGER NOT NULL,
    "etat" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "piece_permissions" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,
    "acces" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "piece_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gpio_devices" (
    "id" SERIAL NOT NULL,
    "pin" INTEGER NOT NULL,
    "type" "GpioType" NOT NULL,
    "nom" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "etat" BOOLEAN NOT NULL DEFAULT false,
    "roomId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gpio_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "action_logs" (
    "id" SERIAL NOT NULL,
    "type" "ActionType" NOT NULL,
    "roomId" INTEGER,
    "userId" INTEGER NOT NULL,
    "userNom" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "action_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_codeAcces_key" ON "users"("codeAcces");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_pinRelais_key" ON "rooms"("pinRelais");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_pinInterrupteur_key" ON "rooms"("pinInterrupteur");

-- CreateIndex
CREATE UNIQUE INDEX "piece_permissions_userId_roomId_key" ON "piece_permissions"("userId", "roomId");

-- CreateIndex
CREATE UNIQUE INDEX "gpio_devices_pin_key" ON "gpio_devices"("pin");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "piece_permissions" ADD CONSTRAINT "piece_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "piece_permissions" ADD CONSTRAINT "piece_permissions_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gpio_devices" ADD CONSTRAINT "gpio_devices_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_logs" ADD CONSTRAINT "action_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
