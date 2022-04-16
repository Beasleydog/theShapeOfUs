var redColor = "#af2e33";
var yellowColor = "#e9b872";
wordDisplay.style.background = redColor;
var redScore = 0;
var yellowScore = 0;
var redLives = 2;
var yellowLives = 2;
var yellowStreakLost = 0;
var redStreakLost = 0;
var tick;
var introTick;
var confirmedColor;
var games = [];
var currentInstruction = 0;
fireworkCanvas.style.display = "none";
var buttonSound = new Audio("https://raw.githubusercontent.com/Beasleydog/seekingorder/main/buttonPress.mp3");
var clickSound = new Audio("https://raw.githubusercontent.com/Beasleydog/seekingorder/main/click.mp3");
var turnSound = new Audio("https://raw.githubusercontent.com/Beasleydog/seekingorder/main/turn.mp3");
var pieces = [];

var wordList = `Dyslexia
ADHD
Dyscalculia
Processing
Senses
Sight
Hearing
Touch
Focus
Attention
Self Control
Emotion
Routine
Focus
Process
Compute
Organization
Dysgraphia
Non-Verbal
Reading
Comprehension
Dyspraxia
Planning
Organizing
Organize
Strategy
Detail
Attention`.split("\n");
var redColor = "#af2e33";
var yellowColor = "#e9b872";
var redScore = 0;
var yellowScore = 0;
var redLives = 2;
var yellowLives = 2;
var yellowStreakLost = 0;
var redStreakLost = 0;
var tick;
var introTick;
var confirmedColor;
var games = [];
var instructionUrls = ["./int0.png", "./int1.png", "./int2.png", "./int3.png", "./int4.png", "./int6.png", "./int7.png", "./int8.png", "./int10.png", "./int11.png", "./int12.png",];
var currentInstruction = 0;
fireworkCanvas.style.display = "none";
var buttonSound = new Audio("https://raw.githubusercontent.com/Beasleydog/seekingorder/main/buttonPress.mp3");
var clickSound = new Audio("https://raw.githubusercontent.com/Beasleydog/seekingorder/main/click.mp3");
var turnSound = new Audio("https://raw.githubusercontent.com/Beasleydog/seekingorder/main/turn.mp3");
var pieces = [];

(function introBackground() {
  introBack.width = window.innerWidth;
  introBack.height = window.innerHeight;
  var currentColor = redColor;
  var ctx = introBack.getContext("2d");
  ctx.shadowBlur = 4;
  ctx.shadowColor = "black";
  function introPiece() {
    this.x = Math.random() * window.innerWidth;
    this.y = -20;
    this.r = 30;
    this.xv = Math.random() * 10 - 5;
    this.yv = -1;
    this.l = false;
    this.c = (confirmedColor || currentColor);
    this.o = 10;
  }
  function introAddPiece() {
    if (document.hasFocus()) {
      pieces.push(new introPiece());
      if (currentColor == redColor) {
        currentColor = yellowColor;
      } else {
        currentColor = redColor;
      }
    }

    setTimeout(introAddPiece, Math.random() * 250 + 125);
  }
  introAddPiece();
  introTick = function () {
    ctx.clearRect(0, 0, introBack.width, introBack.height);
    pieces.map(function (x) {
      ctx.globalAlpha = 1;

      //   ctx.globalAlpha = x.o / Math.abs(x.o);
      if (x.l) {
        x.o -= 0.1;
      }
      if (x.o < 0) {
        ctx.globalAlpha = 0;
        x.o = 0.1;
      } else {
        ctx.globalAlpha = x.o;
      }
      ctx.fillStyle = x.c;
      ctx.beginPath();
      ctx.arc(x.x, x.y, x.r, 0, 2 * Math.PI);
      x.x += x.xv;
      x.y += x.yv;
      if (x.xv != 0) {
        x.xv -= (x.xv / Math.abs(x.xv)) * 0.001;
      }
      if (x.y > window.innerHeight - x.r) {
        x.y = window.innerHeight - x.r;
        x.yv *= -0.7;
        if (x.xv != 0) {
          x.xv -= (x.xv / Math.abs(x.xv)) * 0.1;
        }
        if (x.xv < 0.000001) {
          x.xv = 0;
          if (x.yv < 0.000001) {
            if (window.innerHeight - x.y < x.r + 10) {
              x.l = true;
            }
          }
        }
      } else {
        x.yv += 0.1;
      }
      if (x.x < 0 || x.x > window.innerWidth) {
        x.xv *= -0.8;
      }
      ctx.fill();
    });
    pieces = pieces.filter(function (x) {
      return x.o > 0;
    });
  }
  tick = setInterval(introTick, 10);
})();

//Home screen buttons
instructions.onclick = function () {
  currentInstruction++;
  instructionImage.src = instructionUrls[currentInstruction % instructionUrls.length];
}

joinGame.style.opacity = ".5";
joinGame.style.cursor = "not-allowed";
gameCodeInput.oninput = () => {
  if (gameCodeInput.value != "") {
    //User has inputted a code!
    joinGame.style.opacity = "1";
    joinGame.style.cursor = "pointer";
    joinGame.setAttribute("disabled", false);
  } else {
    joinGame.style.opacity = ".5";
    joinGame.style.cursor = "not-allowed";
    joinGame.setAttribute("disabled", true);
  }
}

let IS_HOST = false;
const USER_ID = Math.random().toString(36).substring(2, 15);
let USER_ROOM = "";

