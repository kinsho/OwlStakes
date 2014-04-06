CREATE TABLE suicidePicks (
	suicidePoolId INTEGER UNSIGNED NOT NULL,
    userId INTEGER UNSIGNED NOT NULL,
	teamPicked TINYINT NOT NULL,
	week TINYINT UNSIGNED NOT NULL,
	createdOn TIMESTAMP DEFAULT '00-00-0000 00:00:00',
    updatedOn TIMESTAMP DEFAULT now() ON UPDATE now(),
	PRIMARY KEY (suicidePoolId, userId, week),
	CONSTRAINT suicidePicks_suicidePoolId_FK
		FOREIGN KEY (suicidePoolId)
		REFERENCES suicidePools(id),
	CONSTRAINT suicidePicks_userId_FK
		FOREIGN KEY (userId)
		REFERENCES users(id),
	CONSTRAINT suicidePicks_teamPicked_FK
		FOREIGN KEY (teamPicked)
		REFERENCES teams(id)
);

DESCRIBE suicidePicks;