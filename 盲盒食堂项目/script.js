const defaultFoods = [
  "A2铁锅黄焖鸡",
  "沙县小吃",
  "兰州拉面",
  "炒饭",
  "麻辣烫",
  "煲仔饭",
  "肠粉",
  "猪脚饭",
  "石锅饭",
  "A2铁板牛排",
  "美味炫",
  "豆腐煲",
  "脆皮神仙鸡",
  "卤面",
  "沙茶面",
  "水饺",
  "拌面",
  "鹅腿炒粉",
  "蒙自源",
  "轻食",
  "生煎包",
  "肉夹馍",
  "炸鸡腿",
  "麦香鸡",
  "惊喜大奖出去下馆子",
  "点外卖",
  "校外夜市"
];

const foodsStorageKey = "what-to-eat-foods";
const historyStorageKey = "what-to-eat-history";
const lastPickStorageKey = "what-to-eat-last-pick";
const excludedFoodsStorageKey = "what-to-eat-excluded-foods";

const foodForm = document.getElementById("foodForm");
const foodInput = document.getElementById("foodInput");
const foodList = document.getElementById("foodList");
const menuEmpty = document.getElementById("menuEmpty");
const formMessage = document.getElementById("formMessage");

const pickButton = document.getElementById("pickButton");
const repickButton = document.getElementById("repickButton");
const result = document.getElementById("result");
const resultHint = document.getElementById("resultHint");

const historyList = document.getElementById("historyList");
const historyEmpty = document.getElementById("historyEmpty");
const clearMenuButton = document.getElementById("clearMenuButton");
const clearHistoryButton = document.getElementById("clearHistoryButton");
const clearExcludedButton = document.getElementById("clearExcludedButton");
const excludedHint = document.getElementById("excludedHint");

let foods = loadFoods();
let history = loadHistory();
let lastPickedFood = loadLastPickedFood();
let excludedFoods = loadExcludedFoods();

renderFoods();
renderHistory();

foodForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const inputValue = foodInput.value.trim();
  const normalizedInputValue = normalizeFoodName(inputValue);

  if (!normalizedInputValue) {
    showFormMessage("请输入食物名称后再添加。", "error");
    return;
  }

  const hasDuplicateFood = foods.some(function (foodName) {
    return normalizeFoodName(foodName) === normalizedInputValue;
  });

  if (hasDuplicateFood) {
    showFormMessage("这个食物已经在菜单里了。", "error");
    return;
  }

  foods.unshift(normalizedInputValue);
  saveFoods();
  renderFoods();

  foodInput.value = "";
  showFormMessage("添加成功，已经放进你的菜单。", "success");
});

pickButton.addEventListener("click", pickFood);
repickButton.addEventListener("click", pickFood);

clearMenuButton.addEventListener("click", function () {
  if (foods.length === 0) {
    setResultState("菜单已经是空的啦", "先添加一些食物，再来抽取。");
    return;
  }

  const confirmed = window.confirm("确定要清空全部菜单吗？这个操作会删除当前所有食物。");

  if (!confirmed) {
    return;
  }

  foods = [];
  excludedFoods = [];
  saveFoods();
  saveExcludedFoods();
  renderFoods();
  setResultState("菜单已清空", "你可以重新添加一些想吃的食物。");
  showFormMessage("已清空全部菜单。", "success");
});

clearHistoryButton.addEventListener("click", function () {
  if (history.length === 0) {
    showFormMessage("历史记录已经是空的。", "error");
    return;
  }

  const confirmed = window.confirm("确定要清空历史记录吗？");

  if (!confirmed) {
    return;
  }

  history = [];
  saveHistory();
  renderHistory();
  showFormMessage("已清空历史记录。", "success");
});

clearExcludedButton.addEventListener("click", function () {
  if (excludedFoods.length === 0) {
    showFormMessage("当前没有跳过的食物。", "error");
    return;
  }

  excludedFoods = [];
  saveExcludedFoods();
  renderFoods();
  showFormMessage("已恢复全部跳过食物。", "success");
});

function loadFoods() {
  const savedFoods = localStorage.getItem(foodsStorageKey);

  if (!savedFoods) {
    return [...defaultFoods];
  }

  try {
    const parsedFoods = JSON.parse(savedFoods);
    return Array.isArray(parsedFoods) && parsedFoods.length > 0 ? parsedFoods : [...defaultFoods];
  } catch (error) {
    return [...defaultFoods];
  }
}

function loadHistory() {
  const savedHistory = localStorage.getItem(historyStorageKey);

  if (!savedHistory) {
    return [];
  }

  try {
    const parsedHistory = JSON.parse(savedHistory);
    return Array.isArray(parsedHistory) ? parsedHistory : [];
  } catch (error) {
    return [];
  }
}

function loadLastPickedFood() {
  return localStorage.getItem(lastPickStorageKey) || "";
}

function loadExcludedFoods() {
  const savedExcludedFoods = localStorage.getItem(excludedFoodsStorageKey);

  if (!savedExcludedFoods) {
    return [];
  }

  try {
    const parsedExcludedFoods = JSON.parse(savedExcludedFoods);
    return Array.isArray(parsedExcludedFoods) ? parsedExcludedFoods : [];
  } catch (error) {
    return [];
  }
}

function normalizeFoodName(foodName) {
  return foodName.trim().replace(/\s+/g, " ");
}

function saveFoods() {
  localStorage.setItem(foodsStorageKey, JSON.stringify(foods));
}

function saveHistory() {
  localStorage.setItem(historyStorageKey, JSON.stringify(history));
}

function saveLastPickedFood() {
  localStorage.setItem(lastPickStorageKey, lastPickedFood);
}