hostGame.onclick = async () => {
  IS_HOST = true;
  let code = Math.random().toString(36).substring(2, 7);
  let game = await fetch("/hostGame",
    {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify({
        userId: USER_ID,
        gameCode: code
      })
    });
  USER_ROOM = code;
  roomCode.innerText = USER_ROOM;
  beginPlay();
  prompt("Your game code is: ", code);
}



joinGame.onclick = async () => {
  let game = await fetch("/joinGame",
    {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify({
        userId: USER_ID,
        gameCode: gameCodeInput.value
      })
    });
  game = await game.text();
  if (game != "good") {
    alert("Invalid game code!");
    return;
  }
  USER_ROOM = gameCodeInput.value;
  roomCode.innerText = USER_ROOM;

  //Hosts always play first
  setWaiting(true);

  beginPlay();

  sendServer({ "move": "opponentJoin" })
}


let interactedSinceSwitch = false;

//Join server events
var es = new EventSource('/stream');

es.onmessage = function (event) {
  let data = JSON.parse(event.data);
  //SendServer
  if (data.gameCode == USER_ROOM && data.userId != USER_ID) {
    if (data.move == "opponentJoin") {
      setWaiting(false);
    } else if (data.move == "shield") {
      //Place shield
      placedShield = true;
      clickSound.play();
      gameTable[data.column][data.row] = {
        c: data.column,
        r: data.row,
        t: "#90a959",
        w: true,
      };
      drawBoard();
    } else if (data.move == "chip") {
      //Place chip
      checked = false;
      locked = false;
      moved = true;
      clickSound.play();
      gameTable[data.column][0] = {
        c: data.column,
        r: 0,
        t: colors[currentColor % colors.length],
      };
      drawBoard();
      console.log("other dude placed a chip")
      if (placedShield) {
        console.log("and he placed a shield before");
        console.log(moved, locked)
        done();
        setWaiting(false);
        interactedSinceSwitch = false;

      }
    } else if (data.move == "rotate") {
      rotateBoard(data.direction, true);

      done();
      setWaiting(false);
      interactedSinceSwitch = false;

    } else if (data.move == "done") {
      console.log(data);
      console.log('recieved done!');

      interactedSinceSwitch = false;

      done();
      setWaiting(false);
    } else if (data.move == "mouseMove") {
      placeIndicatorAtColumn(data.column);
    } else if (data.move == "updateWord") {
      wordDisplay.innerText = data.word;
    }
  }
};

function sendServer(data) {
  //Send request to server
  fetch("/updateData", {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: "POST",
    body: JSON.stringify({
      gameCode: USER_ROOM,
      userId: USER_ID,
      ...data
    })
  })
}

function beginPlay() {
  if (introCont.style.display != "none") {
    buttonSound.play();
    clearInterval(tick);
    introCont.style.display = "none";
    gameCont.style.display = "block";
  }
};


//Is the user waiting for a turn by the other player?
let WAITING_FOR_MOVE;
function setWaiting(value) {
  WAITING_FOR_MOVE = value;
  if (WAITING_FOR_MOVE) {
    waitingMessage.innerText = "Waiting...";
    waitingMessage.style.display = "flex";
  } else {
    waitingMessage.innerText = "Your turn!";
    setTimeout(() => {
      waitingMessage.style.display = "none";
    }, 1500);
  }
}


