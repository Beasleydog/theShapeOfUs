var particles = [];
var popSound = new Audio("https://raw.githubusercontent.com/Beasleydog/seekingorder/main/firework.mp3");
var fireworkcolors = ["#e64a19", "#ffee58", "#43a047", "#2196f3"];
function particle(x, y, xv, yv, r, p, color) {
  this.color = color || fireworkcolors[Math.floor(fireworkcolors.length * Math.random())];
  this.x = x;
  this.y = y;
  this.xv = xv;
  this.yv = yv;
  this.rad = r;
  this.popped = p;
}
var littleRad = 5;
var fireworkcount = 0;
var c = fireworkCanvas;
c.width = window.innerWidth;
c.height = window.innerHeight;
c.style.left = "0px";
c.style.top = "0px";
var fctx = c.getContext("2d");
function clearFctx() {
  particles = [];
  fctx.clearRect(0, 0, c.width, c.height);
}
function spawnFireworks(c) {
  fireworkcount = c;
  count = fireworktime;
}
var fireworkBackColor = redColor;
var fireworktime = 20;
var count = fireworktime;
setInterval(function tick() {
  count--;
  if (count == 0) {
    if (fireworkcount > 0) {
      fireworkcount--;
      particles.push(
        new particle(
          Math.random() * window.innerWidth,
          window.innerHeight,
          Math.random() * 10 - 5,
          Math.random() * -4 - 6,
          Math.random() * 5 + littleRad * 1.5,
          false
        )
      );
      count = fireworktime;
    } else {
      clearInterval(this);
    }
  }
  fctx.fillStyle = `rgba(${hexToRgb(fireworkBackColor).r}, ${hexToRgb(fireworkBackColor).g
    }, ${hexToRgb(fireworkBackColor).b}, .05)`;
  fctx.fillRect(0, 0, c.width, c.height);

  //   fctx.clearRect(0, 0, c.width, c.height);

  var newPart = [];
  particles.forEach(function (p, i) {
    fctx.beginPath();
    fctx.arc(p.x, p.y, p.rad, 0, 2 * Math.PI);
    fctx.fillStyle = p.color;
    fctx.fill();
    p.x += p.xv;
    p.y += p.yv;
    p.yv += 0.05;
    if (p.yv > -1 && !p.popped) {
      p.popped = true;
      for (var x = -1; x < 1; x += 0.5) {
        for (var y = -1; y < 1; y += 0.5) {
          var lp = new particle(
            p.x,
            p.y,
            x * Math.random() * 4 + p.xv / 2,
            y * Math.random() * 4,
            littleRad,
            true,
            p.color
          );
          particles.push(lp);
          newPart.push(lp);
          delete lp;
        }
      }
      new Audio("https://raw.githubusercontent.com/Beasleydog/seekingorder/main/firework.mp3").play();
      p.color = "transparent";
    }
    if (p.y > window.innerHeight) {
    } else {
      newPart.push(p);
    }
  });
  particles = newPart;
  delete newPart;
}, 10);
function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    }
    : null;
}
