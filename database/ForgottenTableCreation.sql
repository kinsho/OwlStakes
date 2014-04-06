CREATE TABLE forgottenPasswords(
	username VARCHAR(50) NOT NULL PRIMARY KEY,
	tempPassword VARCHAR(50) NOT NULL,
	numOfRequests TINYINT,
	createdOn TIMESTAMP DEFAULT '00-00-0000 00:00:00',
	updatedOn TIMESTAMP DEFAULT now() ON UPDATE now() 
);

DESCRIBE forgottenPasswords;