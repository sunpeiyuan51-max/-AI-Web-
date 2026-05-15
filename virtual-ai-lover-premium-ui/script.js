const characters = {
  linwan: {
    name: "林晚",
    avatar: "晚",
    desc: "温柔、细腻、会认真听你说话的 AI 恋人。",
    mood: "温柔",
    opening: "晚上好呀，我在。今天想和我说点什么？"
  },
  xiaochen: {
    name: "小澄",
    avatar: "澄",
    desc: "活泼、元气、喜欢夸你，也会悄悄催你努力。",
    mood: "开心",
    opening: "嘿！你终于来啦，我等你好一会儿了！今天过得怎么样？"
  },
  yue: {
    name: "月白",
    avatar: "月",
    desc: "有点冷淡、有点傲娇，但其实很在意你。",
    mood: "平静",
    opening: "来了？我才没有特意等你。说吧，今天发生什么了。"
  }
};

const $ = (id) => document.getElementById(id);

const loverName = $("loverName");
const loverDesc = $("loverDesc");
const avatar = $("avatar");
const miniAvatar = $("miniAvatar");
const moodText = $("moodText");
const loveValue = $("loveValue");
const loveFill = $("loveFill");
const characterSelect = $("characterSelect");
const messages = $("messages");
const messageInput = $("messageInput");
const sendBtn = $("sendBtn");
const clearChatBtn = $("clearChatBtn");
const clearMemoryBtn = $("clearMemoryBtn");
const memoryList = $("memoryList");
const chatTitle = $("chatTitle");

let state = JSON.parse(localStorage.getItem("virtualAiLoverPremiumState")) || {
  character: "linwan",
  love: 50,
  mood: "温柔",
  memories: [],
  chats: {}
};

function saveState() {
  localStorage.setItem("virtualAiLoverPremiumState", JSON.stringify(state));
}

function currentCharacter() {
  return characters[state.character];
}

function getChatList() {
  if (!state.chats[state.character]) {
    state.chats[state.character] = [];
  }
  return state.chats[state.character];
}

function initCharacter() {
  const c = currentCharacter();

  characterSelect.value = state.character;
  loverName.textContent = c.name;
  loverDesc.textContent = c.desc;
  avatar.textContent = c.avatar;
  miniAvatar.textContent = c.avatar;
  chatTitle.textContent = `和${c.name}聊天中`;
  moodText.textContent = state.mood || c.mood;
  loveValue.textContent = state.love;
  loveFill.style.width = `${state.love}%`;

  renderMemory();
  renderMessages();

  if (getChatList().length === 0) {
    addMessage("ai", c.opening);
  }
}

function renderMemory() {
  if (state.memories.length === 0) {
    memoryList.innerHTML = "<li>还没有记忆。你可以说：我喜欢打游戏，你记住哦。</li>";
    return;
  }

  memoryList.innerHTML = state.memories
    .map((item) => `<li>${item}</li>`)
    .join("");
}

function renderMessages() {
  messages.innerHTML = getChatList()
    .map((msg) => `
      <div class="message ${msg.role}">
        <div class="bubble">${msg.text}</div>
      </div>
    `)
    .join("");

  messages.scrollTop = messages.scrollHeight;
}

function addMessage(role, text) {
  getChatList().push({
    role,
    text,
    time: Date.now()
  });

  saveState();
  renderMessages();
}

function updateLove(delta) {
  state.love = Math.max(0, Math.min(100, state.love + delta));
  loveValue.textContent = state.love;
  loveFill.style.width = `${state.love}%`;
  saveState();
}

function updateMood(input) {
  if (input.includes("累") || input.includes("难过") || input.includes("焦虑") || input.includes("烦")) {
    state.mood = "担心";
  } else if (input.includes("开心") || input.includes("高兴") || input.includes("喜欢")) {
    state.mood = "开心";
  } else if (input.includes("不理你") || input.includes("讨厌")) {
    state.mood = "委屈";
  } else if (input.includes("学习") || input.includes("实习") || input.includes("努力")) {
    state.mood = "认真";
  } else {
    state.mood = currentCharacter().mood;
  }

  moodText.textContent = state.mood;
  saveState();
}