if (true) {
  //Rows and Columns of board
  var boardColumns = 5;
  var boardRows = 7;
  var winLength = 3;

  //Visual padding
  var circleRad = 20;
  var circlePad = 5;
  var startPad = 15;


  var gameTable = [];
  var dropIndicator = document.getElementById("dropIndicator");

  for (var i = 0; i < boardColumns; i++) {
    gameTable.push(Array.apply(null, Array(boardRows)));
  }

  //Configure canvas size;
  var gameCanvas = document.getElementById("gameCanvas");
  var canvasWidth;
  gameCanvas.width = canvasWidth;
  gameCanvas.height =
    circleRad * 2 * boardRows + circleRad + (boardRows + 1) * circlePad;

  setShield();
  function setRotateSymbols() {
    rotateLeft.style.left = `${window.innerWidth / 2 -
      (circleRad * 2 * boardColumns +
        circleRad +
        (boardColumns + 1) * circlePad) /
      2 -
      startPad - 50
      }px`;
    rotateLeft.style.top = `${window.innerHeight / 2 -
      (circleRad * 2 * boardRows + circleRad + (boardRows + 1) * circlePad) /
      2 -
      40
      }px`;
    rotateRight.style.left = `${window.innerWidth / 2 +
      (circleRad * 2 * boardColumns +
        circleRad +
        (boardColumns + 1) * circlePad) /
      2 -
      startPad + 50
      }px`;
    rotateRight.style.top = `${window.innerHeight / 2 -
      (circleRad * 2 * boardRows + circleRad + (boardRows + 1) * circlePad) /
      2 -
      40
      }px`;
    setShield();
    updateSize();
    drawBoard();
  }
  window.onresize = function () {
    updateSize();
    setRotateSymbols();
    updateWordCircles();
    setTimeout(function () {
      setRotateSymbols();
    }, 250);
  };

  var boardBackground = "#9797f7";
  gameCanvas.style.background = boardBackground;
  var ctx = gameCanvas.getContext("2d");
  ctx.fillStyle = "white";
  ctx.lineWidth = 0;
  ctx.strokeStyle = boardBackground;
  //Draw board
  shieldButton.style.width = `${circleRad * 2}px`;
  shieldButton.style.height = `${circleRad * 2}px`;
  dropIndicator.style.width = `${circleRad * 2}px`;
  dropIndicator.style.height = `${circleRad * 2}px`;
  // shieldDisplay.style.width = `${circleRad * 2}px`;
  // shieldDisplay.style.height = `${circleRad * 2}px`;

  function drawBoard() {
    canvasWidth =
      circleRad * 2 * boardColumns +
      (boardColumns - 1) * circlePad +
      startPad * 2;
    dropIndicator.style.width = `${circleRad * 2}px`;
    dropIndicator.style.height = `${circleRad * 2}px`;
    // shieldDisplay.style.width = `${circleRad * 2}px`;
    // shieldDisplay.style.height = `${circleRad * 2}px`;
    gameCanvas.width = canvasWidth;
    gameCanvas.height =
      circleRad * 2 * boardRows + circleRad + (boardRows + 1) * circlePad;
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    var drawX = startPad;
    var drawY =
      (gameCanvas.height -
        (circleRad * 2 * boardRows + (boardRows - 1) * circlePad)) /
      2;
    for (rowCount = 0; rowCount < boardRows; rowCount++) {
      for (columnCount = 0; columnCount < boardColumns; columnCount++) {
        if (gameTable[columnCount][rowCount]) {
          ctx.fillStyle = gameTable[columnCount][rowCount].t;
          ctx.lineWidth = 0;
          ctx.strokeStyle = boardBackground;
        } else {
          ctx.fillStyle = "white";
          ctx.lineWidth = 0;
          ctx.strokeStyle = boardBackground;
        }
        ctx.beginPath();
        ctx.arc(
          drawX + circleRad,
          drawY + circleRad,
          circleRad,
          0,
          2 * Math.PI
        );
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(
          drawX + circleRad,
          drawY + circleRad,
          circleRad,
          0,
          2 * Math.PI
        );
        ctx.fill();
        drawX += circleRad * 2 + circlePad;
      }
      drawY += circleRad * 2 + circlePad;
      drawX = startPad;
    }
  }
  drawBoard();


  var selectedColumn = 0;
  var currentColor = 0;
  var colors = [redColor, yellowColor];
  var mouseMoveEvent;
  document.onmousemove = function (e) {
    if (WAITING_FOR_MOVE) return;
    if (
      e.clientX - (window.innerWidth / 2 - gameCanvas.width / 2 + startPad) >
      0 &&
      (Math.round(
        (e.clientX -
          circleRad -
          (window.innerWidth / 2 - gameCanvas.width / 2 + startPad)) /
        (circleRad * 2 + circlePad)
      ) *
        (circleRad * 2 + circlePad)) /
      (circleRad * 2 + circlePad) < boardColumns
    ) {
      selectedColumn =
        (Math.round(
          (e.clientX -
            circleRad -
            (window.innerWidth / 2 - gameCanvas.width / 2 + startPad)) /
          (circleRad * 2 + circlePad)
        ) *
          (circleRad * 2 + circlePad)) /
        (circleRad * 2 + circlePad);


      if (shieldMode) {
        if (Math.round(
          (mouseMoveEvent.clientY -
            circleRad -
            (window.innerHeight / 2 - gameCanvas.height / 2 + startPad)) /
          (circleRad * 2 + circlePad)
        ) > boardRows - 1 || selectedColumn > boardColumns || Math.round(
          (mouseMoveEvent.clientY -
            circleRad -
            (window.innerHeight / 2 - gameCanvas.height / 2 + startPad)) /
          (circleRad * 2 + circlePad)
        ) < 0) {
          mouseMoveEvent = e;

          return;
        }
        shieldDisplay.style.top = `${gameCanvas.getBoundingClientRect().top + 2 +
          startPad +
          ((Math.round(
            (mouseMoveEvent.clientY -
              circleRad -
              (window.innerHeight / 2 - gameCanvas.height / 2 + startPad)) /
            (circleRad * 2 + circlePad)
          ) *
            (circleRad * 2 + circlePad)) /
            (circleRad * 2 + circlePad)) * (circleRad * 2 + circlePad)
          + circleRad}px`;
        let newX = `${gameCanvas.getBoundingClientRect().left + 2 +
          startPad +
          selectedColumn * (circleRad * 2 + circlePad)
          + circleRad}px`;

        shieldDisplay.style.left = newX;
      } else {
        let newX = `${gameCanvas.getBoundingClientRect().left +
          startPad +
          (selectedColumn * (circleRad * 2 + circlePad))
          }px`
        sendServer({ move: "mouseMove", column: selectedColumn });
        dropIndicator.style.left = newX;
      }
      mouseMoveEvent = e;
    }
  };
  gameCanvas.onclick = function () {

    //Is the user waiting for a move from other player?
    if (WAITING_FOR_MOVE) return

    if (shieldMode) {

      let column = (Math.round(
        (mouseMoveEvent.clientX -
          circleRad -
          (window.innerWidth / 2 - gameCanvas.width / 2 + startPad)) /
        (circleRad * 2 + circlePad)
      ) *
        (circleRad * 2 + circlePad)) /
        (circleRad * 2 + circlePad);

      let row = (Math.round(
        (mouseMoveEvent.clientY -
          circleRad -
          (window.innerHeight / 2 - gameCanvas.height / 2 + startPad)) /
        (circleRad * 2 + circlePad)
      ) *
        (circleRad * 2 + circlePad)) /
        (circleRad * 2 + circlePad)

      //Space may be already occupied!
      if (gameTable[column][row] != undefined) { return }


      shieldDisplay.style.display = "none";
      placedShield = true;
      clickSound.play();
      shieldButton.style.opacity = ".3";


      gameTable[column][row] = {
        c: column,
        r: row,
        t: "#90a959",
        w: true,
      };

      interactedSinceSwitch = true;

      shieldMode = false;
      shieldButton.style.boxShadow = "unset";
      drawBoard();

      sendServer({ move: "shield", column: column, row: row });
    } else {
      if (!moved && !locked) {
        if (gameTable[selectedColumn][0]) { return }
        locked = true;
        moved = true;
        checked = false;
        clickSound.play();
        doneMove.style.opacity = "1";
        shieldButton.style.opacity = ".3";
        shieldButton.style.cursor = "not-allowed";
        rotateLeft.style.opacity = "1";
        rotateRight.style.opacity = "1";
        rotateLeft.style.cursor = "pointer";
        rotateRight.style.cursor = "pointer";

        gameTable[selectedColumn][0] = {
          c: selectedColumn,
          r: 0,
          t: colors[currentColor % colors.length],
        };

        interactedSinceSwitch = true;

        drawBoard();

        sendServer({ move: "chip", column: selectedColumn });
        // if (placedShield) {
        //   setTimeout(function () {
        //     locked = false;
        //     doneMove.click();
        //   }, 500);
        // }
      }
    }
  };
  rotateLeft.onclick = function () {
    sendServer({ move: "rotate", direction: -1 });
    rotateBoard(-1);
  };
  rotateRight.onclick = function () {
    sendServer({ move: "rotate", direction: 1 });
    rotateBoard(1);
  };
  function rotateBoard(dir, force) {
    turnSound.play();
    if (!force && (rotateRight.style.opacity != "1" || rotateLeft.style.opacity != "1")) {
      return null;
    }


    if (dir == -1) {
      gameCanvas.style.transform = "translate(-50%,-50%) rotate(-90deg)";
    } else {
      gameCanvas.style.transform = "translate(-50%,-50%) rotate(90deg)";
    }
    // setTimeout(function () {
    // }, 300);
    var old = boardColumns;
    boardColumns = boardRows;
    boardRows = old;

    dropIndicator.style.left = `50%`;
    setShield();

    setTimeout(function () {
      var newarr = [];
      if (dir == -1) {
        for (var x = 0; x < gameTable[0].length; x++) {
          newarr[x] = [];
          for (var y = gameTable.length - 1; y >= 0; y--) {
            newarr[x].push(gameTable[y][x]);
          }
        }
      } else {
        gameTable[0].forEach(function () {
          newarr.push(new Array(gameTable.length));
        });
        newarr = newarr
          .map(function (x, i) {
            return gameTable.map(function (l) {
              return l[i];
            });
          })
          .reverse();
      }
      gameTable = newarr;
      setRotateSymbols();
      gameCanvas.width = canvasWidth;
      gameCanvas.height =
        circleRad * 2 * boardRows + circleRad + (boardRows + 1) * circlePad;

      drawBoard();
      gameCanvas.style.transition = "unset";
      gameCanvas.style.transform = "translate(-50%,-50%)";

      setTimeout(function () {
        rotated = true;
        checked = false;
        locked = true;
        setRotateSymbols();
        gameCanvas.style.transition = "transform .2s";
        // setTimeout(function () {
        //   doneMove.click();
        // }, 500);
        updateSize();
      }, 50);
    }, 200);
  }
  //Apply gravity to pieces
  var foundFall = false;
  function fallDown() {
    foundFall = false;
    gameTable = gameTable.map(function (l) {
      var temp = l.reverse();
      temp.forEach(function (x, i) {
        if (
          temp[i - 1] == undefined &&
          temp[i] != undefined &&
          i != 0 &&
          l[i].w != true
        ) {
          foundFall = true;
          temp[i - 1] = temp[i];
          temp[i] = undefined;
        } else {
        }
      });
      return temp.reverse();
    });
    if (foundFall) {
      console.log("FALL FOUND");
      drawBoard();
    } else {
      if (!checked) {
        if (moved || rotated) {
          console.log("checking");
          checkWin(gameTable);
          checked = true;
          if (rotated || placedShield) {
            console.log(WAITING_FOR_MOVE, interactedSinceSwitch)
            if (!WAITING_FOR_MOVE && interactedSinceSwitch) {
              console.log("EVERYTHNIG IS DONE FALLILNG, IMA DO IT")
              done();
              setWaiting(true);
            }
          }

          rotated = false;

        }
      }
    }
  }
  setInterval(fallDown, 50);
  var checked = false;
  var shieldMode = false;
  var moved = false;
  var placedShield = false;
  var rotated = false;
  shieldButton.style.opacity = "1";
  shieldButton.onclick = function () {
    if (shieldButton.style.opacity != "1") {
      return null;
    }
    shieldMode = shieldMode ? false : true;
    shieldDisplay.style.display = shieldMode ? "block" : "none";
    if (shieldMode) {
      shieldButton.style.boxShadow = "black 0px 0px 0px 3px";
    } else {
      shieldButton.style.boxShadow = "unset";
    }
  };
  doneMove.onclick = (e) => { done(true) };
  function done(send) {
    console.log("CLICKED");
    if (!WAITING_FOR_MOVE) {
      if (send) {
        sendServer({ move: "done" });
        setWaiting(true);
      }
    }

    if (moved && !locked) {

      setTimeout(function () {
        updateWord();
      }, 100)
      doneMove.style.opacity = ".5";
      moved = false;
      checked = false;
      locked = false;
      placedShield = false;
      doneMove.style.boxShadow = "rgb(6 6 6) 0px 0px 24px 10px";
      setTimeout(function () {
        doneMove.style.boxShadow = "rgb(6 6 6 / 0%) 0px 0px 4px 30px";
        setTimeout(function () {
          doneMove.style.boxShadow = "unset";
        }, 200);
      }, 100);
      rotateLeft.style.opacity = ".3";
      rotateRight.style.opacity = ".3";
      shieldButton.style.opacity = "1";
      shieldButton.style.cursor = "pointer";
      rotateLeft.style.cursor = "not-allowed";
      rotateRight.style.cursor = "not-allowed";
      currentColor++;
      console.log("next color")
      dropIndicator.style.background = colors[currentColor % colors.length];

      updateWordCircles();
    }
  };
  function updateSize() {
    if (boardColumns > boardRows) {
      if (gameCanvas.getBoundingClientRect().width < window.innerWidth / 3) {
        while (
          window.innerWidth / 3 >
          circleRad * 2 * boardColumns +
          circleRad +
          (boardColumns + 1) * circlePad
        ) {
          if (circleRad < 25) {
            circleRad++;
          } else {
            break;
          }
        }
      } else {
        while (
          circleRad * 2 * boardColumns +
          circleRad +
          (boardColumns + 1) * circlePad >
          window.innerWidth / 3
        ) {
          circleRad--;
        }
      }
    } else {
      if (gameCanvas.getBoundingClientRect().height < window.innerHeight / 2) {
        while (
          window.innerHeight / 2 >
          circleRad * 2 * boardRows + circleRad + (boardRows + 1) * circlePad
        ) {
          circleRad++;
        }
      } else {
        while (
          circleRad * 2 * boardRows + circleRad + (boardRows + 1) * circlePad >
          window.innerHeight / 2
        ) {
          circleRad--;
        }
      }

    }
  }
  drawBoard();
  setShield();
  updateSize();
  setRotateSymbols();
}
function collapseArray(a) {
  return a.filter(function (x) { return !x }).concat(a.filter(function (x) {
    return x
  }))
}
updateSize();

