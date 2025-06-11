// Bot by Ilhamz24_ //

function bloggerGemini({ elementContainer, config }) {
  const container = document.querySelector(elementContainer);
  if (!container) return;

  container.innerHTML = `
    <div class="chatbox-inner" id="chatbox"></div>
    <div class="chat-footer">
      <input id="input" placeholder="Tulis pesan..." rows="1"/>
      <button class="sendBtn" aria-label="Kirim Pesan">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none"><path d="M20.235 5.686c.432-1.195-.726-2.353-1.921-1.92L3.709 9.048c-1.199.434-1.344 2.07-.241 2.709l4.662 2.699l4.163-4.163a1 1 0 0 1 1.414 1.414L9.544 15.87l2.7 4.662c.638 1.103 2.274.957 2.708-.241z" fill="currentColor"/></g></svg>
      </button>
    </div>
  `;

  const chatbox = container.querySelector('#chatbox');
  const input = container.querySelector('#input');
  const sendBtn = container.querySelector('.sendBtn');

  function appendTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot typing';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
      <svg class="spinner" width="24" height="24" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" stroke="#4b4b4b">
        <g fill="none" stroke-width="4">
          <circle cx="22" cy="22" r="20" stroke-opacity="0.2"/>
          <path d="M42 22c0-11.046-8.954-20-20-20">
            <animateTransform attributeName="transform" type="rotate" from="0 22 22" to="360 22 22" dur="1s" repeatCount="indefinite"/>
          </path>
        </g>
      </svg>`;
    chatbox.appendChild(typingDiv);
    chatbox.scrollTop = chatbox.scrollHeight;
  }

  function removeTypingIndicator() {
    const typingDiv = document.getElementById('typing-indicator');
    if (typingDiv) typingDiv.remove();
  }

  function typeText(text, element) {
    let i = 0;
    const speed = 20;
    function typing() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(typing, speed);
      }
    }
    typing();
  }

  function appendMessage(text, sender) {
    const div = document.createElement('div');
    div.className = 'message ' + sender;
    chatbox.appendChild(div);
    chatbox.scrollTop = chatbox.scrollHeight;
    sender === 'bot' ? typeText(text, div) : div.textContent = text;
  }

  async function sendMessage() {
    const message = input.value.trim();
    if (!message) return;

    appendMessage(message, 'user');
    input.value = '';
    appendTypingIndicator();

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${config.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: message }] }] })
      });

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Maaf, tidak ada balasan.';
      removeTypingIndicator();
      appendMessage(reply, 'bot');
    } catch (err) {
      removeTypingIndicator();
      appendMessage('Terjadi kesalahan saat menghubungi API.', 'bot');
      console.error(err);
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });
}
