'use strict';
let fs = require("fs");
let http = require("http");
let cheerio = require("cheerio");
let countId = 850000;
let urlId = 5310000;
crawler(getUrl(urlId));

function getUrl(id) {
    return "http://sdry.nongji1688.com/sell/itemid-" + id + ".html";
}

function crawler(requestUrl) {
    http.get(requestUrl, function(res) {
        let htmlText = "";
        fs.writeFile('count.txt', urlId, function(err) {});
        res.on("data", function(chunk) {
            htmlText += chunk;
        })
        res.on("err", function(chunk) {
            crawler(getUrl(++urlId));
            return false;
        })
        res.on("end", function(err) {
            if (!htmlText) {
                crawler(getUrl(++urlId));
                return false;
            }
            let $ = cheerio.load(htmlText);
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
            types.forEach(function(value, index) {
                data[value] = attrElement.eq(index).text().split("：")[1];
            })
            specElement.find('.sj_cx table').each(function(index, table) {
                let tr = $(table).find("tr");
                tr = tr.slice(1, tr.length);
                tr.length && tr.each(function(index, tr) {
                    let tdElement = $(tr).find("td");
                    data.spec.push({
                        name: tdElement.eq(0).text(),
                        value: tdElement.eq(1).text()
                    })
                })
            })
            specElement.find(".sj_cs ul").each(function(index, ul) {
                let lis = $(ul).find("li");
                lis = lis.slice(1, lis.length);
                lis.length && lis.each(function(index, li) {
                    data.spec.push({
                        name: $(li).find("span").text(),
                        value: $(li).find("label").text()
                    })
                })
            })
            specElement.find(".sj_cx div.cx_list").each(function(index, cxlist) {
                let ps = $(cxlist).find("p");
                ps = ps.slice(1, ps.length);
                ps.length && ps.each(function(index, p) {
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
            imagesElement.each(function(img) {
                let src = $(img).attr("src")
                src && data.images.push(src);
            })
            fs.appendFile('data.json', (JSON.stringify(data) + ","), function(err) {
                if (urlId > 5499999) {
                    return false;
                }
                crawler(getUrl(++urlId));
                if (err) {
                    console.log(err)
                }
            });
        })
    })

}