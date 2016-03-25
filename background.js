function getDomainFromUrl(url){
	var host = "null";
	if(typeof url == "undefined" || null == url)
		url = window.location.href;
	var regex = /.*\:\/\/([^\/]*).*/;
	var match = url.match(regex);
	if(typeof match != "undefined" && null != match)
		host = match[1];
	return host;
};

function checkForValidUrl(tabId, changeInfo, tab) {
	if(getDomainFromUrl(tab.url).toLowerCase()=="book.douban.com"){
		chrome.pageAction.show(tabId);
	}
};

chrome.tabs.onUpdated.addListener(checkForValidUrl);

var articleData = {};
articleData.error = "加载中...";
chrome.runtime.onMessage.addListener(function(request, sender, sendRequest){
	if(request.type!=="cnblog-article-information")
		return;
	articleData = request;
    var sendRequest = function(title,isbn) {
        var url = "http://www.good.com/testjson.php";
        var json = {"isbn":isbn.trim(),"title":title};
        var json_data = JSON.stringify(json);
        xmlHttp = new XMLHttpRequest();
        xmlHttp.open("POST",url,true);
        xmlHttp.onreadystatechange = function() {
            if(xmlHttp.readyState == 4) {
                if(xmlHttp.status == 200) {
                    var text = xmlHttp.responseText;
                    //convert str to json
                    var response = JSON.parse(text);
                    var result = response.result==1?"存在":"不存在";
                    articleData.result = result;
                    //return result;
                }
            }
        };
        xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xmlHttp.send(json_data);
    };
    sendRequest(articleData.title,articleData.isbn);
});


