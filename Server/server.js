const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const port = 3000;

// Serve static files from the Dashboard directory
app.use(express.static(path.join(__dirname, '../Dashboard')));

// Route handler for the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Dashboard/dashboard.html'));
});

// Route handler for generating results
app.post('/api/generate-results', async (req, res) => {
  try {
    const { inputText } = req.body;

    const API_KEY = "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"; 

    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: inputText }],
        max_tokens: 1000,
        temperature: 0.3
      })
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', options);
    const data = await response.json();

    const generatedOutput = data.choices[0].message.content;

    res.json({ output: generatedOutput });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while generating results' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
