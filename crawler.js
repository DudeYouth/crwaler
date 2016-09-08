'use strict';
let fs = require("fs");
let http = require("http");
let cheerio = require("cheerio");
class Crawler {
    constructor(main) {
        this.main = main;
        this.requestList = [];
        this.callbackList = [];
        this.count = 0;
        fs.writeFile('data.json', "[", () => {});
        this.request(main, ($) => this.callbackList.shift()($));
    }
    request(requestUrl, callback) {
        let _this = this;
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
                    let fun = _this.requestList.shift();
                    fs.writeFile('count.txt', (++_this.count) + requestUrl, (err) => {});
                    fun && fun($);
                    clearTimeout(timer);
                    timer = null;
                }, 1000)

            })
        })
    }
    find(element, callback) {
        this.callbackList.push(($) => {
            this.findUrl($, element);
        })
        return this;
    }
    getContent(callback) {
        this.callbackList.push(($) => {
            this.write(callback($));
        })
        return {
            write: (src) => {
                this.write = (data) => {
                    fs.appendFile(src, (JSON.stringify(data) + ","), (err) => {
                        if (!this.requestList.length) {
                            fs.appendFile(src, "]", () => {})
                        }
                    });
                }
            }
        }
    }
    findUrl($, element) {
        let next = this.callbackList.shift();
        $(element).each((index, value) => {
            this.requestList.push((($) => {
                return () => {
                    this.request(($(value).attr("href")), function(_$) {
                        next(_$);
                    });
                };
            })($))
        })
    }
}
let cr = new Crawler("http://www.nongji1688.com/");
cr.find("#side .pr2016 .ditemlist a").find("#main1 .txd_sx_plist .fix li a").getContent(crawlerContent).write("data.json");
//爬每个列表链接的内容并保存
function crawlerContent($) {
    let types = ["type", "brand", "model"];
    let data = {};
    let attrElement = $(".zj_cp_r .cp_data li");
    let specElement = $(".zj_con");
    let imagesElement = $(".cx_list .gscp_u img");
    data.spec = [];
    data.images = [];
    data.name = $(".zj_cp_r h1").text().trim();
    data.parent = $(".zj_tp_n .zj_title a").last().text().trim();
    types.forEach((value, index) => {
        data[value] = attrElement.eq(index).text().split("：")[1].trim();
    })
    specElement.find('.sj_cx table').each((index, table) => {
        let tr = $(table).find("tr");
        tr = tr.slice(1, tr.length);
        tr.length && tr.each((index, tr) => {
            let tdElement = $(tr).find("td");
            data.spec.push({
                name: tdElement.eq(0).text().trim(),
                value: tdElement.eq(1).text().trim()
            })
        })
    })
    specElement.find(".sj_cs ul").each((index, ul) => {
        let lis = $(ul).find("li");
        lis = lis.slice(1, lis.length);
        lis.length && lis.each((index, li) => {
            data.spec.push({
                name: $(li).find("span").text().trim(),
                value: $(li).find("label").text().trim()
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
                name: text[0].trim(),
                value: text[1].trim()
            })
        })
    })
    imagesElement.each((img) => {
        let src = $(img).attr("src")
        src && data.images.push(src);
    })
    return data;

}