import requests as rq
from bs4 import BeautifulSoup
import re 
import csv
import logging

patents = []
i = 1 
while i < 987:
	patent_url = 'http://patft.uspto.gov/netacgi/nph-Parser?Sect1=PTO2&Sect2=HITOFF&p=1&u=%2Fnetahtml%2FPTO%2Fsearch-bool.html&r='+ str(i) + '&f=G&l=50&co1=AND&d=PTXT&s1=%22driver+assistance%22&OS=%22driver+assistance%22' 
	page = rq.get(patent_url)
	data = ""
	data += page.content+"\n"
	soup = BeautifulSoup(data)
	tdss = []
	tds = soup.find_all('td')
	for td in tds:
		if td.get('align') == 'center' and td.get_text().startswith(' US'):
			m = re.match( "( US\s\d+)",str(td.get_text()))
			if m:
				patents.append(m.group().replace(' ',''))
	if i%100==0:
		print('%s patents to scrap' %(987 - i))					
	i = i + 1

final_liste = []
final_liste.append(patents)

patent_file = open('patents_id.csv', 'w')
wr = csv.writer(patent_file, delimiter = ';')
wr.writerow(final_liste)



