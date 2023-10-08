import requests
from bs4 import BeautifulSoup

# Make a request to the webpage
url = 'https://www.example.com'
response = requests.get(url)

# Parse the HTML content using BeautifulSoup
soup = BeautifulSoup(response.content, 'html.parser')

# Find the data you want to scrape
data = soup.find('div', {'class': 'example-class'}).text

# Print the scraped data
print(data)
