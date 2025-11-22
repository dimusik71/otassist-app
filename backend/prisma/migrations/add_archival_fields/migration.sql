-- Add archival fields to Client table
ALTER TABLE client ADD COLUMN isArchived BOOLEAN NOT NULL DEFAULT 0;
ALTER TABLE client ADD COLUMN archivedAt DATETIME;
ALTER TABLE client ADD COLUMN deletionReason TEXT;
ALTER TABLE client ADD COLUMN canDeleteAfter DATETIME;
ALTER TABLE client ADD COLUMN isChild BOOLEAN NOT NULL DEFAULT 0;

-- Add archival fields to Assessment table
ALTER TABLE assessment ADD COLUMN isArchived BOOLEAN NOT NULL DEFAULT 0;
ALTER TABLE assessment ADD COLUMN archivedAt DATETIME;
ALTER TABLE assessment ADD COLUMN deletionReason TEXT;
ALTER TABLE assessment ADD COLUMN canDeleteAfter DATETIME;
ALTER TABLE assessment ADD COLUMN completedAt DATETIME;
