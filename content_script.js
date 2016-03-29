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
    // var create_a_elemt_str = "<a href='dada'>gdgdg</a>";

    // var create_a_elemt_str = "<input type=\"radio\" name=\"sex\">"

    // var a_element = document.createElement("<input type=\"radio\" name=\"sex\">");

    var span_element = document.createElement("span");

    var form_element = document.createElement("form");
    form_element.method = "POST";
    form_element.action = "";
    form_element.className = "miniform";
    var input_element = document.createElement("input");
    input_element.type="submit";
    input_element.className = "minisubmit j";
    input_element.value = "检查";

    form_element.appendChild(input_element);

    span_element.appendChild(form_element);

    
    a_element.appendChild(span_element);

    var star_element = book_show_div.children[3];
    book_show_div.insertBefore(a_element,star_element);
    

    chrome.runtime.sendMessage(msg);
}

