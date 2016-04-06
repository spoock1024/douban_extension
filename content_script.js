var book_info = document.getElementsByClassName('indent')[0].childNodes[1].childNodes[1];
if(book_info == null){
    chrome.runtime.sendMessage({type:"cnblog-article-information", error:"获取文章信息失败."});
}  else{
    var msg = {
        type: "cnblog-article-information",
        title : "",
        author : "",
        price:"",
        isbn:""
    };

    var book_title = document.getElementsByTagName('h1')[0];
    var title = book_title.childNodes[1].innerHTML;

    msg.title = title;

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

    // cann't write code at here
    // chrome.tabs.executeScript(null,{code:"document.body.style.backgroundColor='green'"});

    // change the document'e element,this can work
    // var bodyelement = document.getElementsByTagName("body")[0]
    // bodyelement.style.backgroundColor = "red"

    // add a button for check book
    var book_show_div = document.getElementById("interest_sect_level");

    var a_element = document.createElement('a');
    a_element.className = "j a_show_login colbutt ll";
    a_element.name = "checkbook";
    a_element.href = "#";
    a_element.rel = "nofollow";

    var span_element = document.createElement("span");

    var form_element = document.createElement("form");

    //add action for for customer's submit form
    form_element.addEventListener("submit",function(evt) {
        evt.preventDefault();
        
        // send request
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
                        alert(result);
                        //return result;
                    }
                }
            };
            xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xmlHttp.send(json_data);
        };
        sendRequest(msg.title,msg.isbn);
    });
    form_element.method = "POST";
    form_element.action = "";
    form_element.name = "customer_fom";
    form_element.className = "miniform";
    var input_element = document.createElement("input");
    input_element.type="submit";
    input_element.className = "minisubmit j";
    input_element.value = "检查";

    form_element.appendChild(input_element);

    span_element.appendChild(form_element);

    
    a_element.appendChild(span_element);

    var star_element = book_show_div.children[3];

    //即使在页面上增加了按钮，但是由于浏览器的同源策略的存在，导致当点击按钮时的请求还是无法发送。
    // 所以这种方法还是存在一定的局限性
    // book_show_div.insertBefore(a_element,star_element);

    // 不通过button发送请求，直接发送Ajax请求。
    // 但是由于豆瓣的页面使用的是https的协议，如果直接使用http协议，则请求会被停止。
    // 由于同源策略的存在，使得无法在content_script.js中发送信息
    // var sendRequest = function(title,isbn) {
    //     // var url = "http://www.good.com/testjson.php";
    //     var url = "https://www.good.com/js/testjson.php";
    //     var json = {"isbn":isbn.trim(),"title":title};
    //     var json_data = JSON.stringify(json);
    //     xmlHttp = new XMLHttpRequest();
    //     xmlHttp.open("POST",url,true);
    //     xmlHttp.onreadystatechange = function() {
    //         if(xmlHttp.readyState == 4) {
    //             if(xmlHttp.status == 200) {

    //                 //Modify DOM
    //                 var buy_info_div =  document.getElementById("buyinfo");
    //                 // get the buy_infO-div's parent element
    //                 var aside_div = document.getElementsByClassName("aside")[0];
    //                 // create element
    //                 var show_book_info_element = document.createElement("div");
    //                 show_book_info_element.className = "gray_ad";
    //                 show_book_info_element.id = "whulib";
    //                 var  h2_element = document.createElement("h2");
    //                 // var h2_text = document.createTextNode("武汉大学图书馆没有这本书");
    //                 // h2_element.appendChild(h2_text);
    //                 show_book_info_element.appendChild(h2_element);
    //                 aside_div.insertBefore(show_book_info_element,buy_info_div);


    //                 var text = xmlHttp.responseText;
    //                 //convert str to json
    //                 var response = JSON.parse(text);
    //                 var result = response.result;
    //                 var result_code = data.result["result"];
    //                 if(result_code == 1) {
    //                     var book_url = result["url"];
    //                     h2_element.innerHTML = '<a href='+book_url+' target="_blank">whu</a>';
    //                 } else {
    //                     h2_element.innerHTML = '不存在';
    //                 }
    //             }
    //         }
    //     };
    //     xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    //     xmlHttp.send(json_data);
    // };
    // sendRequest(msg.title,msg.isbn);
    chrome.runtime.sendMessage(msg);
}

//接受从background.js发送过来的信息
chrome.runtime.onMessage.addListener(function(request, sender, sendRequest){
    var result = request.action;

    var result_code = result["result"];


    //Modify DOM
    var buy_info_div =  document.getElementById("buyinfo");
    // get the buy_infO-div's parent element
    var aside_div = document.getElementsByClassName("aside")[0];
    // create element
    var show_book_info_element = document.createElement("div");
    show_book_info_element.className = "gray_ad";
    show_book_info_element.id = "whulib";
    var  h2_element = document.createElement("h2");
    // var h2_text = document.createTextNode("武汉大学图书馆没有这本书");
    // h2_element.appendChild(h2_text);
    show_book_info_element.appendChild(h2_element);
    aside_div.insertBefore(show_book_info_element,buy_info_div);


    if(result_code == 1) {  //图书馆存在
        var book_url = result["url"];
        var book_infos = result["info"];

        //得到图书馆信息
        var libs = Array();
        for(key in book_infos) {
            if(!key.match(/^\d+$/)) { //判断是否为数字
                libs.push(key);
            }
        }

        
        var show_book_infos = Array();
        var len = libs.length;
        for(var i=0;i<len;i++) {
            var lib = libs[i];
            var lib_info = book_infos[lib];
            // console.log(lib_info);
            var all_types = "";
            var book_type_num = "";  //不同种类的书籍的数量
            for(item in lib_info) {
                var info = lib_info[item];
                var type = info["type"];
                var num = info["count"];
                all_types += type+"/";
                book_type_num += num+"/";
            }
            //去掉最后的"/"符号
            all_types = all_types.slice(0,all_types.length-1);
            book_type_num = book_type_num.slice(0,book_type_num.length-1);
            show_book_infos.push([lib,all_types,book_type_num]);
        }

        //添加表头
        var tableHeader = new Array("分馆","类型","数量");
        var s = '<table><tr>';
        for(index in tableHeader) {
            s += '<td style="padding:3px;text-align:center;border:1px dashed #ddd;"><b>' + tableHeader[index] + '</b></td>';
        }
        s += '</tr>';

        //添加书籍信息
        for(i in show_book_infos) {
            s += '<tr>';
            var book_data = show_book_infos[i];
            for(j in book_data) {
                s += '<td style="padding:3px;text-align:center;border:1px dashed #ddd;">' + book_data[j] + '</td>';
            }
            s += '</tr>';
        }
        // 加上链接
        s += '</table>';
        s += '<a href='+book_url+' target="_blank">whu</a>';
        // h2_element.innerHTML = '<a href='+book_url+' target="_blank">whu</a>';
        h2_element.innerHTML = s;
    } else {
        h2_element.innerHTML = '不存在';
    }


    // alert(request.action["url"]);
    // alert(request.action["result"]);

});



