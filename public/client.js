const socket = io();
let symbol = "";
let myTurn = false;

const board = document.getElementById("board");
const status = document.getElementById("status");

for (let i = 0; i < 9; i++) {
  const cell = document.createElement("div");
  cell.classList.add("cell");
  cell.dataset.index = i;
  board.appendChild(cell);
}

socket.on("symbol", (playerSymbol) => {
  symbol = playerSymbol;
  myTurn = symbol === "X";
  status.textContent = `You are ${symbol}. ${myTurn ? "Your turn." : "Opponent's turn."}`;
});

socket.on("player-joined", () => {
  status.textContent = `Player joined. ${myTurn ? "Your turn." : "Opponent's turn."}`;
});

socket.on("move-made", ({ index, symbol: moveSymbol }) => {
  const cell = board.querySelector(`[data-index='${index}']`);
  if (cell && !cell.textContent) {
    cell.textContent = moveSymbol;
    myTurn = (symbol !== moveSymbol);
    status.textContent = myTurn ? "Your turn." : "Opponent's turn.";
  }
});

socket.on("game-over", ({ winner }) => {
  if (winner === "draw") {
  alert("It's a draw!");
  window.location.reload();
} else if (winner === symbol) {
  alert("You win!");
  window.location.reload();
} else {
  alert("You lose!");
  window.location.reload();
}
  board.querySelectorAll(".cell").forEach(cell => cell.textContent = "");
  myTurn = (symbol === "X"); // Reset turns
});

socket.on("player-left", () => {
  alert("Opponent left the game.");
  board.querySelectorAll(".cell").forEach(cell => cell.textContent = "");
  status.textContent = "Waiting for another player...";
});

socket.on("room-full", () => {
  alert("Room is full. Try again later.");
});

board.addEventListener("click", (e) => {
  if (!myTurn) return;
  const index = e.target.dataset.index;
  if (index && !e.target.textContent) {
    socket.emit("make-move", { index: parseInt(index) });
  }
});
