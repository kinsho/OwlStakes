from peewee import *;
from BaseConnection import BaseModel;

# Class is responsible for managing SQL transactions that involve the Teams table
#
# @author kinsho
#
class Teams(BaseModel):

	# attributes

	id = PrimaryKeyField();
	market = CharField();
	name = CharField();
	updatedOn = TimeField();