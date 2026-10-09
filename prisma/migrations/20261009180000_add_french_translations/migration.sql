-- partners
ALTER TABLE `partners`
ADD COLUMN `aboutFr` VARCHAR(191) NULL,
ADD COLUMN `descriptionFr` TEXT NULL;

UPDATE `partners` SET `aboutFr` = `about`, `descriptionFr` = `description`;

ALTER TABLE `partners`
MODIFY COLUMN `aboutFr` VARCHAR(191) NOT NULL,
MODIFY COLUMN `descriptionFr` TEXT NOT NULL;

-- news
ALTER TABLE `news`
ADD COLUMN `titleFr` VARCHAR(191) NULL,
ADD COLUMN `tagFr` VARCHAR(191) NULL,
ADD COLUMN `pillarFr` VARCHAR(191) NULL,
ADD COLUMN `noteFr` TEXT NULL,
ADD COLUMN `bodyFr` TEXT NULL;

UPDATE `news`
SET `titleFr` = `title`, `tagFr` = `tag`, `pillarFr` = `pillar`, `noteFr` = `note`, `bodyFr` = `body`;

ALTER TABLE `news`
MODIFY COLUMN `titleFr` VARCHAR(191) NOT NULL,
MODIFY COLUMN `tagFr` VARCHAR(191) NOT NULL,
MODIFY COLUMN `pillarFr` VARCHAR(191) NOT NULL,
MODIFY COLUMN `noteFr` TEXT NOT NULL;

-- press_releases
ALTER TABLE `press_releases`
ADD COLUMN `titleFr` VARCHAR(191) NULL,
ADD COLUMN `summaryFr` TEXT NULL;

UPDATE `press_releases` SET `titleFr` = `title`, `summaryFr` = `summary`;

ALTER TABLE `press_releases`
MODIFY COLUMN `titleFr` VARCHAR(191) NOT NULL;