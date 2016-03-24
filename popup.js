document.addEventListener('DOMContentLoaded', function () {
	var data = chrome.extension.getBackgroundPage().articleData;
	if(data.error){
		$("#message").text(data.error);
		$("#content").hide();
	}else{
		$("#message").hide();
		$("#content-title").text(data.title);
		$("#content-author").text(data.author);
		$("#content-price").text(data.price);
		$("#content-ISBN").text(data.isbn);
		$("#content-exist").text("存在");

		// send request to the server by XMLHttpRequest
		//sendRequest(data.title,data.isbn);
	}
});

function sendRequest(title,isbn) {
	var url = "http://www.good.com/testjson.php";
	var json = {"isbn":isbn,"title":title};
	var json_data = JSON.stringify(json);
	xmlHttp = new XMLHttpRequest();
	xmlHttp.open("POST",url,true)
	xmlHttp.onreadystatechange = function() {
	    if(xmlHttp.readyState == 4) {
	        if(xmlHttp.status == 200) {
	            // console.log("发送成功！")
                console.log(xmlHttp.responseText);
	        }
	    }
	};
	xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xmlHttp.send(json_data);
}
