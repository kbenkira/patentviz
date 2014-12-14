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
	page = rq.get(url)
	data = ""
	data += page.content + "\n"
	soup = BeautifulSoup(data)

	
	patent = Patent(patent_id)

	#Partie Othmane : détails généraux 




	#Partie Kamal : citations et références 

	### Patents that are referenced  
	cited_patent = []
	cited_patent_html = []
	cited_patent_html_ = []
	#soup.find_all('table', {'class' : 'patent-data-table'})[0]


	references_html = soup.find_all('th', {'class' : 'patent-data-table-th'})
	table_titles = []
	for ref in references_html:
		table_titles.append(ref.get_text().encode('ascii','ignore'))
	if 'Cited Patent' in table_titles:
		cited_patent_html = soup.find_all('table', {'class' : 'patent-data-table'})[0]
		cited_patent_html_ = cited_patent_html.find_all('td', {'class' : 'patent-data-table-td citation-patent'})
		for item in cited_patent_html_:
			cited_patent.append(item.next.get_text().encode('ascii','ignore'))

	if 'Citing Patent' in table_titles:
		print('yes')

	ref = soup.find_all('tr',{'class' : 'patent-data-table'})
	if ref[0]:
		ref[0].nextSibling()

	if ref[1]:

	patents_cited = soup.find_all("td", {"class" : "patent-data-table-td citation-patent"})
	for patent in patents_cited:
		patent_referenced_id = patent.get_text().encode('ascii','ignore')
		reference.append(patent_referenced_id[0:len(patent_referenced_id )-2])

	patent.reference = reference

	### Patets which reference this one 

	referenced_by = []
	patents_referenced_by = soup.find_all("td", {"class" : "patent-data-table-td citation-patent"})

		


	