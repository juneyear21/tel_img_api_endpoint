const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Telegram Bot Token
const botToken = '7758299226:AAGl2ClQc6ZAUQFkfDvNXL0V4imtU1GQZUg'; // Replace with your bot's token

// Global array to store image URLs
let imageUrls = [];

// Create a directory to save images
const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Middleware to parse incoming JSON
app.use(express.json());

// Serve static files from the images folder
app.use('/images', express.static(imagesDir));

// Webhook endpoint
app.post('/webhook', async (req, res) => {
  try {
    const update = req.body;

    if (update.message && update.message.photo) {
      // Extract the largest photo file_id
      const fileId = update.message.photo[update.message.photo.length - 1].file_id;
      console.log('File ID:', fileId);

      // Fetch the file path
      const fileResponse = await axios.get(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
      const filePath = fileResponse.data.result.file_path;
      console.log('File Path:', filePath);

      // Create the file URL
      const fileUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
      console.log('File URL:', fileUrl);

      // Download and save the file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `image-${timestamp}.jpg`;
      const fileSavePath = path.join(imagesDir, filename);

      const fileStream = fs.createWriteStream(fileSavePath);
      const response = await axios({
        url: fileUrl,
        method: 'GET',
        responseType: 'stream',
      });
      response.data.pipe(fileStream);

      // Wait for the file to finish saving
      await new Promise((resolve, reject) => {
        fileStream.on('finish', resolve);
        fileStream.on('error', reject);
      });

      console.log(`Image saved: ${fileSavePath}`);

      // Add the public URL to the global imageUrls array
      const publicUrl = `/images/${filename}`;
      imageUrls.push(publicUrl);
    }

    // Respond to Telegram
    res.sendStatus(200);
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.sendStatus(500);
  }
});

// Expose an endpoint to get the latest image URLs
app.get('/image', (req, res) => {
  res.json({ images: imageUrls });
});

// Set webhook (run this once to configure the bot)
async function setWebhook() {
  const webhookUrl = `https://tel-img-api-endpoint.onrender.com/webhook`; // Replace with your public URL
  try {
    const response = await axios.get(`https://api.telegram.org/bot${botToken}/setWebhook?url=${webhookUrl}`);
    console.log('Webhook set successfully:', response.data);
  } catch (error) {
    console.error('Error setting webhook:', error);
  }
}

// Start the server
app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  await setWebhook(); // Configure the webhook when the server starts
});
