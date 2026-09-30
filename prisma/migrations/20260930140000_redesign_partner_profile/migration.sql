ALTER TABLE `partners`
ADD COLUMN `about` VARCHAR(191) NULL,
ADD COLUMN `description` TEXT NULL;

UPDATE `partners`
SET `about` = `role`, `description` = `role`;

ALTER TABLE `partners`
MODIFY COLUMN `about` VARCHAR(191) NOT NULL,
MODIFY COLUMN `description` TEXT NOT NULL,
DROP COLUMN `role`,
DROP COLUMN `isTechnicalLead`;