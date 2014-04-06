CREATE TABLE suicidePools (
    id INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	poolName VARCHAR(100) NOT NULL,
	createdOn TIMESTAMP DEFAULT '00-00-0000 00:00:00',
    updatedOn TIMESTAMP DEFAULT now() ON UPDATE now(),
	PRIMARY KEY (id)
);

DESCRIBE suicidePools;

ALTER TABLE suicidePools DROP FOREIGN KEY suicidePools_manager_FK;
ALTER TABLE suicidePools DROP COLUMN manager, DROP COLUMN invited, DROP COLUMN participants, DROP COLUMN participantStatuses;

USE owlStakes;