const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const port = 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const upload = multer({ dest: 'uploads/' });

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cors()); // Enable CORS for all routes

// Serve index.html at the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const createTTS = async (text) => {
  try {
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1-hd',
      voice: 'onyx',
      input: text,
    });
    const buffer = Buffer.from(await mp3.arrayBuffer());
    const filePath = path.resolve(__dirname, 'public', 'output.mp3');
    await fs.promises.writeFile(filePath, buffer);
    return filePath;
  } catch (error) {
    console.error('Error creating TTS:', error);
    throw error;
  }
};

app.post('/analyze-image', upload.single('image'), async (req, res) => {
  const imagePath = path.join(__dirname, 'uploads', req.file.filename);
  
  const encodeImageToBase64 = (filePath) => {
    const file = fs.readFileSync(filePath);
    return file.toString('base64');
  };

  const base64Image = encodeImageToBase64(imagePath);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Describe to me in a short continuous text what can be seen on this screenshot" },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ]
    });

    const description = response.choices[0].message.content;
    await createTTS(description);

    res.json({ content: description });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    fs.unlinkSync(imagePath); // delete the file after processing
  }
});

app.get('/audio', (req, res) => {
  const filePath = path.resolve(__dirname, 'public', 'output.mp3');
  res.sendFile(filePath);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
