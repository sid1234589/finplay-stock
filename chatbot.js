// Replace with your real Gemini API key
const GEMINI_API_KEY = 'AIzaSyAwfJhDq0ucfMx9q8qu_Tn7t0C9bfP4c6k';

const modal = document.getElementById('chat-modal');
const openBtn = document.querySelector('button[aria-label="AI Chat"]');
const closeBtn = document.getElementById('close-chat');
const sendBtn = document.getElementById('send-btn');
const userInput = document.getElementById('user-input');
const chatOutput = document.getElementById('chat-output');

// Show modal
openBtn.addEventListener('click', () => modal.classList.remove('hidden'));
// Close modal
closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

// Send message to Gemini
sendBtn.addEventListener('click', async () => {
  const userText = userInput.value.trim();
  if (!userText) return;

  addMessage('user', userText);
  userInput.value = '';
  const response = await fetchGeminiReply(userText);
  addMessage('gemini', response);
});

function addMessage(sender, text) {
  const msgDiv = document.createElement('div');
  msgDiv.className = `mb-2 ${sender === 'user' ? 'text-right' : 'text-left'}`;
  msgDiv.innerHTML = `<span class="inline-block px-3 py-2 rounded-md ${sender === 'user' ? 'bg-[#294DFF] text-white' : 'bg-gray-100 text-[#161616]'}">${text}</span>`;
  chatOutput.appendChild(msgDiv);
  chatOutput.scrollTop = chatOutput.scrollHeight;
}

async function fetchGeminiReply(prompt) {
    try {
      const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + GEMINI_API_KEY, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        console.error("API Error:", errorData);
        return `API Error: ${errorData.error?.message || res.status}`;
      }
  
      const data = await res.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't understand that.";
    } catch (error) {
      console.error("Fetch error:", error);
      return "Error connecting to Gemini API. Check console for details.";
    }
  }
