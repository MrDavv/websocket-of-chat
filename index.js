var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// app.get('/', function(req, res){
// 	res.send('<h1>Welcome Realtime Server</h1>');
// });
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'public'))); //设置静态文件目录
//在线用户
var onlineUsers = {};
//当前在线人数
var onlineCount = 0;

io.on('connection', function(socket){
	console.log('a user connected');
	
	//监听新用户加入
	socket.on('login', function(obj){
		//将新加入用户的唯一标识当作socket的名称，后面退出的时候会用到
		socket.name = obj.userid;
		
		//检查在线列表，如果不在里面就加入
		if(!onlineUsers.hasOwnProperty(obj.userid)) {
			onlineUsers[obj.userid] = obj.username;
			//在线人数+1
			onlineCount++;
		}
		
		//向所有客户端广播用户加入
		io.emit('login', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});
		console.log(obj.username+'加入了聊天室');
	});
	
	//监听用户退出
	socket.on('disconnect', function(){
		//将退出的用户从在线列表中删除
		if(onlineUsers.hasOwnProperty(socket.name)) {
			//退出用户的信息
			var obj = {userid:socket.name, username:onlineUsers[socket.name]};
			
			//删除
			delete onlineUsers[socket.name];
			//在线人数-1
			onlineCount--;
			
			//向所有客户端广播用户退出
			io.emit('logout', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});
			console.log(obj.username+'退出了聊天室');
		}
	});
	
	//监听用户发布聊天内容
	socket.on('message', function(obj){
		//向所有客户端广播发布的消息
		io.emit('message', obj);
		console.log(obj.username+'说：'+obj.content);
	});
  
});

http.listen(3001, function(){
	console.log('listening on *:3001');
});
// app.use(bodyParser.json());//解析json数据格式的
// app.use(bodyParser.urlencoded({ extended: false }));//解析form表单提交的数据 querystring(false，不能解析复杂的对象) qs(true,用来解析复杂的对象)
// const express = require('express');
// const app = express();
// const http = require('http');
// const server = http.Server(app);
// const io = require('socket.io')(server)；
// app.set('views', )
// app.use(express.static(path.join(__dirname + 'public')));