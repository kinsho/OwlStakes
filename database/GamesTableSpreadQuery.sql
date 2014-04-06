SELECT G.spread, T.name
FROM games G, teams T
WHERE underdog IS NOT NULL AND T.id = G.underdog AND G.week = 2;