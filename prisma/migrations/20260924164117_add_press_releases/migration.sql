-- CreateTable
CREATE TABLE `press_releases` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `summary` VARCHAR(191) NULL,
    `documentUrl` VARCHAR(191) NULL,
    `documentName` VARCHAR(191) NULL,
    `status` ENUM('PUBLISHED', 'DISABLED') NOT NULL DEFAULT 'PUBLISHED',
    `releaseDate` DATETIME(3) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `press_releases_status_idx`(`status`),
    INDEX `press_releases_releaseDate_idx`(`releaseDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
