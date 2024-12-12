// Sends the user's message to the backend
async function sendMessageToBackend(message) {
    try {
        console.log('Sending message to backend:', message); // Debugging log

        const response = await fetch('/.netlify/functions/openai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            console.error('Backend responded with an error:', response.status);
            throw new Error(`Failed to get response from server: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Received response from backend:', data); // Debugging log

        return data.reply || 'No reply received.';
    } catch (error) {
        console.error('Error communicating with backend:', error.message);
        return 'Error: Unable to connect to the server.';
    }
}

// Event listener for chat form submission
document.getElementById('chat-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const userInput = document.getElementById('user-input').value.trim();
    const outputTape = document.getElementById('output-tape');

    if (!userInput) {
        console.warn('User input is empty. Skipping API call.');
        return;
    }

    console.log('User input:', userInput); // Debugging log

    // Clear previous output and display a loading message
    outputTape.textContent = '...Processing...';

    // Call the backend function
    const response = await sendMessageToBackend(userInput);

    // Display the response with the punch card effect
    typePunchCardEffect(outputTape, response, 50);

    // Clear the input field
    document.getElementById('user-input').value = '';
});

// Function for punch card effect typing
async function typePunchCardEffect(container, text, speed = 50, maxCharsPerLine = 30) {
    const typingSound = document.getElementById('typing-sound');
    const carriageSound = new Audio('assets/carriage.mp3');
    const returnSound = new Audio('assets/return.mp3');

    typingSound.loop = true;
    typingSound.currentTime = 0;
    typingSound.play();

    let currentPrinter = createNewPrinter(container);
    let currentTape = createNewTape(currentPrinter);
    let offset = 0;

    for (let i = 0; i < text.length; i++) {
        if (i > 0 && i % maxCharsPerLine === 0) {
            typingSound.pause();
            carriageSound.play();
            await pause(500);
            typingSound.play();
            currentPrinter = createNewPrinter(container);
            currentTape = createNewTape(currentPrinter);
            offset = 0;
        }

        const charSpan = document.createElement('span');
        charSpan.textContent = text.charAt(i);
        currentTape.appendChild(charSpan);

        offset -= 20;
        currentTape.style.transform = `translateX(${offset}px)`;
        await pause(speed);
    }

    typingSound.pause();
    returnSound.play();
}

function createNewPrinter(container) {
    const printer = document.createElement('div');
    printer.classList.add('printer');
    container.appendChild(printer);
    return printer;
}

function createNewTape(printer) {
    const tape = document.createElement('div');
    tape.classList.add('tape-line');
    printer.appendChild(tape);
    return tape;
}

function pause(duration) {
    return new Promise(resolve => setTimeout(resolve, duration));
}