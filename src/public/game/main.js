let socket;
let blob;

let blobs = [];
let clients = [];
let cliBLobs = {};
let biggest = [];
let zoom = 1;
let div;
let name = localStorage["name"];
let skin = localStorage["skin"];
let lastEaten = "";
//同じ ID から複数のイーターシグナルを送信しないように、最後にイーターされたブロブの ID

const MAPSIZE = 4;
const BALLSIZE = 7;

function setup() {
  createCanvas(600, 600);
  imageMode(CENTER);
  noStroke();
  for (let i = 0; i < 50; i++) {
    let x = random(-width * MAPSIZE, width * MAPSIZE);
    let y = random(-height * MAPSIZE, height * MAPSIZE);
    blobs.push(new Blob(x, y, BALLSIZE));
  }
  div = createDiv("").size(100, 400);
  //接続
  socket = io();
  blob = new Blob(0, 0, random(8, 48), false, name, skin);
  //サーバーに送るデータ
  let data = {
    x: blob.pos.x,
    y: blob.pos.y,
    r: blob.r,
    name: name,
    img: skin
  };
  socket.emit("start", data);
  //切断した場合
  socket.on("forceDisconnect", function () {
    window.location = "game_over.html";
    socket.disconnect();
  });
  //他のプレーヤーの位置を更新
  socket.on("heartbeat", function (data) {
    clients = data;
    //食べられる小さな球を追加
    if (blobs.length < 1000) {
      let x = random(-width * MAPSIZE, width * MAPSIZE);
      let y = random(-height * MAPSIZE, height * MAPSIZE);
      blobs.push(new Blob(x, y, BALLSIZE + random(-2, 18)));
    }
  });
  for (let i = 0; i < 50; i++) {
    //位置に応じて移動するので、ウィンドウの外側にも球を作成
    let x = random(-width, width);
    let y = random(-height, height);
    blobs[i] = new Blob(x, y, BALLSIZE);
  }
}

function draw() {
  background(255);
  //キャンバスの原点を移動させて、常に中心にブロブが見えるようにする
  translate(width / 2, height / 2);
  let newzoom = 64 / blob.r;
  zoom = lerp(zoom, newzoom, 0.1);
  scale(zoom);
  translate(-blob.pos.x, -blob.pos.y);
  for (let i = blobs.length - 1; i >= 0; i--) {
    blobs[i].show();
    if (blob.eat(blobs[i])) {
      blobs.splice(i, 1);
    }
  }

  //他ユーザの表示
  for (let i = clients.length - 1; i >= 0; i--) {
    let id = clients[i].id;
    if (id !== socket.id) {
      fill(0, 0, 255);
      try {
        let cliblob = cliBLobs[clients[i].id];
        cliblob.show();
        cliblob.updateOther(clients[i].x, clients[i].y, clients[i].r);
        // fill(200, 30, 0);
        // textAlign(CENTER);
        // textSize(clients[i].r / 3);
        // text(
        //   str(clients[i].name),
        //   int(clients[i].x),
        //   int(clients[i].y + clients[i].r)
        // );

        if (blob.eat(cliblob) && lastEaten !== id) {
          clients.splice(i, 1);
          console.log("すでに食べられたユーザーです！食べないで…");
          socket.emit("eaten", id);
          lastEaten = id;
        }
      } catch (error) {
        //console.log(clients[i].img);
        cliBLobs[clients[i].id] = new Blob(
          clients[i].x,
          clients[i].y,
          clients[i].r,
          false,
          clients[i].name,
          clients[i].img
        );
      }
    }
  }

  blob.show();

  if (mouseIsPressed) {
    blob.update();
  }
  blob.constrain(MAPSIZE);
  biggest = sort2(clients);
  if (clients.length > 1) {
    //RoomIn();
    div.html("対戦中: <br/>");
    let min = clients.length > 15 ? 15 : clients.length;
    for (let i = 0; i < min; i++) {
      // fill(255, 0, 0);
      // textAlign(LEFT);
      // textSize(biggest[i].r / 3);
      // text(biggest[i].id, 10, i * 50);
      div.html(i + 1 + ") " + biggest[min - i - 1].name + " <br/>", true);
    }
  } else {
    div.html("まだ対戦者は居ません");
  }

  let data = {
    x: blob.pos.x,
    y: blob.pos.y,
    r: blob.r
  };
  socket.emit("update", data);
}

function sort2(clients2) {
  let tab = clients2;
  for (let i = 0; i < tab.length; i++) {
    let min = i;
    for (let j = i + 1; j < tab.length; j++) {
      if (tab[j].r < tab[min].r) {
        min = j;
      }
    }
    let tmp = tab[i];
    tab[i] = tab[min];
    tab[min] = tmp;
  }
  return tab;
}

// 発話機能をインスタンス化
let msg = new SpeechSynthesisUtterance();
let voices = window.speechSynthesis.getVoices();

function speak(text) {
  // 以下オプション設定
  msg.voice = voices[7]; // 7:Google 日本人 ja-JP ※他は英語のみ
  msg.volume = 1.0; // 音量 min 0 ~ max 1
  msg.rate = 3; // 速度 min 0 ~ max 10
  msg.pitch = 1.0; // 音程 min 0 ~ max 2

  msg.text = text; // 喋る内容
  msg.lang = "ja-JP"; // en-US or ja-JP

  // 発話実行
  speechSynthesis.speak(msg);
}

// 終了時の処理
msg.onend = function (event) {
  console.log("End: ", text);
};

let text = "入室しました。";

function RoomIn() {
  speak(text);
}
