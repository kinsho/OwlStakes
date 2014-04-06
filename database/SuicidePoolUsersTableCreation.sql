CREATE TABLE suicidePoolUsers (
    poolId INTEGER UNSIGNED NOT NULL,
	userId INTEGER UNSIGNED NOT NULL,
	userStatus ENUM('invited', 'participant', 'rejected', 'dead'),
	isManager BOOLEAN,
	letManagerMakePicks BOOLEAN DEFAULT TRUE,
	sendEmailsAboutMajorChanges BOOLEAN DEFAULT TRUE,
	sendWeeklyReminderEmails BOOLEAN DEFAULT TRUE,
	createdOn TIMESTAMP DEFAULT '00-00-0000 00:00:00',
    updatedOn TIMESTAMP DEFAULT now() ON UPDATE now(),
	PRIMARY KEY (poolId, userId),
	CONSTRAINT suicidePoolUsers_poolId_FK
		FOREIGN KEY (poolId)
		REFERENCES suicidePools(id),
	CONSTRAINT suicidePoolUsers_userId_FK
		FOREIGN KEY (userId)
		REFERENCES users(id)
);

DESCRIBE users;