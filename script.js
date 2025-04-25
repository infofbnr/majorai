let suggestions = [];  // Store AI suggestions
let currentSuggestionIndex = 0;

function xorObfuscate(data, key) {
    return data.split('').map((char, i) => 
        String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))
    ).join('');
}

function base64Decode(data) {
    return atob(data);
}

function simpleDecode(encodedKey) {
    const decodedKey = base64Decode(encodedKey);
    const xorKey = 'simplekey';
    return xorObfuscate(decodedKey, xorKey);
}

const encodedKey = "AAJAAB4KAUg6KyxdFV4uPx89HThZAzMWXBABCRgDQFkmCS5KIAI7OAQHOSAJQlsUQCI/Gg4YHS89AQY6OScSGlgePhwuLCcPGi4yKQYAH1EuIj1eMgAHACMzMhkuAQ43BR9KGDhVERwpJQo3LAw5FDgyLxQDKiEsQzsSKlcvCjMPGAULL1c+O18HJTkyGDc7SxEYQQspCQY7LDk7FwE9X1c4ECg=";
const apiKey = simpleDecode(encodedKey);

const majorForm = document.getElementById('majorForm');
const resultDiv = document.getElementById('result');
const resultText = document.getElementById('resultText');
const likeButton = document.getElementById('likeButton');
const dislikeButton = document.getElementById('dislikeButton');
const inttext = document.getElementById('interests');

let chatHistory = [
    { role: "system", content: "You are an AI academic advisor. Ask questions one by one to learn more about the user's interests, then suggest suitable university majors. Do not use any markup, such as bold, italic, etc. Only pure english." },
    { role: "assistant", content: "Hi there! I'd love to help you find your ideal university major. Can you tell me what kind of subjects or activities you enjoy?" }
];

const chatContainer = document.getElementById('chatContainer');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');

function addMessage(role, text) {
    const bubble = document.createElement('div');
    bubble.className = role === 'user' ? 'text-right' : 'text-left';
    bubble.innerHTML = `<div class="inline-block bg-${role === 'user' ? 'blue' : 'gray'}-100 text-${role === 'user' ? 'blue' : 'gray'}-800 px-4 py-2 rounded-xl">${text}</div>`;
    chatContainer.appendChild(bubble);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function sendMessage() {
    const userInput = chatInput.value.trim();
    if (!userInput) return;

    addMessage('user', userInput);
    chatHistory.push({ role: 'user', content: userInput });
    chatInput.value = '';

    addMessage('assistant', 'Thinking...');

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: chatHistory,
                max_tokens: 150
            })
        });

        const data = await response.json();
        const reply = data.choices[0].message.content.trim();

        // Remove "Thinking..." and add real reply
        chatContainer.lastChild.remove();
        addMessage('assistant', reply);

        chatHistory.push({ role: 'assistant', content: reply });

    } catch (error) {
        chatContainer.lastChild.remove();
        addMessage('assistant', "Oops! Something went wrong. Try again later.");
    }
}

sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') sendMessage();
});

// Initial bot message
window.addEventListener('load', () => {
    addMessage('assistant', chatHistory[1].content);
});