var locked = false;

function checkWin(board) {
  var redWon = false;
  var yellowWon = false;
  var win = true;
  var rcheckedSpots = [];
  var ycheckedSpots = [];
  board.forEach(function (column, ci) {
    //Loop through each column
    column.forEach(function (hole, hi) {
      //Up and down check
      if (!redWon) {
        win = true;
        rcheckedSpots = [];
        for (var i = 0; i < winLength; i++) {
          try {
            rcheckedSpots.push([ci, hi - i]);
            if (!column[hi - i] || column[hi - i].t != redColor) {
              win = false;
            }
          } catch { }
        }
        if (win) {
          console.log("red");
          redWon = true;
          return;
        }
      }
      // Left and right check
      if (!redWon) {
        win = true;
        rcheckedSpots = [];
        for (var i = 0; i < winLength; i++) {
          try {
            rcheckedSpots.push([ci + i, hi]);
            if (
              !board[ci + i] ||
              !board[ci + i][hi] ||
              board[ci + i][hi].t != redColor
            ) {
              win = false;
            }
          } catch { }
        }
        if (win) {
          redWon = true;
          console.log("red");
          return;
        }
      }
      if (!redWon) {
        // Left to right, down to up diagonal
        rcheckedSpots = [];
        win = true;
        for (var i = 0; i < winLength; i++) {
          try {
            rcheckedSpots.push([ci + i, hi - i]);
            if (!board[ci + i][hi - i] || board[ci + i][hi - i].t != redColor) {
              win = false;
            }
          } catch {
            win = false;
          }
        }
        if (win) {
          console.log("red");
          redWon = true;
          return;
        }
      }
      if (!redWon) {
        // Left to right, up to down diagonal
        rcheckedSpots = [];
        win = true;
        for (var i = 0; i < winLength; i++) {
          try {
            rcheckedSpots.push([ci + i, hi + i]);
            if (!board[ci + i][hi + i] || board[ci + i][hi + i].t != redColor) {
              win = false;
            }
          } catch {
            win = false;
          }
        }
        if (win) {
          console.log("red");
          redWon = true;
          return;
        }
      }
      //YELLOW CHECK
      if (!yellowWon) {
        var win = true;
        ycheckedSpots = [];
        for (var i = 0; i < winLength; i++) {
          try {
            ycheckedSpots.push([ci, hi - i]);
            if (!column[hi - i] || column[hi - i].t != yellowColor) {
              win = false;
            }
          } catch { }
        }
        if (win) {
          console.log("yellow");
          yellowWon = true;
          return;
        }
      }
      if (!yellowWon) {
        // Left and right check
        ycheckedSpots = [];
        win = true;
        for (var i = 0; i < winLength; i++) {
          try {
            ycheckedSpots.push([ci + i, hi]);
            if (
              !board[ci + i] ||
              !board[ci + i][hi] ||
              board[ci + i][hi].t != yellowColor
            ) {
              win = false;
            }
          } catch { }
        }
        if (win) {
          console.log("yellow");
          yellowWon = true;
          return;
        }
      }
      if (!yellowWon) {
        // Left to right, down to up diagonal
        win = true;
        ycheckedSpots = [];
        for (var i = 0; i < winLength; i++) {
          try {
            ycheckedSpots.push([ci + i, hi - i]);
            if (
              !board[ci + i][hi - i] ||
              board[ci + i][hi - i].t != yellowColor
            ) {
              win = false;
            }
          } catch {
            win = false;
          }
        }
        if (win) {
          console.log("yellow");
          yellowWon = true;
          return;
        }
      }
      if (!yellowWon) {
        // Left to right, up to down diagonal
        win = true;
        ycheckedSpots = [];
        for (var i = 0; i < winLength; i++) {
          try {
            ycheckedSpots.push([ci + i, hi + i]);
            if (
              !board[ci + i][hi + i] ||
              board[ci + i][hi + i].t != yellowColor
            ) {
              win = false;
            }
          } catch {
            win = false;
          }
        }
        if (win) {
          console.log("yellow");
          yellowWon = true;
          return;
        }
      }
    });
  });
  locked = false;

  if (redWon && yellowWon) {
    tieScreen();
  } else if (redWon) {
    won("r", rcheckedSpots);
  } else if (yellowWon) {
    won("y", ycheckedSpots);
  }
  var tie = true;
  board.forEach(function (x) {
    if (x.indexOf(undefined) != -1) {
      tie = false;
    }
  });
  if (tie) {
    tieScreen();
  }
}
var flashDelay = 150;
var prevFlash;
function flashColor(spots, color) {
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      spots.forEach(function (x) {
        gameTable[x[0]][x[1]].t = "white";
      });
      drawBoard();
      if (!prevFlash) {
        prevFlash = gameCanvas.toDataURL();
      }
      setTimeout(function () {
        spots.forEach(function (x) {
          gameTable[x[0]][x[1]].t = color == "r" ? redColor : yellowColor;
        });
        drawBoard();
        resolve("");
      }, flashDelay);
    }, flashDelay);
  });
}
var winAudio = new Audio("https://raw.githubusercontent.com/Beasleydog/seekingorder/main/win.mp3");
async function gameOver(color) {
  setTimeout(function () {
    winAudio.play();
  }, 6500);
  pieces = [];
  introBack.style.opacity = ".15";
  confirmedColor = (color == "r" ? redColor : yellowColor);
  winScreen.style.display = "block";
  showWinner.style.color = (color == "r" ? redColor : yellowColor);
  showWinner.innerText = (color == "r" ? "Red Wins" : "Yellow Wins");
  scoreRecap.innerHTML = "<div style='color:" + redColor + ";display:inline-block;'>" + redScore + " </div> " + "<div style='color:#6494aa;display:inline-block;'> to </div>" + " <div style='color:" + yellowColor + ";display:inline-block;'>" + yellowScore + "</div>";
  scoreRecap.style.color = (color == "r" ? redColor : yellowColor);
  showWinner.style.top = gameTitle.getBoundingClientRect().height + "px";
  scoreRecap.style.top = gameTitle.getBoundingClientRect().height + showWinner.getBoundingClientRect().height + "px";
  winScreen.appendChild(introBack);
  tick = setInterval(introTick, 10);
  games.forEach(function (x) {
    var img = new Image();
    img.src = x[0];
    img.draggable = false;
    img.style.border = `${x[1] == "r" ? redColor : x[1] == "y" ? yellowColor : "#c4c4c7"} solid 5px`;
    img.classList.add("gameImages");
    gamesRecap.appendChild(img);
  })
  gameCanvas.style.display = "none";
  celebratory.style.top = gameTitle.getBoundingClientRect().top + gameTitle.getBoundingClientRect().height - 15 + "px";
  celebratory.style.left = gameTitle.getBoundingClientRect().left + gameTitle.getBoundingClientRect().width - 15 + "px";
  celebratory.innerText = celebrationTexts[Math.round(celebrationTexts.length * Math.random())]

}
var celebrationTexts = ["Great Work!", "Great Job!", "Epic!", "Awesome!", "Amazing!"];
// var gameRecapScroll = [false, 0];
// gamesRecap.onmousedown = function (e) {
//   gameRecapScroll[0] = true;
//   gameRecapScroll[1] = Number(e.clientX - gamesRecap.style.left.slice(0, -2));
// }
// document.onmouseup = function (e) {
//   gameRecapScroll[0] = false;
// }
// var lastX = 0;
// var currentDirection;
// // gamesRecap.onmousemove = function (e) {
// //   // console.log(e.clientX > lastX);
// //   console.log(e.clientX, lastX)
// //   if (e.clientX < lastX) {
// //     if ((gamesRecap.getBoundingClientRect().width - window.innerWidth) * -1 > gamesRecap.getBoundingClientRect().left) {
// //       gamesRecap.getBoundingClientRect().left = `${(gamesRecap.getBoundingClientRect().width - window.innerWidth) * -1}px`;
// //       if ((lastX - e.clientX) / Math.abs((lastX - e.clientX)) != currentDirection) {
// //         lastX = e.clientX;
// //         currentDirection = (lastX - e.clientX) / Math.abs((lastX - e.clientX));
// //       }
// //       return
// //     }
// //   }
// //   if ((lastX - e.clientX) / Math.abs((lastX - e.clientX)) != currentDirection) {
// //     lastX = e.clientX;
// //     currentDirection = (lastX - e.clientX) / Math.abs((lastX - e.clientX));
// //   }

