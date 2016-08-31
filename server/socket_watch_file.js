'use strict';
var cmd=require("child_process").exec;
cmd("mkdir test");
cmd("cd test");
cmd("mkdir test01");