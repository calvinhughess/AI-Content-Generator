import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

dotenv.config();

const app = express();

// Equivalent of __dirname and __filename in ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize the OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/index.html'));
});


app.get('/generate', async (req, res) => {
   const postIdeas = await generatePostIdeas(); // Ensure you await the async function
   const message = `Here are your post ideas:\n${postIdeas.join('\n')}`;


    try {
        await sendTelegramMessage(message);
        res.json({ message: 'Message sent with post ideas!' });
    } catch (error) {
        console.error('Error sending Telegram message:', error);
        res.status(500).json({ message: 'Failed to send message' });
    }
});

async function sendTelegramMessage(text) {
    const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const url = `${TELEGRAM_API}?chat_id=${chatId}&text=${encodeURIComponent(text)}`;

    const response = await fetch(url, { method: 'POST' }); // Use POST instead of GET for sending messages
    const data = await response.json();
    console.log(data);
}

async function generatePostIdeas() {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Generate three fresh and unique content ideas for a Rocket League YouTube channel focusing on game strategies, tutorials, and player improvement tips." },
      ],
    });

    // Adjusted to correctly access the response structure for chat API
    if (response.choices.length > 0 && response.choices[0].message) {
      return response.choices[0].message.content.trim().split('\n').filter(line => line.length > 0);
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error generating post ideas:", error);
    return [];
  }
}


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});