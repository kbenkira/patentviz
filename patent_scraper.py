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



for patent_id in conf.patent_ids: 

	url = "http://google.com/patents/" + str(patent_id)
	page = rq.get(url)
	data = ""
	data += page.content + "\n"
	soup = BeautifulSoup(data)

	patents_scraped = [] 
	#Partie Othmane : détails généraux 




	#Partie Kamal : citations et références 
	