function saveExcludedFoods() {
  localStorage.setItem(excludedFoodsStorageKey, JSON.stringify(excludedFoods));
}

function renderFoods() {
  foodList.innerHTML = "";

  if (foods.length === 0) {
    menuEmpty.style.display = "block";
    excludedHint.style.display = "none";
    return;
  }

  menuEmpty.style.display = "none";
  excludedHint.style.display = excludedFoods.length > 0 ? "block" : "none";

  foods.forEach(function (foodName, index) {
    const isExcluded = excludedFoods.includes(foodName);
    const listItem = document.createElement("li");
    listItem.className = "food-item";
    if (isExcluded) {
      listItem.classList.add("is-excluded");
    }

    const nameSpan = document.createElement("span");
    nameSpan.className = "food-name";
    nameSpan.textContent = foodName;
    if (isExcluded) {
      nameSpan.classList.add("is-excluded");
    }

    const actionWrapper = document.createElement("div");
    actionWrapper.className = "food-actions";

    const toggleButton = document.createElement("button");
    toggleButton.className = "toggle-button";
    toggleButton.type = "button";
    toggleButton.textContent = isExcluded ? "恢复" : "跳过";
    if (isExcluded) {
      toggleButton.classList.add("is-excluded");
    }
    toggleButton.addEventListener("click", function () {
      toggleExcludedFood(foodName);
    });

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "删除";
    deleteButton.addEventListener("click", function () {
      deleteFood(index);
    });

    actionWrapper.appendChild(toggleButton);
    actionWrapper.appendChild(deleteButton);

    listItem.appendChild(nameSpan);
    listItem.appendChild(actionWrapper);
    foodList.appendChild(listItem);
  });
}

function renderHistory() {
  historyList.innerHTML = "";

  if (history.length === 0) {
    historyEmpty.style.display = "block";
    return;
  }

  historyEmpty.style.display = "none";

  history.forEach(function (item, index) {
    const listItem = document.createElement("li");
    listItem.className = "history-item";

    const foodWrapper = document.createElement("div");
    foodWrapper.className = "history-food";

    const rank = document.createElement("span");
    rank.className = "history-rank";
    rank.textContent = index + 1;

    const foodName = document.createElement("span");
    foodName.textContent = item.name;

    const timeText = document.createElement("span");
    timeText.className = "history-time";
    timeText.textContent = item.time;

    foodWrapper.appendChild(rank);
    foodWrapper.appendChild(foodName);
    listItem.appendChild(foodWrapper);
    listItem.appendChild(timeText);
    historyList.appendChild(listItem);
  });
}

function deleteFood(index) {
  const deletedFood = foods[index];
  foods.splice(index, 1);
  excludedFoods = excludedFoods.filter(function (foodName) {
    return foodName !== deletedFood;
  });
  saveFoods();
  saveExcludedFoods();
  renderFoods();

  if (deletedFood === lastPickedFood) {
    lastPickedFood = "";
    saveLastPickedFood();
  }

  showFormMessage("已删除：" + deletedFood, "success");

  if (foods.length === 0) {
    setResultState("菜单为空", "先添加一些食物，再让我们帮你决定。");
  }
}

function toggleExcludedFood(foodName) {
  const isExcluded = excludedFoods.includes(foodName);

  if (isExcluded) {
    excludedFoods = excludedFoods.filter(function (item) {
      return item !== foodName;
    });
    showFormMessage("已恢复：" + foodName, "success");
  } else {
    excludedFoods.push(foodName);
    showFormMessage("本轮已跳过：" + foodName, "success");
  }

  saveExcludedFoods();
  renderFoods();
}

function pickFood() {
  if (foods.length === 0) {
    setResultState("菜单为空", "还没有可抽取的食物，请先添加菜单。");
    showFormMessage("菜单为空，无法抽取。", "error");
    return;
  }

  const enabledFoods = foods.filter(function (foodName) {
    return !excludedFoods.includes(foodName);
  });

  if (enabledFoods.length === 0) {
    setResultState("都被跳过了", "先恢复几个食物，或者清空跳过后再抽取。");
    showFormMessage("当前没有可抽取的食物。", "error");
    return;
  }

  const availableFoods = enabledFoods.filter(function (foodName) {
    return enabledFoods.length === 1 || foodName !== lastPickedFood;
  });

  const randomIndex = Math.floor(Math.random() * availableFoods.length);
  const selectedFood = availableFoods[randomIndex];

  lastPickedFood = selectedFood;
  saveLastPickedFood();

  setResultState(selectedFood, "已经帮你选好了，别纠结，出发吃饭吧。");
  addHistory(selectedFood);
}

function addHistory(foodName) {
  const timeString = formatCurrentTime();

  history.unshift({
    name: foodName,
    time: timeString
  });

  history = history.slice(0, 5);
  saveHistory();
  renderHistory();
}

function formatCurrentTime() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return month + "-" + day + " " + hours + ":" + minutes;
}

function setResultState(mainText, hintText) {
  result.textContent = mainText;
  resultHint.textContent = hintText;
  playResultAnimation();
}

function playResultAnimation() {
  result.classList.remove("result-animate");
  resultHint.classList.remove("result-animate");

  // 触发一次重绘，确保重复点击时动画也能重新播放
  void result.offsetWidth;

  result.classList.add("result-animate");
  resultHint.classList.add("result-animate");
}

function showFormMessage(message, type) {
  formMessage.textContent = message;
  formMessage.className = "form-message " + type;

  window.clearTimeout(showFormMessage.timer);
  showFormMessage.timer = window.setTimeout(function () {
    formMessage.textContent = "";
    formMessage.className = "form-message";
  }, 2200);
}
