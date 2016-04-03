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
    if(changeInfo.status == "complete") {
        if(getDomainFromUrl(tab.url).toLowerCase()=="book.douban.com"){
            chrome.pageAction.show(tabId);
        }

        // chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        //     chrome.tabs.sendMessage(tabs[0].id, {action: "SendIt"}, function(response) {});  
        // });
    }

};

chrome.tabs.onUpdated.addListener(checkForValidUrl);

var articleData = {};
articleData.error = "加载中...";
chrome.runtime.onMessage.addListener(function(request, sender, sendRequest){
	if(request.type!=="cnblog-article-information")
		return;
	articleData = request;
    var sendRequestToServer = function(title,isbn) {
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
                    var result = response.result;
                    articleData.result = result;

                    // send message to the content_script.js
                    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
                        chrome.tabs.sendMessage(tabs[0].id,{action: result}, function(response) {});  
                    });
                }
            }
        };
        xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xmlHttp.send(json_data);
    };
    sendRequestToServer(articleData.title,articleData.isbn);
});