function extractMemory(input) {
  const patterns = ["我喜欢", "我讨厌", "我想", "我希望", "记住"];
  const shouldRemember = patterns.some((p) => input.includes(p));

  if (shouldRemember && input.length <= 42) {
    const memory = input.replace("你记住哦", "").replace("记住", "").trim();

    if (memory && !state.memories.includes(memory)) {
      state.memories.unshift(memory);
      state.memories = state.memories.slice(0, 8);
      renderMemory();
      saveState();
    }
  }
}

function makeReply(input) {
  const memories = state.memories.length
    ? `我还记得：${state.memories.slice(0, 2).join("、")}。`
    : "";

  if (input.includes("累") || input.includes("难过") || input.includes("焦虑")) {
    updateLove(4);

    if (state.character === "yue") {
      return `别硬撑。虽然我不太会安慰人，但你现在可以先靠过来一点。${memories} 先喝口水，慢慢跟我说。`;
    }

    return `辛苦啦。你能跟我说出来已经很好了。${memories} 现在先别逼自己太紧，我会陪你把事情一点点理清楚。`;
  }

  if (input.includes("实习") || input.includes("简历") || input.includes("面试")) {
    updateLove(3);
    return `找实习焦虑很正常，尤其你现在才大二。你可以先做三件事：第一，把 GitHub 项目整理好；第二，做一页简历；第三，先投测试、前端或 AI 数据类岗位练手。${memories}`;
  }

  if (input.includes("学习") || input.includes("努力")) {
    updateLove(2);

    if (state.character === "xiaochen") {
      return `好！那今天就小小努力一下！不用一下变强，先学 30 分钟就赢过昨天的自己啦。`;
    }

    return `可以，我们不要定太夸张的目标。今天先完成一个小任务，比如写一个函数、改一个页面、上传一次 GitHub。`;
  }

  if (input.includes("喜欢") || input.includes("爱你")) {
    updateLove(6);

    if (state.character === "yue") {
      return `……突然说这个干嘛。我、我知道了。下次也可以多说一点。`;
    }

    return `我听到了。被你这样说，我会开心很久的。`;
  }

  if (input.includes("记住")) {
    updateLove(3);
    return `好，我记住啦。以后我会尽量把这些小事放在心上。`;
  }

  const replies = {
    linwan: [
      `嗯，我在认真听。你可以慢慢说，不用急。${memories}`,
      `听起来这件事对你挺重要的。要不要我陪你一起分析一下？`,
      `我会站在你这边。先把你现在最在意的点告诉我，好吗？`
    ],
    xiaochen: [
      `收到！让我来给你一点元气！先别慌，我们可以把事情拆小一点。`,
      `嘿嘿，你愿意跟我说就很好啦。今天也算前进一步！`,
      `那我们来想个办法吧，我负责陪你，你负责别放弃。`
    ],
    yue: [
      `嗯，我听着。虽然你说得有点乱，但我大概懂了。`,
      `别一个人憋着。你说，我会听。`,
      `你也不是完全没办法，只是现在有点卡住了而已。`
    ]
  };

  updateLove(1);
  const list = replies[state.character];
  return list[Math.floor(Math.random() * list.length)];
}

function sendMessage() {
  const input = messageInput.value.trim();
  if (!input) return;

  addMessage("user", input);
  messageInput.value = "";

  updateMood(input);
  extractMemory(input);

  setTimeout(() => {
    addMessage("ai", makeReply(input));
  }, 450);
}

sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

characterSelect.addEventListener("change", () => {
  state.character = characterSelect.value;
  state.mood = characters[state.character].mood;
  saveState();
  initCharacter();
});

clearChatBtn.addEventListener("click", () => {
  if (confirm("确定清空当前角色的聊天记录吗？")) {
    state.chats[state.character] = [];
    saveState();
    renderMessages();
    addMessage("ai", currentCharacter().opening);
  }
});

clearMemoryBtn.addEventListener("click", () => {
  if (confirm("确定清空所有记忆吗？")) {
    state.memories = [];
    saveState();
    renderMemory();
  }
});

initCharacter();