// //   if (gameRecapScroll[0]) {
// //     gamesRecap.style.left = `${e.clientX - gameRecapScroll[1]}px`;
// //   }
// // }
async function won(color, spots) {
  fireworkCanvas.style.display = "block";
  plusPoints.innerHTML = (color == "r" ? "<div style='color:" + redColor + ";display:inline-block;'>Red</div> Won" : "<div style='color:" + yellowColor + ";display:inline-block;'>Yellow</div> Won") + "<br>+" + winLength + " points";
  if (color == "r") {
    redScore += winLength;
    redScoreText.innerText = redScore;
    yellowStreakLost++;
    redStreakLost = 0;
  } else {
    yellowScore += winLength;
    yellowScoreText.innerText = yellowScore;
    redStreakLost++;
    yellowStreakLost = 0;
  }

  if (winLength == 5) {
    nextUp.innerText = "Next up: " + "3" + " In A Row";
  } else {
    nextUp.innerText = "Next up: " + (winLength + 1) + " In A Row";
  }

  //Flash winning connection
  locked = true;
  for (var i = 0; i < 5; i++) {
    await flashColor(spots, color);
  }
  moved = false;

  //Handle lives
  if (redStreakLost == 2) {
    redLives--;
    if (redLives == 0) {
      setTimeout(function () {
        gameOver('y');
        redLivesText.innerText = "💔💔"
      }, 500);
    } else {
      redLives = 1;
      redLivesText.innerText = "❤️💔";
      redStreakLost = 0;

    }
  }
  if (yellowStreakLost == 2) {
    yellowLives--;
    if (yellowLives == 0) {
      setTimeout(function () {
        gameOver('r');
        yellowLivesText.innerText = "💔💔"
      }, 500);
    } else {
      yellowLives = 1;
      yellowLivesText.innerText = "❤️💔";
      yellowStreakLost = 0;

    }
  }
  // setTimeout(function () {
  wipe(color);
  setTimeout(function () {


    if (redScore >= 20) {
      //red won
      gameOver("r");
    } else if (yellowScore >= 20) {
      //yellow won
      gameOver("y");
    }
    if (winLength == 5) {
      winLength = 3;
      gameTable = [];
      boardColumns -= 2;
      boardRows -= 2;
    } else {
      winLength++;
      gameTable = [];
      boardColumns++;
      boardRows++;
    }
    rowShow.innerText = "";
    for (var i = 0; i < winLength; i++) {
      rowShow.innerText = rowShow.innerText + "⚪";
    }
    for (var i = 0; i < boardColumns; i++) {
      gameTable.push(Array.apply(null, Array(boardRows)));
    }
    locked = false;
    drawBoard();
    updateSize();
    setRotateSymbols();
  }, 500);
  // }, 200);
}
function tieScreen() {
  plusPoints.innerHTML = "Tie<br>No points given";
  if (winLength == 5) {
    nextUp.innerText = "Next up: " + "3" + " in a row";
  } else {
    nextUp.innerText = "Next up: " + (winLength + 1) + " in a row";
  }
  moved = false;
  wipe("t");
  setTimeout(function () {
    if (winLength == 5) {
      winLength = 3;
      gameTable = [];
      boardColumns -= 2;
      boardRows -= 2;
    } else {
      winLength++;
      gameTable = [];
      boardColumns++;
      boardRows++;
    }
    rowShow.innerText = "";
    for (var i = 0; i < winLength; i++) {
      rowShow.innerText = rowShow.innerText + "⚪";
    }
    for (var i = 0; i < boardColumns; i++) {
      gameTable.push(Array.apply(null, Array(boardRows)));
    }
    drawBoard();
    updateSize();
    setRotateSymbols();
  }, 500);
}
var wipeShowTime = 6000;
var roundOverSound = new Audio("https://raw.githubusercontent.com/Beasleydog/seekingorder/main/roundOver.mp3");
function flashPrev(prev, current) {
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      prevBoard.src = prev;
      setTimeout(function () {
        prevBoard.src = current;
        resolve("");
      }, flashDelay);
    }, flashDelay);
  });
}
async function wipe(color) {

  prevBoard.style.top = `${winTitle.getBoundingClientRect().height + 50}px`;
  wipeInfo.style.top = `${winTitle.getBoundingClientRect().height + 50}px`;
  // nextUp.style.left = `${Math.round(plusPoints.getBoundingClientRect().left)}px`;
  if (color == "t") {
    screenWipe.style.background = "#c4c4c7";
  } else {
    if (color == "r") {
      fireworkBackColor = redColor;
      screenWipe.style.background = redColor;
    } else {
      fireworkBackColor = yellowColor;
      screenWipe.style.background = yellowColor;
    }
    // spawnFireworks(20);
  }
  screenWipe.style.left = "0%";
  setTimeout(function () {
    if (color != "t") {
      spawnFireworks(10);
    }
    roundOverSound.play();
  }, 500);
  setTimeout(function () {
    screenWipe.style.left = "100%";
    setTimeout(function () {
      screenWipe.style.transition = "left 0s";
      screenWipe.style.left = "-100%";
      setTimeout(function () {
        fireworkCanvas.style.display = "none";
        clearFctx();
        screenWipe.style.transition = "left .5s";
        rotated = false;
        checked = false;
        locked = false;
        prevFlash = undefined;
        shieldButton.style.opacity = "1";
        shieldButton.style.cursor = "pointer";
        setRotateSymbols();
      }, 50);
    }, 500);
  }, wipeShowTime);

  var oldRad = circleRad;
  circleRad = 5;
  drawBoard();
  games.push([gameCanvas.toDataURL(), color]);
  circleRad = oldRad;
  drawBoard();
  var currentBoard = gameCanvas.toDataURL();
  if (color != "t") {
    for (var i = 0; i < 10; i++) {
      await flashPrev(prevFlash, currentBoard);
    }
  } else {
    prevBoard.src = currentBoard;
  }

}
setTimeout(flash, 10000);
function flash() {
  gameBack.style.filter = "brightness(2)";
  setTimeout(function () {
    gameBack.style.filter = "none";
  }, 500);
}
(function gameBackDraw() {
  gameBack.width = window.innerWidth;
  gameBack.height = window.innerHeight;
  var currentColor = redColor;
  var ctx = gameBack.getContext("2d");
  ctx.shadowBlur = "10";
  ctx.shadowColor = "#1F1F1F";
  var pieces = [];
  function gameBackPiece() {
    this.r = Math.random() * 100 + 15;
    this.rv = Math.random() * 0.1 - 0.05;
    this.a = Math.random() * 360;
    this.av = Math.random() * 0.01 - 0.005;
    this.xv = Math.random() * 1;
    this.yv = Math.random() * 1;
    this.xvv = Math.random() * 0.01 - 0.005;
    this.yvv = Math.random() * 0.01 - 0.005;
    if (Math.round(Math.random()) == 1) {
      if (Math.round(Math.random()) == 1) {
        //top
        this.x = Math.random() * window.innerWidth;
        this.y = -this.r;
      } else {
        //bottom
        this.x = Math.random() * window.innerWidth;
        this.y = window.innerHeight + this.r;
        this.yv *= -1;
      }
    } else {
      if (Math.round(Math.random()) == 1) {
        this.y = Math.random() * window.innerHeight;
        this.x = -this.r;
        //left
      } else {
        //right
        this.y = Math.random() * window.innerHeight;
        this.x = window.innerWidth + this.r;
        this.yv *= -1;
      }
    }
    this.on = false;
    this.del = false;
    this.c = "#1F1F1F";
  }
  function gameBackAddPiece() {
    if (pieces.length < 20) {
      pieces.push(new gameBackPiece());
    }

    setTimeout(gameBackAddPiece, Math.random() * 1000 + 300);
  }
  gameBackAddPiece();
  function introTick() {
    ctx.clearRect(0, 0, gameBack.width, gameBack.height);
    // ctx.fillStyle = "rgba(10, 10, 10, .05)";
    // ctx.fillRect(0, 0, gameBack.width, gameBack.height);
    pieces = pieces.map(function (x) {
      ctx.fillStyle = x.c;
      ctx.beginPath();
      polygon(ctx, x.x, x.y, x.r, winLength, x.a);
      ctx.fill();
      x.r += x.rv;
      x.a += x.av;
      x.x += x.xv;
      x.y += x.yv;
      x.xv += x.xvv;
      x.yv += x.yvv;
      if (
        x.x - 3 * x.r > window.innerWidth ||
        x.x + 3 * x.r < 0 ||
        x.y - 3 * x.r > window.innerHeight ||
        x.y + 3 * x.r < 0
      ) {
        if (x.on) {
          x.on = false;
          x.del = true;
        }
      } else {
        x.on = true;
      }
      return x;
    });
    pieces = pieces.filter(function (x) {
      return !x.del;
    });
  }

  function polygon(ctx, x, y, radius, sides, startAngle) {
    if (sides < 3) return;
    var a = (Math.PI * 2) / sides;
    radius = Math.abs(radius);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(startAngle);
    ctx.moveTo(radius, 0);
    for (var i = 1; i < sides; i++) {
      ctx.lineTo(radius * Math.cos(a * i), radius * Math.sin(a * i));
    }
    ctx.closePath();
    ctx.restore();
  }
  setInterval(introTick, 10);
})();

