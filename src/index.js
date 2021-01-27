// Express
const express = require("express"),
  https = require("http"),
  app = express();

// system
app.use(express.static(__dirname + "/public"));
const server = https.createServer(app).listen(8080);
console.log("server start!!:", 8080);

let socket = require("socket.io");
let io = socket(server);
io.sockets.on("connection", newConnection);

//各クライアントのデータを全員に送信するループ
setInterval(heartbeat, 50);

function heartbeat() {
  io.sockets.emit("heartbeat", clients);
}

let clients = [];

function Blob(id, x, y, r, name, img) {
  this.id = id;
  this.x = x;
  this.y = y;
  this.r = r;
  this.name = name;
  this.img = img;
}

function newConnection(socket) {
  console.log("新規のクライアントが入室しました :" + socket.id);
  let soCid = socket.id;
  let once = true;

  //断線の場合
  socket.on("disconnect", function (msg) {
    console.log("クライアントが退出しました :" + soCid + " car :" + msg);
    clients.splice(clients[soCid], 1);
  });

  socket.on("mouse", mouseMsg);
  socket.on("start", starting);
  socket.on("update", updateData);
  socket.on("eaten", eatBlob);
  //すべての顧客にデータを送信
  function mouseMsg(data) {
    socket.broadcast.emit("mouse", clients);
  }
  //クライアントテーブルへのblobの追加
  function starting(data) {
    console.log(
      "id: " +
        socket.id +
        " x: " +
        data.x +
        " y: " +
        data.y +
        " r: " +
        data.r +
        " name: " +
        data.name +
        " img " +
        data.img
    );
    let blob = new Blob(socket.id, data.x, data.y, data.r, data.name, data.img);
    clients.push(blob);
  }
  //プレーヤーの位置の更新
  function updateData(data) {
    let blob;
    //簡単な方法ですが最適化されていません。ハッシュマップを作成し、顧客を削除した場合はルートを逆にします
    for (let i = clients.length - 1; i >= 0; i--) {
      //２体になっちゃうバグがある
      if (socket.id === clients[i].id) {
        blob = clients[i];
        try {
          blob.x = data.x;
          blob.y = data.y;
          blob.r = data.r;
        } catch (e) {
          console.error(e);
        }
      }
    }
  }
  //プレーヤーの位置の更新
  function eatBlob(id) {
    for (let i = clients.length - 1; i >= 0; i--) {
      //２体になっちゃうバグがある
      if (id === clients[i].id && once === true) {
        console.log("切断しました : " + clients[i].name + " " + id);
        io.to(id).emit("forceDisconnect");
        clients.splice(clients[id], 1);
        once = false;
      }
    }
    once = true;
  }
}
