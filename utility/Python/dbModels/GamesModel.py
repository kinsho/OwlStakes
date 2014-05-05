from peewee import *;

from BaseConnection import BaseModel;

# Class is responsible for managing SQL transactions made to the games table
#
# @author kinsho
#
class Games(BaseModel):

	# attributes
	id = PrimaryKeyField(unique = True);
	homeTeam = IntegerField();
	awayTeam = IntegerField();
	underdog = IntegerField();
	didUnderdogWin = BooleanField();
	spread = DecimalField();
	week = IntegerField();
	kickoffTime = DateTimeField();
	createdOn = TimeField(null = True);
	updatedOn = TimeField(null = True);