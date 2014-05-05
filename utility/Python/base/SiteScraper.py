import urllib2;
from bs4 import BeautifulSoup;

class siteScraper:

	# Function is responsible fetching the contents of the web site whose URL is passed
	# as a parameter. The contents are wrapped within a BeautifulSoup object
	#
	# @param url - the URL of the site that will need to be scraped
	# @return a BeautifulSoup object that contains all the HTML content from the passed URL
	#
	# @author kinsho
	#
	def cookSoup(self, url):

		site = urllib2.urlopen(url);
		siteHTML = site.read();
		return BeautifulSoup(siteHTML);