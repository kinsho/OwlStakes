import math;
import MySQLdb;

import urllib2;
import pdb;

from GamesModel import Games;
from TeamsModel import Teams;

from SiteScraper import siteScraper;
from bs4 import BeautifulSoup;

import sys; # For testing purposes only

# Class is responsible for fetching all the game odds from the CBS sports page
#
# @author kinsho
#
class spreadsParser:

	# Constants
	SPREADS_WEBSITE_URL = 'http://www.cbssports.com/nfl/odds';

	# Attributes	
	teamNames = (
		'Giants',
		'Eagles',
		'Cowboys',
		'Redskins',
		'Bears',
		'Lions',
		'Packers',
		'Vikings',
		'Buccaneers',
		'Saints',
		'Falcons',
		'Panthers',
		'49ers',
		'Seahawks',
		'Rams',
		'Cardinals',
		'Jets',
		'Patriots',
		'Dolphins',
		'Bills',
		'Chiefs',
		'Broncos',
		'Chargers',
		'Raiders',
		'Ravens',
		'Steelers',
		'Bengals',
		'Browns',
		'Colts',
		'Texans',
		'Jaguars',
		'Titans'
	);


	# Function is responsible for parsing all the odds-related info from the odds website
	#
	# @return an array containing all the current week's games, along with their respective spreads
	#
	# @author kinsho
	#
	def parseSpreadsFromSite(self):

		# Fetch the soupified contents of the website with the sports odds		
		print("Fetching all the current week's odds...");
		soup = siteScraper().cookSoup(self.SPREADS_WEBSITE_URL);
		print('Done. Fetched the HTML!');

		# Prepare the results array
		results = [];

		# Parse the soup to fetch all relevant game info necessary to update the
		# current week's spreads within the database 
		for gameTable in soup.find_all('table', class_='data'):

			teamLinks = gameTable.find_all('a');
			teamRows = gameTable.find('tbody').find_all('tr');

			awayTeamLinkTitle = teamLinks[0]['title'];
			homeTeamLinkTitle = teamLinks[1]['title'];

			for teamName in self.teamNames:
				if teamName in awayTeamLinkTitle:
					awayTeam = teamName;
				if teamName in homeTeamLinkTitle:
					homeTeam = teamName;

			spreadText = teamRows[1].find_all('td')[3].contents[0];
			if spreadText == 'PK':
				spreadText = '-1';
			spread = float(spreadText.replace('+', ''));

			results.append({
				'awayTeam' : awayTeam,
				'homeTeam' : homeTeam,
				'spread' : spread
			});

		return results;

	# Function is responsible for updating all the current week's odds-related info within
	# the database
	#
	# @param spreads - an array containing all the current spreads for the current week's games
	# @return a boolean indicating whether all the odds were successfully updated
	#		  within the database
	#
	# @author kinsho
	#
	def updateSpreadsInDatabase(self, spreads):

		for game in spreads:

			# Prepare the queries to fetch the team names
			awayTeamQuery = Teams.select().where(Teams.name == game['awayTeam']).get();
			homeTeamQuery = Teams.select().where(Teams.name == game['homeTeam']).get();

			# Fetch the IDs corresponding to each team in the game
			awayTeam = awayTeamQuery.id;
			homeTeam = homeTeamQuery.id;

			# Figure out the underdog using the spread
			curentUnderdog = homeTeam if game['spread'] > 0 else awayTeam;

			# Prepare the query to update the spread for the current game in context
			updateSpreadQuery = Games.update(spread = math.fabs(game['spread']), underdog = curentUnderdog).where(Games.homeTeam == homeTeam, Games.awayTeam == awayTeam);

			# Execute the update query
			updateSpreadQuery.execute();


sParser = spreadsParser();
sParser.updateSpreadsInDatabase(sParser.parseSpreadsFromSite());

# Final message to output indicating everything was a success
print("\nI think we're done. All the spreads have been updated!");
