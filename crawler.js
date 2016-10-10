"use strict";
let fs = require("fs");
let http = require("http");
let cheerio = require("cheerio");
let htmlText = "";
let i = 1;
class Crawler {
    constructor(main, timer, callback) {
            this.main = main;
            this.requestList = []; //请求队列   缓存所有的请求方法
            this.callbackList = []; //回调方法队列   缓存所有的回调方法
            this.count = 0; //计数器
            this.length = 0;
            this.timer = timer;
            //发出第一个请求
            this.request(main, ($) => {
                this.callbackList[0]($); //执行第一个回调方法
            });
        }
        //请求方法
    request(requestUrl, callback) {
        console.log(i++)
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
                    let $ = null;
                    try {
                        $ = JSON.parse(htmlText);
                    } catch (err) {
                        $ = cheerio.load(htmlText);
                    }
                    callback && callback($, requestUrl);
                    let fun = this.requestList.shift();
                    fs.writeFile('count.txt', (++this.count) + requestUrl, (err) => {});
                    fun && fun($);
                    clearTimeout(timer);
                    timer = null;
                }, this.timer)

            })
        })
    }
    find(element, callback) { //查找接口
        var count = ++this.count;
        this.callbackList.push(($) => { //回调方法入栈
            this.findUrl($, element, callback, count);
        })
        return this;
    }
    getContent(callback) { //获取内容接口
        this.callbackList.push(($, url) => {
            this.write(callback($));
        })
        return {
            write: (src) => { //写入文件接口
                this.fileName = src;
                this.write = (data) => {
                    if (typeof data === "function" || typeof data == "undefined") {
                        return;
                    }
                    fs.appendFile(src, (typeof data == "string" ? data : JSON.stringify(data) + ","), (err) => {
                        if (!this.requestList.length) {
                            fs.appendFile(src, "]", () => {})
                        }
                    });
                }
            }
        }
    }
    findUrl($, element, callback, count) { //生成请求队列接口
        let next = this.callbackList[count];
        if (typeof $ == "function") { //抓取页面
            $(element).each((index, value) => {
                this.pushList($, element, value, callback, next);
            })
        } else if ($ instanceof Array) { //抓取json
            $.forEach((value, index) => {
                this.pushList($, element, value, callback, next);
            })
        }

    }
    pushList($, element, value, callback, next) { //加入队列
        this.requestList.push(() => {
            let param = callback ? callback(value) : $(value).attr("href"); //处理请求链接，如果没有设置回调函数处理则当作a标签处理
            let requestUrl = ""; //请求链接
            let count = 0;
            let arr = [];
            if (!param.request || !param.callback) { //如果回调函数返回的配置没有对象含有request与callback，则视为普通请求处理，如果复合要求则当作并行请求处理
                requestUrl = param;
            } else {
                requestUrl = param.request;
            }
            if (requestUrl instanceof Array) { //并行请求处理
                requestUrl.forEach((value) => {
                    this.request(value, (_$) => {
                        arr.push(_$);
                        if (++count >= requestUrl.length) { //回调函数返回的请求队列都响应完成后才执行下一步
                            next(param.callback && param.callback(...arr));
                            arr = null; //清空闭包
                            param = null;
                            requestUrl = null;
                        }
                    });
                })
            } else { //唯一请求处理
                this.request(requestUrl, (_$) => {
                    next(_$);
                    arr = null; //清空闭包
                    param = null;
                    requestUrl = null;
                });
            }
        })
    }
}
exports.Crawler = Crawler;