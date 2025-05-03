const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

let players = {};
let turn = "X";
let board = Array(9).fill(null);

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Assign player symbol (X or O)
  if (Object.keys(players).length < 2) {
    const symbol = Object.values(players).includes("X") ? "O" : "X";
    players[socket.id] = symbol;
    socket.emit("symbol", symbol);
    socket.broadcast.emit("player-joined", symbol);
  } else {
    socket.emit("room-full");
    return;
  }

  socket.on("make-move", ({ index }) => {
    if (board[index] === null && players[socket.id] === turn) {
      board[index] = turn;
      io.emit("move-made", { index, symbol: turn });

      // Check for winner or draw
      const winner = checkWinner();
      if (winner) {
        io.emit("game-over", { winner });
        board = Array(9).fill(null);
      } else if (board.every(cell => cell !== null)) {
        io.emit("game-over", { winner: "draw" });
        board = Array(9).fill(null);
      } else {
        turn = turn === "X" ? "O" : "X";
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    delete players[socket.id];
    board = Array(9).fill(null);
    turn = "X";
    io.emit("player-left");
  });
});

function checkWinner() {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (let [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return board[a];
    }
  }
  return null;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
