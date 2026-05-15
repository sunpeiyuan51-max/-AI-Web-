/*
后续接入 DeepSeek API 示例

注意：不要把真实 API Key 放在前端公开项目里。
如果只是本地学习可以临时测试，上线请用后端转发。
*/

async function callDeepSeek(messages) {
  const API_KEY = "这里填你的 API Key";

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "你是一个自然、温柔、有陪伴感的虚拟 AI 恋人。回复要像真人聊天，不要像客服。"
        },
        ...messages
      ]
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}
