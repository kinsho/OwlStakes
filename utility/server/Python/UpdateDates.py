import math;
import string;
import json;
import time;
import MySQLdb;
from datetime import datetime, timedelta;
from string import Template;

from GamesModel import Games;
from TeamsModel import Teams;

import datetime;

import pdb;
import urllib2;
import pytz;
from pytz import timezone;

from SiteScraper import *;
from bs4 import BeautifulSoup;

#import sys; # For testing purposes only

# Class is responsible for fixing all the dates for all regular season games
# @author kinsho
#
class kickoffTimesParser:

	# Constants
	DATES_WEBSITE_URL = 'http://www.cbssports.com/nfl/schedules/regular/$year/week$week';

	# Attributes
	teamNames = {
		'N.Y. Giants' : 'Giants',
		'Philadelphia' : 'Eagles',
		'Dallas' : 'Cowboys',
		'Washington' : 'Redskins',
		'Chicago' : 'Bears',
		'Detroit' : 'Lions',
		'Green Bay' : 'Packers',
		'Minnesota' : 'Vikings',
		'Tampa Bay' : 'Buccaneers',
		'New Orleans' : 'Saints',
		'Atlanta' : 'Falcons',
		'Carolina' : 'Panthers',
		'San Francisco' : '49ers',
		'Seattle' : 'Seahawks',
		'St. Louis' : 'Rams',
		'Arizona' : 'Cardinals',
		'N.Y. Jets' : 'Jets',
		'New England' : 'Patriots',
		'Miami' : 'Dolphins',
		'Buffalo' : 'Bills',
		'Kansas City' : 'Chiefs',
		'Denver' : 'Broncos',
		'San Diego' : 'Chargers',
		'Oakland' : 'Raiders',
		'Baltimore' : 'Ravens',
		'Pittsburgh' : 'Steelers',
		'Cincinnati' : 'Bengals',
		'Cleveland' : 'Browns',
		'Indianapolis' : 'Colts',
		'Houston' : 'Texans',
		'Jacksonville' : 'Jaguars',
		'Tennessee' : 'Titans'
	};

	months = {
		'Sep' : '9',
		'Oct' : '10',
		'Nov' : '11',
		'Dec' : '12',
		'Jan' : '1'
	};


	# Function is responsible for parsing all the date-related info from the website
	#
	# @return an array containing all of the specified week's games, along with their
	# scheduled kickoff times
	#
	# @author kinsho
	#
	def parseDatesFromSite(self):

		records = [];

		# Deduce the current year in order to reference the proper URL
		currentTime = datetime.datetime.now(pytz.utc);
		currentYear = currentTime.year;

		# Run the loop seventeen times to pull the dates of the game from each week
		scraper = siteScraper();
		template = string.Template(self.DATES_WEBSITE_URL);
		for i in range(17):

			print('About to pull the HTML for week ' + (str)(i + 1) + '...');

			# Redraft the URL to pull kickoff times from different weeks
			url = template.substitute( {'year' : currentYear, 'week' : i + 1} );

			# Fetch the contents of the website with the kickoff times
			# using the newly formed URL
			soup = scraper.cookSoup(url);

			print('HTML pulled for week ' + (str)(i + 1) + '!');

			# Parse the soup to fetch all relevant game info necessary to update the
			# kickoff times within the database
			gameTable = soup.find('table', class_='data');
			dateInContext = '';

			for row in gameTable.find_all('tr'):

				# If the row contains the week number, record it in case we need to create new records
				if row['class'][0] == 'title':

					week = row.find('td').contents[0];
					week = week[string.index(week, 'k') + 2:].strip();

				# If the row contains a date, parse the month and date and store it
				elif row['class'][0] == 'subtitle':

					dateMonth = row.find('td').find('b').contents[0];
					month = dateMonth[string.index(dateMonth, ', ') + 2 : string.index(dateMonth, '.')];
					month = self.months[month];
					date = dateMonth[string.index(dateMonth, '.') + 1 :].strip();
					# Record the year in which the game will take place in case we need to create new records
					year = currentYear if month != 1 else (currentYear + 1);

				# If the row contains information about a game, record the names of the
				# home team and the away team as well as the kickoff time
				elif row['class'][0].startswith('row'):

					tdChildren = row.find_all('td');
					teamLinks = tdChildren[0].find_all('a');
					timeLink = tdChildren[1].find('a').find('span');

					awayTeam = self.teamNames[teamLinks[0].contents[0].strip()];
					homeTeam = self.teamNames[teamLinks[1].contents[0].strip()];

					# For games that have not yet passed, a valid time will be posted.
					# Records will be created for each of these games with valid times 
					if (timeLink != None):
						time = timeLink.contents[0].strip();
						hour = str( int(time[ : string.index(time, ':')]) + 12 );
						minutes = time[string.index(time, ':') + 1 : string.index(time, ' PM')];
						records.append({
							'minutes' : str(minutes),
							'hour' : str(hour),
							'month' : str(month),
							'date' : str(date),
							'week' : str(week),
							'year' : str(year),
							'awayTeam' : awayTeam,
							'homeTeam' : homeTeam
						});

		return records;

	# Function is responsible for updating all the current week's odds-related info within
	# the database
	#
	# @param gameTimes - an array containing all the currently scheduled kickoff times for the current week's games
	#
	# @author kinsho
	#
	def updateDatesWithinDatabase(self, gameTimes):

		for game in gameTimes:

			# Compose the kickoff time using the time data stored within each record
			kickoffTime = game['year'] + '-' + game['month'] + '-' + game['date'] + ' ' + game['hour'] + ':' + game['minutes'] + ':' + '00';

			# Prepare the queries to fetch the team names
			awayTeamQuery = Teams.select().where(Teams.name == game['awayTeam']).get();
			homeTeamQuery = Teams.select().where(Teams.name == game['homeTeam']).get();

			# Fetch the IDs corresponding to each team in the game
			awayTeam = awayTeamQuery.id;
			homeTeam = homeTeamQuery.id;

			# Find out if a record already exists for the game in question
			doesGameExist = Games.select().where(Games.awayTeam == awayTeam, Games.homeTeam == homeTeam).exists();

			# If the record exists, update it. Otherwise, create a new one.
			if (doesGameExist):
				updateGameQuery = Games.update(kickoffTime = kickoffTime).where(Games.homeTeam == homeTeam, Games.awayTeam == awayTeam);
				updateGameQuery.execute();
			else:
				createGameQuery = Games.create(kickoffTime = kickoffTime, homeTeam = homeTeam, awayTeam = awayTeam, week = game['week'], createdOn = None, updatedOn = None);

		# Don't forget to create a 'No Wagers' record for the week if none exists
		templateGame = gameTimes[0];
		doesNoWagerGameExist = Games.select().where(Games.awayTeam == 0, Games.homeTeam == 0, Games.week == templateGame['week']).exists();
		if (not doesNoWagerGameExist):
			kickoffTime = templateGame['year'] + '-' + templateGame['month'] + '-' + templateGame['date'] + ' ' + templateGame['hour'] + ':' + templateGame['minutes'] + ':' + '00';
			createGameQuery = Games.create(kickoffTime = kickoffTime, homeTeam = 0, awayTeam = 0, week = templateGame['week'], createdOn = None, updatedOn = None);

# Initializer code to execute the code above
ktParser = kickoffTimesParser();
ktParser.updateDatesWithinDatabase(ktParser.parseDatesFromSite());

# Final message to output indicating everything was a success
print("\nI think we're done. All the game kickoff dates have been either added or updated!");
