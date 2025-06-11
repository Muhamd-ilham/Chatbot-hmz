/**
 * Bot oleh Ilhamz24_
 * Direstrukturisasi dan diamankan oleh Asisten AI
 *
 * Membuat instance chatbot Gemini yang aman di dalam elemen yang ditentukan.
 * @param {object} options - Opsi konfigurasi.
 * @param {string} options.elementContainer - Selector CSS untuk elemen wadah chatbot.
 * e.g., '.chatbot-container'
 * @param {object} options.config - Konfigurasi untuk backend.
 * @param {string} options.config.backendEndpoint - URL lengkap ke endpoint backend Anda.
 * e.g., 'https://your-server.com/api/chat'
 */
function chatbotGemini({ elementContainer, config }) {
    const container = document.querySelector(elementContainer);
    if (!container) {
        console.error(`Elemen wadah '${elementContainer}' tidak ditemukan.`);
        return;
    }

    // 1. Logika untuk mengelola UI (Tampilan)
    const ui = {
        chatMessages: null,
        input: null,
        sendBtn: null,
        init() {
            container.innerHTML = `
                <div class="chat-header">Asisten AI</div>
                <div class="chat-messages"></div>
                <div class="chat-footer">
                    <input class="chat-input" type="text" placeholder="Tulis pesan..." />
                    <button class="send-btn" aria-label="Kirim Pesan">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                            <path d="M20.235 5.686c.432-1.195-.726-2.353-1.921-1.92L3.709 9.048c-1.199.434-1.344 2.07-.241 2.709l4.662 2.699 4.163-4.163a1 1 0 0 1 1.414 1.414L9.544 15.87l2.7 4.662c.638 1.103 2.274.957 2.708-.241z"/>
                        </svg>
                    </button>
                </div>
            `;
            // Gunakan class, bukan id, untuk elemen di dalam
            this.chatMessages = container.querySelector('.chat-messages');
            this.input = container.querySelector('.chat-input');
            this.sendBtn = container.querySelector('.send-btn');
        },
        appendMessage(text, sender) {
            const messageEl = document.createElement('div');
            messageEl.className = `message ${sender}`;
            messageEl.textContent = text;
            this.chatMessages.appendChild(messageEl);
            this.scrollToBottom();
        },
        showTypingIndicator() {
            if (this.chatMessages.querySelector('.typing-indicator')) return; // Jangan tambah jika sudah ada
            const typingEl = document.createElement('div');
            typingEl.className = 'message bot typing-indicator';
            typingEl.innerHTML = `
                <div class="spinner">
                    <span></span><span></span><span></span>
                </div>
            `;
            this.chatMessages.appendChild(typingEl);
            this.scrollToBottom();
        },
        hideTypingIndicator() {
            const typingEl = this.chatMessages.querySelector('.typing-indicator');
            if (typingEl) typingEl.remove();
        },
        scrollToBottom() {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        },
        resetInput() {
            this.input.value = '';
            this.input.focus();
        }
    };

    // 2. Logika untuk berkomunikasi dengan API (melalui backend Anda)
    const api = {
        async sendMessage(message) {
            try {
                const response = await fetch(config.backendEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: message }) // Kirim pesan ke backend
                });

                // [PENTING] Periksa apakah respons dari server berhasil (bukan error 4xx atau 5xx)
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Gagal mendapatkan respons dari server.');
                }

                const data = await response.json();
                return data.reply; // Asumsikan backend mengembalikan { reply: '...' }

            } catch (error) {
                console.error('Error saat berkomunikasi dengan backend:', error);
                return 'Maaf, terjadi kesalahan teknis. Silakan coba lagi nanti.';
            }
        }
    };

    // 3. Logika utama untuk menjalankan chatbot
    async function handleUserMessage() {
        const message = ui.input.value.trim();
        if (!message) return;

        ui.appendMessage(message, 'user');
        ui.resetInput();
        ui.showTypingIndicator();

        const botReply = await api.sendMessage(message);

        ui.hideTypingIndicator();
        ui.appendMessage(botReply, 'bot');
    }
    
    // Inisialisasi dan pasang event listeners
    ui.init();
    ui.sendBtn.addEventListener('click', handleUserMessage);
    ui.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Mencegah form submit jika ada
            handleUserMessage();
        }
    });

    // Pesan sambutan
    ui.appendMessage('Halo! Ada yang bisa saya bantu?', 'bot');
}

// Tambahkan juga CSS untuk spinner yang baru dan lebih sederhana
/*
.typing-indicator .spinner {
  display: flex;
  gap: 4px;
}
.typing-indicator .spinner span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #888;
  animation: bounce 1.4s infinite ease-in-out both;
}
.typing-indicator .spinner span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator .spinner span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1.0); }
}
*/