document.onkeydown = function (e) {
  if (document.activeElement.id == "gameCodeInput") return;
  if (e.key == "h") {
    hostGame.click();
  } else if (e.key == "i") {
    instructionButton.click();
  } else if (e.key == "j") {
    joinGame.click();
  }
  else if (e.key == " ") {
    console.log("space!")
    done(true);
  }
};
updateSize();
setRotateSymbols();
function setShield() {
  setTimeout(function () {
    shieldButton.style.top = `${window.innerHeight / 2 + gameCanvas.getBoundingClientRect().height / 2 + 5
      }px`;
    dropIndicator.style.bottom =
      window.innerHeight / 2 +
      circleRad * 2 +
      gameCanvas.getBoundingClientRect().height / 2 +
      "px";
  }, 250);
}
instructionButton.onclick = function () {
  instructions.style.opacity = "1";
  instructions.style.pointerEvents = "unset";
  buttonSound.play();
}
instructionClose.onclick = function () {
  instructions.style.opacity = "0";
  instructions.style.pointerEvents = "none";
}
function updateWord() {
  let word = wordList[Math.floor(Math.random() * wordList.length)];

  if (IS_HOST) {
    sendServer({ move: "updateWord", word: word });
  }
  wordDisplay.innerText = word;
}
updateWord();
var indentAmount = 10;
function updateWordCircles() {
  var circleSize = (window.innerWidth - gameCanvas.width) / 4 - (window.innerWidth - gameCanvas.width) / 8;
  wordDisplay.style.width = circleSize + "px";
  wordDisplay.style.height = circleSize + "px";
  wordDisplay.style.lineHeight = circleSize + "px";
  wordDisplay.style.fontSize = (window.innerWidth - gameCanvas.width) / 50 + "px";
  if (colors[currentColor % colors.length] == redColor) {
    wordDisplay.style.left = window.innerWidth / 2 + gameCanvas.width / 2 - indentAmount + "px";

  } else {
    wordDisplay.style.left = window.innerWidth / 2 - circleSize - gameCanvas.width / 2 + indentAmount + "px";
  }

  setTimeout(function () {
    wordDisplay.style.background = colors[currentColor % colors.length];
  }, 100);
}
updateWordCircles();


function placeIndicatorAtColumn(column) {
  dropIndicator.style.left = `${gameCanvas.getBoundingClientRect().left + startPad + (((circleRad * 2) + circlePad) * column)}px`;
}