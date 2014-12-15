from SiteScraper import *;
from bs4 import BeautifulSoup;

#import sys; # For testing purposes only

# Class is pulling data regarding an interest of mine
# @author kinsho
#
class nuforc:

    # Constants
    NUFORC_WEBSITE_URL = 'http://www.nuforc.org/webreports/ndxevent.html';
    HTML_SUFFIX = '.html';

    # Field to record the current week
    currentYear = 0;

    # Function is responsible for parsing apart the data and gathering statistics on state-by-state incidences
    #
    # @return {Array} - a collection containing frequency data regarding incidences across all fifty states
    #
    # @author kinsho
    #
    def parseData(self):

        records = [];
        scraper = siteScraper();

        # Fetch the contents of the website with the current week's scoreboard
        soup = scraper.cookSoup(self.WINNERS_WEBSITE_URL);

        # Record the week in the event that we need to update the 'No Upsets' record for the current week
        self.currentWeek = soup.find('a', class_='optsel').contents[0];

        # Parse the soup to fetch all relevant game info necessary to update the
        # winners within the database
        scoreBoxes = soup.find_all('div', class_='scoreBox');

        for box in scoreBoxes:

            # Because this script is only looking for winners, look for the scoreboxes
            # for games that have ended
            gameStatusElement = box.find('td', class_='finalStatus');

            if ( (gameStatusElement != None) and ('Final' in gameStatusElement.contents[0]) ):

                awayTeamBox = box.find('tr', class_='awayTeam');
                homeTeamBox = box.find('tr', class_='homeTeam');

                # Fetch the home and away team names
                awayTeamLocationDiv = awayTeamBox.find('div', class_='teamLocation');
                homeTeamLocationDiv = homeTeamBox.find('div', class_='teamLocation');

                awayTeamName = self.teamNames[awayTeamLocationDiv.find('a').contents[0]];
                homeTeamName = self.teamNames[homeTeamLocationDiv.find('a').contents[0]];

                # Deduce who won the game
                awayTeamfinalScore = awayTeamBox.find('td', class_='finalScore').contents[0];
                homeTeamfinalScore = homeTeamBox.find('td', class_='finalScore').contents[0];

                if ( int(awayTeamfinalScore) > int(homeTeamfinalScore) ):
                    winner = awayTeamName;
                elif ( int(homeTeamfinalScore) > int(awayTeamfinalScore) ):
                    winner = homeTeamName;
                else:
                    winner = '0'; # the game ended in a tie

                records.append({
                'awayTeam' : awayTeamName,
                'homeTeam' : homeTeamName,
                'winner' : winner
                });
            else:
                # Only set this flag to false if at least one of the scoreboxes has not updated its status to include the word 'Final'
                self.haveAllGamesBeenPlayedYet = False;

        return records;

    # Function is responsible for recording the underdogs that have won their respective games within the current week
    #
    # @param winners - an array containing basic information regarding all the games as well as the winners of each game
    #
    # @author kinsho
    #
    def updateWinnersWithinDatabase(self, winners):

        totalNumberOfUpsets = 0;

        for winner in winners:

            # Print out the game results on the console
            print(winner['awayTeam'] + ' @ ' + winner['homeTeam'] + ' ----> ' + winner['winner']);

            # Prepare the queries to fetch the team IDs as well as the ID of the winner
            awayTeamQuery = Teams.select().where(Teams.name == winner['awayTeam']).get();
            homeTeamQuery = Teams.select().where(Teams.name == winner['homeTeam']).get();
            winnerQuery = Teams.select().where(Teams.name == winner['winner']).get();

            # Fetch the IDs corresponding to each team in the game
            awayTeam = awayTeamQuery.id;
            homeTeam = homeTeamQuery.id;
            winnerID = winnerQuery.id;

            # Find out who the underdog was within the game
            gameQuery = Games.select().where(Games.awayTeam == awayTeam, Games.homeTeam == homeTeam).get();
            underdog = gameQuery.underdog;

            # Update the record to indicate whether the underdog won
            isUnderdogWinner = ( (underdog == winnerID) or (winnerID == '0') );
            updateGameQuery = Games.update(didUnderdogWin = isUnderdogWinner).where(Games.homeTeam == homeTeam, Games.awayTeam == awayTeam);
            updateGameQuery.execute();

            # Update the counter to keep track of the total number of upsets so far this week
            if isUnderdogWinner:
                totalNumberOfUpsets += 1;

        # In the event that the week ended and no upsets were recorded, update the 'No Upsets' record to indicate its validity
        # But in the event that an upset has occurred in the week, mark the 'No Upsets' record as invalid
        if (self.haveAllGamesBeenPlayedYet):
            updateGameQuery = Games.update(didUnderdogWin = (totalNumberOfUpsets == 0)).where(Games.homeTeam == 0, Games.awayTeam == 0, Games.week == self.currentWeek);
            updateGameQuery.execute();


# Initializer code to execute the code above
wParser = winnersParser();
wParser.updateWinnersWithinDatabase(wParser.parseWinnersFromSite());

# Final message to output indicating everything was a success
print("\nWe're good! All the underdogs that have won their games within the current week have been noted.");