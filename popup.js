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
        $("#content-exist").text(data.result);
        var result_code = data.result["result"];
        if(result_code == 1) {
 			$("#content-exist").text("存在");
 			var url_text = '<a href='+data.result["url"]+' target="_blank">whu</a>';
 			$("#content-url").html(url_text);
        } else {
        	$("#content-exist").text("不存在");
        }
	}
});

