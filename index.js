"use strict";
let url = require("url");
let cheerio = require("cheerio");
let Crawler = require("./crawler.js").Crawler;

let getOption = (path) => {
    let parsedUrl = url.parse(path);
    return {
        host: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        headers: {
            'Accept': "application/json, text/javascript, */*; q=0.01",
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': "http://camf.com.cn/",
            'Connection': 'keep-alive',
        }
    };
}
let getOption2 = (value) => {
    let parsedUrl = url.parse("http://camf.com.cn/tools/getjson.aspx?type=42&r=" + Math.random() * 1 + "&value=" + value.attribs.onclick.match(/productdl\(\'(\d+)/)[1] + "&value2=");
    return {
        host: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        headers: {
            'Accept': "application/json, text/javascript, */*; q=0.01",
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': "http://camf.com.cn/zw/16.html",
            'Connection': 'keep-alive',
        }
    }
}
let getOption3 = (value) => {
    let parsedUrl = url.parse("http://camf.com.cn/tools/getjson.aspx?type=50&r=" + Math.random() * 1 + "&value=" + value.attribs.onclick.match(/productxl\(\'(\d+)/)[1] + "&value2=");
    return {
        request: [{
            host: parsedUrl.hostname,
            path: parsedUrl.pathname + parsedUrl.search,
            headers: {
                'Accept': "application/json, text/javascript, */*; q=0.01",
                'X-Requested-With': 'XMLHttpRequest',
                'Referer': "http://camf.com.cn/2016/search.html",
                'Connection': 'keep-alive',
            }
        }],
        callback: function($) {
            return cheerio.load($.data.companylist);
        }
    }
}
let getOption4 = (value) => {
    console.log(value.attribs.onclick)
    let parsedUrl = url.parse("http://camf.com.cn/tools/getjson.aspx?type=41&r=" + Math.random() * 1 + "&value=" + value.attribs.onclick.match(/company\(\'(\d+)/)[1] + "&value2=");
    return {
        host: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        headers: {
            'Accept': "application/json, text/javascript, */*; q=0.01",
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': "http://camf.com.cn/2016/search.html",
            'Connection': 'keep-alive',
        }
    }
}
let getContent = ($) => {
    var data = {};
    var nameArr = ["name", "address", "user", "postcode", "telephone", "email", "fax", "website", "profile"];
    $("#right .mytable").eq(0).find("tbody tr").each((index, value) => {
        data[nameArr[index]] = $(value).find("td").eq(1).text();
    })
    $("#right .mytable").eq(1).find("tbody tr").each((index, value) => {
        data["booth"] = $(value).find("td").eq(0).text();
        data["number"] = $(value).find("td").eq(1).text();
    })
    $("#right .mytable").eq(2).find("tbody tr").each((index, value) => {
        data["product"] = $(value).find("td").eq(0).text();
        data["smallType"] = $(value).find("td").eq(1).text();
        data["bigType"] = $(value).find("td").eq(2).text();
    })
    return data;
}
let cr = new Crawler("http://camf.com.cn/2016/search.html", 2000);
cr.find("#product_type a", getOption2).find("li a", getOption3).find("li a", getOption4).getContent(getContent).write("all.json");