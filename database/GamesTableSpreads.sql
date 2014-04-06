UPDATE games
SET underdog = (SELECT id FROM teams WHERE name = 'Jets'), spread = 11.5
WHERE homeTeam = (SELECT id FROM teams WHERE name = 'Jets') AND week = 2;