function Blob(x, y, r, PerfectCircle = true, name = "nobody", skin) {
  this.pos = createVector(x, y);
  this.r = r;
  this.vel = createVector(0, 0);
  this.name = name;
  this.skin = skin;
  let img;
  let colorT = [random(255), random(255), random(40, 200)];
  let movingAbs = 0,
    movingOrd = 0,
    xoff = random(0, 100),
    yoff = random(1000, 10000);

  if (!PerfectCircle) {
    let url = "img/" + skin + ".png";
    img = loadImage(
      url,
      (yes) => {
        console.log("画像が読み込まれました!");
      },
      (no) => {
        skin = "mask";
      }
    );
  }
  this.show = function () {
    fill(colorT[0], colorT[1], colorT[2]);
    if (PerfectCircle) {
      ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2);
    } else {
      //スキンを選択しない場合
      if (skin === "mask") {
        //楕円形が変わるように
        push();
        translate(this.pos.x, this.pos.y);
        beginShape();
        let xoff = 0;
        for (let i = 0; i < TWO_PI; i += 0.1) {
          let offset = map(noise(xoff, yoff), -1, 1, -25, 25);
          let r = this.r + offset;
          let x = r * cos(i);
          let y = r * sin(i);
          vertex(x, y);
          xoff += 0.1;
        }
        endShape();
        pop();
        yoff += 0.01;
      } else {
        ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2);
        // コードを更新に移動
      }
    }
  };
  this.update = function () {
    let mouse = createVector(mouseX, mouseY);
    //ボールの位置に関連してマウスの位置をリンクするベクトルの方向に進みます
    mouse.sub(width / 2, height / 2);
    //ベクトルの速度は常に3になります
    mouse.setMag(5);
    this.vel.lerp(mouse, 0.2);
    this.pos.add(this.vel);
    if (skin === "mask") {
      //動きの矢印表示
      drawArrow(this.pos, mouse, 200);
    } else {
      drawIMG(this.pos, mouse, img, this.r * 1.5);
    }
  };

  this.updateOther = function (x, y, r) {
    let newV = createVector(x, y);
    xoff += 0.01;
    yoff += 0.02;
    //0と1の間のノイズプラスマイナスランダムは0と幅の間の値を与えます
    movingAbs = map(noise(xoff), 0, 1, -10, 10);
    movingOrd = map(noise(yoff), 0, 1, 0 - 10, 10);
    drawIMG(newV, createVector(movingAbs, movingOrd), img, this.r * 1.5);
    this.pos = newV;
    this.r = r;
  };

  this.eat = function (other) {
    // それを食べるには、ブロブは他のブロブよりも大きくなければなりません
    if (this.r > other.r) {
      let d = p5.Vector.dist(this.pos, other.pos);
      //2つのブロブ間の距離が一方の半径+もう一方の半径よりも小さい場合
      if (d < this.r + other.r) {
        //this.r += other.r/5;動作しますが、より良い
        //エリアを追加します
        let sum = PI * this.r * this.r + PI * other.r * other.r;
        this.r = sqrt(sum / PI);
        return true;
      }
    }
    return false;
  };

  this.constrain = function (MAPSIZE) {
    blob.pos.x = constrain(blob.pos.x, -width * MAPSIZE, width * MAPSIZE);
    blob.pos.y = constrain(blob.pos.y, -height * MAPSIZE, height * MAPSIZE);
  };

  function drawIMG(base, vec, img, size) {
    push();
    translate(base.x, base.y);
    rotate(vec.heading());
    translate(vec.mag(), 0);
    image(img, vec.x, vec.y, size, size);
    pop();
  }
  function drawArrow(base, vec, myColor) {
    push();
    stroke(myColor);
    strokeWeight(3);
    fill(myColor);
    translate(base.x, base.y);
    line(0, 0, vec.x, vec.y);
    rotate(vec.heading());
    let arrowSize = 7;
    translate(vec.mag() - arrowSize, 0);
    triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
    pop();
  }
}
