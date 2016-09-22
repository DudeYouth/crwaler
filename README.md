
### 爬虫（Crawler）


####     Crawler(url,times)   实例化爬虫
 +          url：主入口页面
 +          times: 设置请求每个请求的间隔

####    find(element,callback)  查找连接 
 +          element: 获取的页面标签，一般指A标签
 +          callback：非页面请求处理方法（如ajax请求）

####    getContent(callback)  获取内容
 +          callback: 获取页面内容处理方法（获取的数据组成对象，返回该对象）

####    write(filename)  写入文件
 +          filename: 设置生成数据文件的路径
