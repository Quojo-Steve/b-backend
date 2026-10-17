-- French translations are optional: allow NULL (existing values are kept as they are).
ALTER TABLE `partners`
MODIFY COLUMN `aboutFr` VARCHAR(191) NULL,
MODIFY COLUMN `descriptionFr` TEXT NULL;

ALTER TABLE `news`
MODIFY COLUMN `titleFr` VARCHAR(191) NULL,
MODIFY COLUMN `tagFr` VARCHAR(191) NULL,
MODIFY COLUMN `pillarFr` VARCHAR(191) NULL,
MODIFY COLUMN `noteFr` TEXT NULL;

ALTER TABLE `press_releases`
MODIFY COLUMN `titleFr` VARCHAR(191) NULL;
