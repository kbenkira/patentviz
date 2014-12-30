# -*- coding: utf8 -*-

import requests as rq
from bs4 import BeautifulSoup
import re 
import csv
import logging
from conf import *
import time
import json

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

def get_citing_patent(soup):

	citing_patent = []		
	balises = soup.find('span', text = " Référencé par", attrs = {'class' : 'patent-section-title'})
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


patents_scraped = [] 
for patent_id in patent_ids[0:100]: 

	url = "http://www.google.fr/patents/" + str(patent_id)
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

	patent.title=soup.find('invention-title').get_text().encode('ascii','ignore')
	d = soup.find('td', text = ' Date de publication', attrs = {'class' : 'patent-bibdata-heading'})
	if d:
		patent.publication_date=d.next.next.get_text().encode('ascii','ignore')
	patent.summary = soup.find('div', {'class':"abstract"}).get_text().encode('ascii','ignore')
	inventors = []
	assignee = []
	info = soup.find_all('span', {'class':"patent-bibdata-value"})
	for a in info:
		if a.find('a') != None:
			if a.find('a').get('href') != None:
				le_href = a.find('a').get('href')
				if "ininventor" in le_href: 
					inventors.append(a.get_text().encode('ascii','ignore'))
				if "inassignee" in le_href: 
					assignee.append(a.get_text().encode('ascii','ignore'))

	patent.inventors = inventors
	patent.assignee = assignee

	patent.reference = get_cited_patent(soup)
	patent.referenced_by = get_citing_patent(soup)
	patent.international_classification = get_classification(soup)
	patents_scraped.append(patent)
	time.sleep(3)

#Dump to json final 
result2 = '[\n'
for pat in patents_scraped: 
	result2 += json.dumps(pat.__dict__) + ',\n'
result2 = result2.rstrip(',') +']'
out = open("brevets.json", "w")	
out.write(result2)


#Dump to json old
'''
result = ''
result += '{'
patents_len = len(patents_scraped)
for patent in patents_scraped:
	result += '['
	result+='{'
	result+='"id" :' + '"' + patent.id + '",'
	result+='"title" :' + '"' + patent.title + '",'
	result+='"publication_date" :' + '"' + patent.publication_date + '",'
	result+='"summary" :' + '"' + patent.summary + '",'

	result+='"assignee" : ['
	for i in range(len(patent.assignee)):
		if i < (len(patent.assignee) - 1):
			result+= '"' + patent.assignee[i] + '",' 
		else:
			result+= '"' + patent.assignee[i]	
	result+="],"

	result+='"inventors" : ['
	for i in range(len(patent.inventors)):
		if i < (len(patent.inventors) - 1):
			result+= '"' + patent.inventors[i] + '",' 
		else:
			result+= '"' + patent.inventors[i]	
	result+="],"
	
	result+='"reference" : ['
	for i in range(len(patent.reference)):
		if i < (len(patent.reference) - 1):
			result+= '"' + patent.reference[i] + '",' 
		else:
			result+= '"' + patent.reference[i]	
	result+="],"
	
	result+='"referenced_by" : ['
	for i in range(len(patent.referenced_by)):
		if i < (len(patent.referenced_by) - 1):
			result+= '"' + patent.referenced_by[i] + '",' 
		else:
			result+= '"' + patent.referenced_by[i]	
	result+="],"
	
	for i in range(len(patent.international_classification)):
		if i < (len(patent.international_classification) - 1):
			result+= '"' + patent.international_classification[i] + '",' 
		else:
			result+= '"' + patent.international_classification[i]
	if patent == patents_scraped[patents_len-1]:
		result+="]"			
	else: 
		result+="],"
	for item in patent.referenced_by:
		result+= '"' + item + '",' 
	result+="]"
	result+='"international_classification" : ['
	for item in patent.international_classification:
		result+= '"' + item + '",' 
	result+="]"

	#result+='"inventors" :' + '"' + patent.inventors + '",'
	#result+='"reference" :' + '"' + patent.reference + '",'
	#result+='"referenced_by" :' + '"' + patent.referenced_by + '",'
	#result+='"international_classification" :' + '"' + patent.international_classification + '",'
result += "}"
'''
#print json.dumps(patents_scraped)


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



		




	
