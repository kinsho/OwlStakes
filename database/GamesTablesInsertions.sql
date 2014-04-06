INSERT INTO games VALUES(
	null,
	(SELECT id FROM teams WHERE name = 'Seahawks'),
	(SELECT id FROM teams WHERE name = 'Rams'),
	null,
	null,
	0,
	17,
	'2013-12-29 16:25:00',
	null,
	null
);


INSERT INTO games VALUES(
	null,
	0,
	0,
	null,
	null,
	0,
	17,
	'2013-12-29 13:00:00',
	null,
	null
);