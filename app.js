const groups = [
  {
    id: "green",
    color: "var(--green)",
    category: "Programming Languages",
    words: ["RUST", "GO", "RUBY", "SWIFT"],
  },
  {
    id: "yellow",
    color: "var(--yellow)",
    category: "Planets",
    words: ["MARS", "VENUS", "EARTH", "SATURN"],
  },
  {
    id: "indigo",
    color: "var(--indigo)",
    category: "Coffee Drinks",
    words: ["LATTE", "MOCHA", "ESPRESSO", "CAPPUCCINO"],
  },
  {
    id: "purple",
    color: "var(--purple)",
    category: "Board Games",
    words: ["CHESS", "RISK", "CLUE", "MONOPOLY"],
  },
];

const maxMistakes = 4;
let mistakes = 0;
let selectedWords = new Set();
let solvedGroupIds = new Set();

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const mistakeDotsEl = document.getElementById("mistake-dots");
const statusTextEl = document.getElementById("status-text");
const solvedGroupsEl = document.getElementById("solved-groups");

const clearBtn = document.getElementById("clear-btn");
const submitBtn = document.getElementById("submit-btn");

const messageEl = document.createElement("p");
messageEl.className = "msg";
document.querySelector(".app").appendChild(messageEl);

const allWords = groups.flatMap((g) => g.words);
let shuffledWords = shuffle([...allWords]);

function shuffle(items) {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function renderBoard() {
  boardEl.innerHTML = "";
  const unsolvedWords = shuffledWords.filter((word) => !isWordSolved(word));
  unsolvedWords.forEach((word) => {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "tile";
    if (selectedWords.has(word)) tile.classList.add("selected");
    tile.textContent = word;
    tile.addEventListener("click", () => toggleSelection(word));
    boardEl.appendChild(tile);
  });
}

function renderSolvedGroups() {
  solvedGroupsEl.innerHTML = "";
  groups
    .filter((group) => solvedGroupIds.has(group.id))
    .forEach((group) => {
      const block = document.createElement("article");
      block.className = "solved-group";
      block.style.background = group.color;
      block.innerHTML = `<div>${group.category}</div><small>${group.words.join(" - ")}</small>`;
      solvedGroupsEl.appendChild(block);
    });
}

function updateStatus() {
  const remaining = maxMistakes - mistakes;
  mistakeDotsEl.innerHTML = "";
  for (let i = 0; i < remaining; i += 1) {
    const dot = document.createElement("span");
    dot.className = "mistake-dot";
    mistakeDotsEl.appendChild(dot);
  }
  statusEl.setAttribute("aria-label", `Mistakes remaining: ${remaining}`);
  statusTextEl.textContent = `Mistakes remaining: ${remaining}`;
}

function isWordSolved(word) {
  return groups.some((group) => solvedGroupIds.has(group.id) && group.words.includes(word));
}

function toggleSelection(word) {
  if (gameOver()) return;
  if (selectedWords.has(word)) {
    selectedWords.delete(word);
  } else {
    if (selectedWords.size === 4) {
      setMessage("Pick only four tiles at a time.");
      return;
    }
    selectedWords.add(word);
  }
  setMessage("");
  renderBoard();
}

function clearSelection() {
  selectedWords.clear();
  setMessage("");
  renderBoard();
}

function checkGuess() {
  if (gameOver()) return;
  if (selectedWords.size !== 4) {
    setMessage("Select exactly four tiles.");
    return;
  }

  const guess = [...selectedWords];
  const matched = groups.find((group) => {
    if (solvedGroupIds.has(group.id)) return false;
    return group.words.every((word) => guess.includes(word));
  });

  if (matched) {
    solvedGroupIds.add(matched.id);
    selectedWords.clear();
    renderSolvedGroups();
    renderBoard();
    if (solvedGroupIds.size === groups.length) {
      setMessage("You solved all four categories.");
      endGame();
      return;
    }
    setMessage("Correct group.");
    return;
  }

  mistakes += 1;
  updateStatus();
  selectedWords.clear();
  renderBoard();

  if (mistakes >= maxMistakes) {
    setMessage("No guesses left. Refresh to play again.");
    revealAllGroups();
    endGame();
    return;
  }

  setMessage("Not a valid category. Try again.");
}

function revealAllGroups() {
  groups.forEach((group) => solvedGroupIds.add(group.id));
  renderSolvedGroups();
}

function gameOver() {
  return mistakes >= maxMistakes || solvedGroupIds.size === groups.length;
}

function endGame() {
  clearBtn.disabled = true;
  submitBtn.disabled = true;
}

function setMessage(text) {
  messageEl.textContent = text;
}

clearBtn.addEventListener("click", clearSelection);
submitBtn.addEventListener("click", checkGuess);

updateStatus();
renderBoard();
