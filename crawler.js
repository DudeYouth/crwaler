'use strict';
let fs = require("fs");
let http = require("http");
let cheerio = require("cheerio");
let countId = 850000;
let pages = 30;
let count = 0;
let requestList = [];
crawler("http://www.nongji1688.com/", crawlerType);


fs.writeFile('data.json', "[", () => {});

function crawler(requestUrl, callback) {
    http.get(requestUrl, (res) => {
        let htmlText = "";
        res.on("data", (chunk) => {
            htmlText += chunk;
        })
        res.on("err", (chunk) => {
            console.log("error:" + chunk);
            return false;
        })
        res.on("end", (err) => {
            let timer = setTimeout(() => {
                let $ = cheerio.load(htmlText);
                callback && callback($);
                let fun = requestList.shift();
                fs.writeFile('count.txt', (++count) + requestUrl, (err) => {});
                fun && fun($);
                clearTimeout(timer);
                timer = null;
            }, 1000)

        })
    })
}
//爬主页下面的所有分类链接
function crawlerType($) {
    $("#side .pr2016 .ditemlist a").each(function() {
        for (let i = 1; i <= pages; i++) {
            requestList.push(function($, i) {
                return (function() {
                    crawler(($(this).attr("href") + i), function(_$) {
                        if (!_$("#main1 .txd_sx_plist .fix li").length) {
                            requestList.splice(0, pages - i);
                            return false;
                        }
                        i = null;
                        $ = null;
                        crawlerList(_$);
                    });
                }).bind(this);
            }.call(this, $, i))
        }
    })
}
//爬每个分类下面的列表链接
function crawlerList($) {
    $("#main1 .txd_sx_plist .fix li a").each(function() {
        requestList.push(function($) {
            return (function() {
                crawler(($(this).attr("href")), function(_$) {
                    crawlerContent(_$);
                });
            }).bind(this);
        }.call(this, $))
    })
}
//爬每个列表链接的内容并保存
function crawlerContent($) {
    let types = ["type", "brand", "model"];
    let data = {};
    let attrElement = $(".zj_cp_r .cp_data li");
    let specElement = $(".zj_con");
    let imagesElement = $(".cx_list .gscp_u img");
    data.id = countId++;
    data.spec = [];
    data.images = [];
    data.name = $(".zj_cp_r h1").text();
    data.parent = $(".zj_tp_n .zj_title a").last().text();
    types.forEach((value, index) => {
        data[value] = attrElement.eq(index).text().split("：")[1];
    })
    specElement.find('.sj_cx table').each((index, table) => {
        let tr = $(table).find("tr");
        tr = tr.slice(1, tr.length);
        tr.length && tr.each((index, tr) => {
            let tdElement = $(tr).find("td");
            data.spec.push({
                name: tdElement.eq(0).text(),
                value: tdElement.eq(1).text()
            })
        })
    })
    specElement.find(".sj_cs ul").each((index, ul) => {
        let lis = $(ul).find("li");
        lis = lis.slice(1, lis.length);
        lis.length && lis.each((index, li) => {
            data.spec.push({
                name: $(li).find("span").text(),
                value: $(li).find("label").text()
            })
        })
    })
    specElement.find(".sj_cx div.cx_list").each((index, cxlist) => {
        let ps = $(cxlist).find("p");
        ps = ps.slice(1, ps.length);
        ps.length && ps.each((index, p) => {
            let text = $(p).text().split("：");
            if (text.length < 2) {
                return false;
            }
            data.spec.push({
                name: text[0],
                value: text[1]
            })
        })
    })
    imagesElement.each((img) => {
        let src = $(img).attr("src")
        src && data.images.push(src);
    })
    if (data.spec.length == 0 && data.images.length && data.name == "" && data.parent == "") {
        return false
    }
    fs.appendFile('data.json', (JSON.stringify(data) + ","), (err) => {
        if (!requestList.length) {
            fs.appendFile('data.json', "]", () => {})
        }
    });

}