require('dotenv').config();

const express = require('express');
const path = require('path');
const https = require('https');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000; // Use environment variable or fallback to port 3000

const API_KEY = process.env.OPENAI_API_KEY; // Use environment variable for the OpenAI API key

const httpsAgent = new https.Agent(); // Create a reusable HTTPS agent

app.use(express.json({ limit: '1mb' })); // Limit JSON request size to 1MB
app.use(cors());

// Serve static files from the "Dashboard" directory
app.use(express.static(path.join(__dirname, '..', 'Dashboard')));

// Route handler for the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'Dashboard', 'dashboard.html'));
});

// Route handler for generating results
app.post('/api/generate-results', (req, res) => {
  try {
    const { inputText } = req.body;

    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      agent: httpsAgent // Reuse the HTTPS agent
    };

    const requestData = {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'system', content: 'You are a helpful assistant.' }, { role: 'user', content: inputText }],
      max_tokens: 1000,
      temperature: 0.3
    };

    const request = https.request('https://api.openai.com/v1/chat/completions', options, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        const responseData = JSON.parse(data);
        const choices = responseData.choices
        let generatedOutput = '';
        if(choices != undefined && choices.length > 0){
          generatedOutput = choices[0].message.content;
        }
        res.json({ output: generatedOutput });
      });
    });

    request.on('error', (error) => {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while generating results' });
    });

    request.write(JSON.stringify(requestData));
    request.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while generating results' });
  }
});

// Custom error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
