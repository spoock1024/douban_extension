var book_info = document.getElementsByClassName('indent')[0].childNodes[1].childNodes[1];
if(book_info == null){
	chrome.runtime.sendMessage({type:"cnblog-article-information", error:"获取文章信息失败."});
}
else{
	var msg = {
		type: "cnblog-article-information",
		title : "",
		author : "",
		price:"",
		isbn:""
	};

	var book_title = document.getElementsByTagName('h1')[0];
	var title = book_title.childNodes[1].innerHTML;

	msg.title = title

	var book_info_str = book_info.innerHTML;

	// use the regex
	var author_pattern = /<a .*?>(.*?)<\/a>/gi;
	var author_match = author_pattern.exec(book_info_str);
	if (author_match!=null) {
		msg.author = author_match[1];
	}

	//<span class="pl">定价:</span> 38.00元<br>
	var price_pattern = /定价:<\/span>(.*?)</gi;
	var price_match = price_pattern.exec(book_info_str);
	if (price_match!=null) {
		msg.price = price_match[1];
	}

	// <span class="pl">ISBN:</span> 9787121272295<br>
	var isbn_pattern = /ISBN:<\/span>(.*?)</gi;
	var isbn_match = isbn_pattern.exec(book_info_str);
	if(isbn_match !=null) {
		msg.isbn = isbn_match[1];
	} 
	chrome.runtime.sendMessage(msg);
}
