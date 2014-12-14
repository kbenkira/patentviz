import requests as rq
from bs4 import BeautifulSoup
import re 
import csv
import logging
import conf 

class Patent:

	liste_num = []
	liste = []

	def __init__(self,numero):
		self.id = numero
		self.title = ""
		self.assignee = ""
		self.inventors = []
		self.publication_date = ""
		self.summary = ""

		self.reference = []
		self.referenced_by = []
		self.us_classification = ""
		self.international_classification = ""
		self.liste_num.append(numero)
		self.liste.append(self)

patents_scraped = [] 
for patent_id in conf.patent_ids: 

	url = "http://google.com/patents/" + str(patent_id)
	url = 'http://www.google.fr/patents/US20030191577'
	url = 'http://www.google.fr/patents/US8538675'
	page = rq.get(url)
	data = ""
	data += page.content + "\n"
	soup = BeautifulSoup(data)

		
	patent = Patent(patent_id)

	#Partie Othmane : détails généraux 




	#Partie Kamal : citations et références 

	### Patents that are referenced  
	cited_patent = []
	citing_patent = []


	references_html = soup.find_all('th', {'class' : 'patent-data-table-th'})
	table_titles = []
	for ref in references_html:
		table_titles.append(ref.get_text().encode('ascii','ignore'))

	if ('Cited Patent' in table_titles) or ('Brevet cité' in table_titles):
		cited_patent = get_cited_patent(soup)
		if ('Citing Patent' in table_titles) or ('Brevet citant' in table_titles):
			citing_patent = get_citing_patent(soup,1)
	else:
		if ('Citing Patent' in table_titles) or ('Brevet citant' in table_titles):
			citing_patent = get_citing_patent(soup,0)


	def get_citing_patent(soup,position):

		citing_patent = []

		citing_patent_html = soup.find_all('table', {'class' : 'patent-data-table'})[position]
		citing_patent_html_ = citing_patent_html.find_all('td',{'class' : 'patent-data-table-td citation-patent'})
		for item in citing_patent_html_:
			citing_patent.append(item.get_text().encode('ascii','ignore').split(' ')[0])

		return citing_patent

	def get_cited_patent(soup):

		cited_patent = []

		cited_patent_html = soup.find_all('table', {'class' : 'patent-data-table'})[0]
		cited_patent_html_ = cited_patent_html.find_all('td', {'class' : 'patent-data-table-td citation-patent'})
		for item in cited_patent_html_:
			cited_patent.append(item.next.get_text().encode('ascii','ignore').split(' ')[0])

		return cited_patent

	