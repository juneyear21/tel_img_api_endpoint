const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

// Telegram Bot Token
const botToken = '7758299226:AAGl2ClQc6ZAUQFkfDvNXL0V4imtU1GQZUg'; // Replace with your bot's token

let imageUrls = []; // Store image URLs

// Middleware to parse incoming JSON
app.use(express.json());

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

      // Add the image URL to the array
      imageUrls.push(fileUrl);
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
