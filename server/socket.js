"use strict";
let fs = require("fs");
var path = require("path");
var url = require("url");
let types = {
    "css": "text/css",
    "gif": "image/gif",
    "html": "text/html",
    "ico": "image/x-icon",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "js": "text/javascript",
    "json": "application/json",
    "pdf": "application/pdf",
    "png": "image/png",
    "svg": "image/svg+xml",
    "swf": "application/x-shockwave-flash",
    "tiff": "image/tiff",
    "txt": "text/plain",
    "wav": "audio/x-wav",
    "wma": "audio/x-ms-wma",
    "wmv": "video/x-ms-wmv",
    "xml": "text/xml"
};
fs.stat("test.html", function(err, status) {
    if (err) {
        throw err;
    } else {
        let app = require("http").createServer(function(req, res) {
            var pathname = url.parse(req.url).pathname;
            var contentType = types[path.extname(pathname).substr(1)];
            fs.stat(pathname.substr(1), function(err, status) {
                if (err) {
                    console.log(err)
                } else {
                    fs.readFile(pathname.substr(1), "utf-8", function(err, file) {
                        res.setHeader("Content-type", contentType);
                        res.setHeader("Conttent-length", Buffer.byteLength(file, "utf-8"));
                        res.end(file);
                    })
                }
            })
        })
        let io = require("socket.io").listen(app);
        setInterval(function() {
            io.sockets.send(new Date());
        }, 1000)
        app.listen(3000);
    }
})