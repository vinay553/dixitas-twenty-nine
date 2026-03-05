const groups = [
  {
    id: "purple",
    color: "var(--purple)",
    category: "First word of names of places you've lived in",
    words: ["BLUE", "BUDGET", "RISE", "JUNCTION"],
  },
  {
    id: "yellow",
    color: "var(--yellow)",
    category: "Part of your cha& order",
    words: ["MACADAMIA", "ICED", "CARDIMUM", "MATCHA"],
  },
  {
    id: "green",
    color: "var(--green)",
    category: "Places you've bought mugs",
    words: ["LISBON", "MEXICO CITY", "MONTREAL", "WHITELAKE"],
  },
  {
    id: "indigo",
    color: "var(--indigo)",
    category: "Numbers associated with your fitness journey",
    words: ["TEN K", "1350", "THIRTY AND THIRTY", "5:00"],
  },
];

const successMessageByGroupId = {
  purple: "Ok pipes",
  yellow: "👏👏👏",
  green: "Good work bud",
  indigo: "👀 I see you",
};

const maxMistakes = 4;
let mistakes = 0;
let selectedWords = new Set();
let solvedGroupIds = new Set();
let solvedGroupOrder = [];

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const mistakeDotsEl = document.getElementById("mistake-dots");
const statusTextEl = document.getElementById("status-text");
const solvedGroupsEl = document.getElementById("solved-groups");
const headerEl = document.querySelector("header");

const clearBtn = document.getElementById("clear-btn");
const submitBtn = document.getElementById("submit-btn");

const messageEl = document.createElement("p");
messageEl.className = "msg-popover";
headerEl.appendChild(messageEl);
let messageTimerId = null;

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
  solvedGroupOrder.forEach((groupId) => {
    const group = groups.find((item) => item.id === groupId);
    if (!group) return;
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
    solvedGroupOrder.push(matched.id);
    selectedWords.clear();
    renderSolvedGroups();
    renderBoard();
    const successMessage = successMessageByGroupId[matched.id] || "Correct group.";
    if (solvedGroupIds.size === groups.length) {
      const guessesLeft = maxMistakes - mistakes;
      if (guessesLeft === 1) {
        setMessage("phew");
        endGame();
        return;
      }
      setMessage(`${successMessage} You solved all four categories.`);
      endGame();
      return;
    }
    setMessage(successMessage);
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
  groups.forEach((group) => {
    solvedGroupIds.add(group.id);
    if (!solvedGroupOrder.includes(group.id)) {
      solvedGroupOrder.push(group.id);
    }
  });
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
  if (messageTimerId) {
    clearTimeout(messageTimerId);
    messageTimerId = null;
  }

  if (!text) {
    messageEl.classList.remove("visible");
    messageEl.textContent = "";
    return;
  }

  messageEl.textContent = text;
  messageEl.classList.add("visible");
  messageTimerId = window.setTimeout(() => {
    messageEl.classList.remove("visible");
    messageTimerId = null;
  }, 2000);
}

clearBtn.addEventListener("click", clearSelection);
submitBtn.addEventListener("click", checkGuess);

updateStatus();
renderBoard();
