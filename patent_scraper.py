import requests as rq
from bs4 import BeautifulSoup
import re 
import csv
import logging
import conf 
import time

class Patent:

	liste_num = []
	liste = []

	def __init__(self,numero):
		self.id = numero
		self.title = ""
		self.assignee = []
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
for patent_id in patent_ids[0:15]: 

	url = "http://www.google.fr/patents/" + str(patent_id)
	#.fr ou .com ??? ça change la langue des balises et des string : citations de brevets VS patent citations 
	'''
	url = 'http://www.google.fr/patents/US3675209'
	url = 'http://www.google.fr/patents/US7117308'
	url = 'http://www.google.fr/patents/US20020110134'
	url = 'http://www.google.fr/patents/US20120079076'
	url = 'http://www.google.fr/patents/US8538675'
	url = 'http://www.google.fr/patents/US20030191577'
	url = 'http://www.google.fr/patents/US6979146'
	'''

	page = rq.get(url)
	data = ""
	data += page.content + "\n"
	soup = BeautifulSoup(data)

	
	patent = Patent(patent_id)

	#Partie Othmane : détails généraux 




	#Partie Kamal : citations et références 

	patent.reference = get_cited_patent(soup)
	patent.reference_by = get_citing_patent(soup)
	patent.international_classification = get_classification(soup)
	patents_scraped.append(patent)
	time.sleep(3)

def get_citing_patent(soup):

	citing_patent = []		
	balises = soup.find('span', text = ' Référencé par', attrs = {'class' : 'patent-section-title'})
	if balises:
		balises = balises.next.next
		bal = balises.find_all('a')
		for b in bal:
			citing_patent.append(b.get_text().encode('ascii','ignore'))		

	return citing_patent	


def get_cited_patent(soup):

	cited_patent = []
	balises = soup.find('span', text = 'Citations de brevets', attrs = {'class' : 'patent-section-title'})
	if balises:
		balises = balises.next.next
		bal = balises.find_all('a')
		for b in bal:
			cited_patent.append(b.get_text().encode('ascii','ignore'))

	return cited_patent	


def get_classification(soup):
	
	classification = []
	classification_html = soup.find('td', text = ' Classification internationale', attrs = {'class' : 'patent-data-table-td '})
	if classification_html:
		classification_html = classification_html.next.next
		for item in classification_html.find_all(href=True):
			classification.append(item.get_text().encode('ascii','ignore'))

	return classification	


'''
Ancienne version : 

	references_html = soup.find_all('div',{'class' : {'patent-section-header'}})
		
	table_titles = []

	for ref in references_html:
		table_titles.append(ref.get_text().encode('ascii','ignore').replace(' ',''))
		

	if 'Citationsdebrevets' in table_titles:
		cited_patent = get_cited_patent(soup)
		if 'Rfrencpar' in table_titles:
			citing_patent = get_citing_patent(soup,table_titles.index('Rfrencpar')-table_titles.index('Citationsdebrevets'))
	else:
		if 'Rfrencpar' in table_titles:
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
'''



		




	