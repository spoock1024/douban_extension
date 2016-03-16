import requests
import re

def get_book(isbn):
	url = 'http://opac.lib.whu.edu.cn/F/?func=find-m&find_code=ISB&request='
	url += isbn
	response = requests.get(url,allow_redirects=True)
	result = response.text
	
	url_pattern = "url = '(.*?)'"
	redirect_url = ''
	match = re.search(url_pattern,result)
	if match:
		redirect_url = match.group(1)
	re_redirect_url = ""
	if redirect_url:
		response = requests.get(redirect_url,allow_redirects=True)
		book_result = response.text
		redirect_pattern = "/goto/(.*?)'"
		re_match = re.search(redirect_pattern,book_result)
		if re_match:
			re_redirect_url = re_match.group(1)
			response = requests.get(re_redirect_url,allow_redirects=True)
			final_result = response.text
			html_len = len(final_result)
			if html_len>3500:
				return True
			else:
				return False				
		else:
			return False			
	else:
		return False

isbn = '9787115249493'
get_book(isbn)