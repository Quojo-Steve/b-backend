-- CreateTable
CREATE TABLE `trainings` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `status` ENUM('PUBLISHED', 'DISABLED') NOT NULL DEFAULT 'PUBLISHED',
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `trainings_status_idx`(`status`),
    INDEX `trainings_startDate_idx`(`startDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cohorts` (
    `id` VARCHAR(191) NOT NULL,
    `trainingId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `capacity` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `cohorts_startDate_idx`(`startDate`),
    UNIQUE INDEX `cohorts_trainingId_name_key`(`trainingId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `training_applications` ADD COLUMN `cohortId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `training_applications_cohortId_idx` ON `training_applications`(`cohortId`);

-- CreateIndex
CREATE UNIQUE INDEX `training_applications_cohortId_applicantEmail_key` ON `training_applications`(`cohortId`, `applicantEmail`);

-- AddForeignKey
ALTER TABLE `cohorts` ADD CONSTRAINT `cohorts_trainingId_fkey` FOREIGN KEY (`trainingId`) REFERENCES `trainings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `training_applications` ADD CONSTRAINT `training_applications_cohortId_fkey` FOREIGN KEY (`cohortId`) REFERENCES `cohorts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
