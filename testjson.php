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
                fwrite($file, $title);
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

                $length = strlen($final_result);
                // echo $length;
                if ($length>35000) {
                    return 1;
                    // echo "有";
                } else {
                    return 0;
                    // echo "无";
                }
            } else {
                return 0;
                // echo "string";
            }

        } else {
            // echo "不存在";
            return 0;
        }
    }
?>