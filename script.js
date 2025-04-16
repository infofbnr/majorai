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

const encodedKey = "AAJAAB4KAUgbAjkkJTQnXj8jMlwpFRQjA1MrIyYXIC1dJzMuEh8rBChXXTIXOgxcQVtWBCNOHDYUQ14HCi8MGCM8Rwk0HxYcMCwZQzsyAwYmFz1eMgAHACMzKT4eQhkOXQcaIlBcCDUmPlEJMT8EHQEdKgIRQAU5MwZUOQQNKQ1fGAEAGCwgRAIIHRVTIhMrBhE5HlRQGQomIz4dGilRX1xIRyg=";
const apiKey = simpleDecode(encodedKey);

const majorForm = document.getElementById('majorForm');
const resultDiv = document.getElementById('result');
const resultText = document.getElementById('resultText');
const likeButton = document.getElementById('likeButton');
const dislikeButton = document.getElementById('dislikeButton');
const inttext = document.getElementById('interests');
majorForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const interests = document.getElementById('interests').value;

    resultText.textContent = 'Thinking...';
    resultDiv.classList.remove('hidden');
    currentSuggestionIndex = 0;

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant that suggests university majors based on interests and skills. Give 5 different options, separated by commas, and only the major names."
                    },
                    {
                        role: "user",
                        content: `Based on the following interests and skills, suggest 5 suitable university majors: ${interests}`
                    }
                ],
                max_tokens: 150
            })
        });

        const data = await response.json();

        if (response.ok && data.choices) {
            const responseText = data.choices[0].message.content.trim();
            suggestions = responseText.split(',').map(s => s.trim());
            resultText.textContent = suggestions[currentSuggestionIndex];
            dislikeButton.disabled= suggestions.length <= 1;
        } else {
            resultText.textContent = 'No suggestions found. Please try again.';
            suggestions = [];
        }

    } catch (error) {
        resultText.textContent = `An error occurred. Please try again. ${error.message}`;
        suggestions = [];
    }
});

likeButton.addEventListener('click', function () {
    if (suggestions.length > 0) {
        alert(`Great! We're glad you liked: ${suggestions[currentSuggestionIndex]}`);

        // Clear the text area
        document.getElementById('interests').value = '';

        // Hide the result section
        resultDiv.classList.add('hidden');

        // Reset suggestions and index
        suggestions = [];
        currentSuggestionIndex = 0;

        // Re-enable buttons in case they were disabled before
        likeButton.disabled = false;
        dislikeButton.disabled = false;
    }
});


dislikeButton.addEventListener('click', function () {
    if (currentSuggestionIndex < suggestions.length - 1) {
        currentSuggestionIndex++;
        resultText.textContent = suggestions[currentSuggestionIndex];
    } else {
        resultText.textContent = "That's all the suggestions we have!";
        dislikeButton.disabled = true;
        likeButton.disabled = true;
    }
});