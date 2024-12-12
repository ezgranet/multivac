const axios = require('axios');

exports.handler = async function (event, context) {
    // Validate that a body exists
    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'No message provided' })
        };
    }

    // Check for OpenAI API key
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'OpenAI API key not configured' })
        };
    }

    try {
        // Parse the incoming message
        const { message } = JSON.parse(event.body);

        // Validate message
        if (!message) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Message is required' })
            };
        }

        // Check message length (restrict to 280 characters)
        if (message.length > 280) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Message exceeds 280 characters. Please shorten your message.' })
            };
        }

        // Limit chat history to just 1 message (only the latest user message)
        const chatHistory = [{ role: 'user', content: message }];

        // Make request to OpenAI
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',  // Adjust model as needed
            messages: chatHistory  // Only include the latest message in history
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        // Return successful response
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // Important for cross-origin requests
                'Access-Control-Allow-Methods': 'POST'
            },
            body: JSON.stringify({
                reply: response.data.choices[0].message.content
            })
        };
    } catch (error) {
        // Detailed error logging
        console.error('OpenAI API Error:', error.response ? error.response.data : error.message);

        return {
            statusCode: error.response ? error.response.status : 500,
            body: JSON.stringify({
                error: error.response
                    ? error.response.data.error.message
                    : 'Unexpected error communicating with OpenAI'
            })
        };
    }
};
