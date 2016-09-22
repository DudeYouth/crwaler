"use strict";
let url = require("url");
let Crawler = require("./crawler.js").Crawler;

let getOption = (path) => {
    let parsedUrl = url.parse(path);
    return {
        host: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        headers: {
            'Accept': "application/json, text/javascript, */*; q=0.01",
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': "http://camf.com.cn/zw/16.html",
            'Connection': 'keep-alive',
        }
    };
}
var getImageUtl = (str) => {
    let reg = /url\(([^\)]+)?\)/;
    return "http://camf.com.cn/" + reg.exec(str)[1];
}
let getOption2 = (value) => {
    let parsedUrl = url.parse("http://camf.com.cn/tools/getjson.aspx?type=9&id=" + value.Image + "&r=" + Math.random() * 1);
    return {
        request: [{
            host: parsedUrl.hostname,
            path: parsedUrl.pathname + parsedUrl.search,
            headers: {
                'Accept': "application/json, text/javascript, */*; q=0.01",
                'X-Requested-With': 'XMLHttpRequest',
                'Referer': "http://camf.com.cn/zws/122.html?r=" + Math.random() * 1,
                'Connection': 'keep-alive',
            }
        }, "http://camf.com.cn/zws/" + value.Image + ".html?r=" + Math.random() * 1],
        callback: ($1, $2) => {
            if ($1 instanceof Array) {
                return {
                    images: getImageUtl($2("#lay1").attr("style")),
                    data: $1,
                }
            } else if ($2 instanceof Array) {
                return {
                    images: getImageUtl($1("#lay1").attr("style")),
                    data: $2,
                }
            }
        }
    }
}
let cr = new Crawler(getOption("http://camf.com.cn/tools/getjson.aspx?type=3&id=16&r=0.9083420367568256"), 500);
cr.find("", getOption2).getContent((json) => {
    return json;
}).write("new.json");