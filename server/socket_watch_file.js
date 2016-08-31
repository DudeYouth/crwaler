'use strict';
let fs = require("fs");
let path = require("path");
let cmd = require('node-cmd');
let exec = require("child_process").exec;
let flag = true;
let watchAllFile = (fpath) => {
    fs.readdir(fpath, (err, files) => {
        files.forEach((value) => {
            let filePath = fpath + "/" + value
            fs.stat(filePath, (err, stat) => {
                if (err) {
                    console.log(err);
                    return;
                } else {
                    if (stat.isDirectory()) {
                        watchAllFile(filePath);
                    } else {
                        fs.watchFile(filePath, (err) => {
                            console.log("begin...")
                            if (flag) {
                                flag = false;
                                exec("cd server", function(err) {
                                    if(err){
                                        console.log(err);
                                        return;
                                    }
                                    
                                    cmd.get("git init", () => {
                                        cmd.get("git add .", () => {
                                            cmd.get(`git commit -m"${value}"`, () => {
                                                console.log(3)
                                                cmd.get("git push origin master", () => {
                                                    flag = true;
                                                    console.log(4);
                                                })
                                            })
                                        })
                                    })
                                })
                            }
                        })
                    }
                }
            })
        })
    })
}
watchAllFile(__dirname);