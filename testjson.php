<?php
        if($_POST) {
        header("content-type:appplication/json:charset:utf-8");
        $rawdata = file_get_contents("php://input");
        $parameters = json_decode($rawdata);
        if($parameters) {
            if(isset($parameters->title)) {
                $title = $parameters->title;
                $isbn = $parameters->isbn;
                $file = fopen("title.txt", "r+");
                fwrite($file, $isbn);
                fclose($file);
                $result = get_book_result($isbn);
                exit(json_encode(array("result"=>$result)));
            }
        }
        exit(json_encode(array("result"=>0)));    
    } else {
        echo "Get方法";
    }

    function get_book_result($isbn) {
        // $isbn = "97871212558161";
        // $isbn = 9787121255816;
        $url = 'http://opac.lib.whu.edu.cn/F/?func=find-m&find_code=ISB&request=';
        $url = $url.$isbn;
        //init
        $ch  =curl_init();
        // settting
        // $url = "http://blog.spoock.com";
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HEADER, 0);

        #execute
        $result = curl_exec($ch);

        //release the handle
        curl_close($ch);
        
        $url_pattern = "/url = '(.*?)'/i";
        $matches = array();

        $redirect_url = "";
        if(preg_match($url_pattern, $result,$matches)) {
            $redirect_url = $matches[1];
        }
        if($redirect_url != "") {
            $ch_2  =curl_init();
            curl_setopt($ch_2, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch_2, CURLOPT_HEADER, 0);
            curl_setopt($ch_2, CURLOPT_URL, $redirect_url);
            $book_result = curl_exec($ch_2);

            #escape special string
            $redirect_pattern = "/\/goto\/(.*?)'/i";
            $re_macth = array();
            if(preg_match($redirect_pattern, $book_result,$re_macth)) {
                $re_redirect_url = $re_macth[1];

                $ch_3 =curl_init();
                curl_setopt($ch_3, CURLOPT_RETURNTRANSFER, 1);
                curl_setopt($ch_3, CURLOPT_HEADER, 0);
                curl_setopt($ch_3, CURLOPT_URL, $re_redirect_url);
                $final_result = curl_exec($ch_3);

                // var_dump($final_result);
                $result = array("result"=>1,"url"=>"");
                $length = strlen($final_result);
                if ($length>35000) {
                    #get the book url
                    $book_url_pattern = "/<a href=(.*?)><font.*?所有单册/i";
                    $matches = array();
                    $book_url = "";
                    if(preg_match($book_url_pattern, $final_result,$matches)) {
                        $book_url = $matches[1];
                    }

                    $result["result"] = 1;
                    $result["url"] = $book_url;
                    $result["info"] = get_stored_book_info($book_url);
                    return $result;
                    // return 1;
                    // echo "有";
                } else {
                    $result["result"] = 0;
                    return $result;
                    // echo "无";
                }
            } else {
                    $result["result"] = 0;
                    return $result;
                // echo "string";
            }

        } else {
            // echo "不存在";
            $result["result"] = 0;
            return $result;
        }
    }


    function get_stored_book_info($url) {
        $ch  =curl_init();
        // settting
        // $url = "http://blog.spoock.com";
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HEADER, 0);

        $result = curl_exec($ch);

        //remove the blan spaces
        $result = preg_replace('/\s+/', "", $result);


        // //release the handle
        curl_close($ch);

        $book_info_pattern = "/<tr>(<tdclass=td1>.*?<\/td>)<\/tr>/"; 
        $book_info = array();
        $matches = array();
        if(preg_match_all($book_info_pattern, $result,$matches)) {
            $book_info = $matches[1];
        }

        $store_info = array();
        $store_infos = array();
        if(sizeof($book_info) != 0) {
            // remove the useless info
            $store_info_pattern = "/<tdclass=td1nowrap>(.*?)</";
            $count = 0;
            foreach ($book_info as $value) {
                if(preg_match_all($store_info_pattern, $value,$matches)) {
                    //get the string which have the stored book info
                    $store_book_address = $matches[1][0];
                    $store_info["book_address"] = $store_book_address;
                    $pattern = "/<tdclass=td1>(.*?)<\/td>/";
                    if(preg_match_all($pattern, $value,$matches)) {

                        $store_info["type"] = $matches[1][2];
                        $store_info["exist"] = $matches[1][3];

                    }
                    $store_infos[$count] = $store_info;
                    $count++;                
                }
            }
        
        }

        // var_dump($store_infos);
        // process book info
        $processed_book_infos = array();
        $book_addresses = array();
        $count = 0;
        foreach($store_infos as $value) {
            $book_address = $value["book_address"];
            if(!in_array($book_address, $processed_book_infos)) {
                array_push($processed_book_infos,$value["book_address"]);
                $value["count"] = 1;
                $processed_book_infos[$book_address][0] = $value;
            } else { //如果图书馆的类别在数组中已经存在
                // 判断图书类型
                $library_type_arrays = $processed_book_infos[$book_address];
                // var_dump($library_type_arrays);
                $book_type = $value["type"];
                $flag = False;
                $array_length = sizeof($library_type_arrays);
                for($i=0;$i<$array_length;$i++) {
                    $library = $library_type_arrays[$i];
                    $library_book_type = $library["type"];
                    if($book_type == $library_book_type) { // 如果类型在数组中存在
                        $library_type_arrays[$i]["count"] += 1;
                        $flag = True;
                    }
                }
                $processed_book_infos[$book_address] = $library_type_arrays;

                if(!$flag) {
                    $count = sizeof($processed_book_infos[$book_address]);
                    $value["count"] = 1;
                    $processed_book_infos[$book_address][$count] = $value;
                }


            }
        }

        return $processed_book_infos;
    }
?>