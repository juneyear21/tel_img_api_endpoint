const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

// Telegram Bot Token
const botToken = '7758299226:AAGl2ClQc6ZAUQFkfDvNXL0V4imtU1GQZUg';

let imageUrls = []; // Store image URLs for later use

// Function to get updates from Telegram
async function getUpdates() {
  try {
    const response = await axios.get(`https://api.telegram.org/bot${botToken}/getUpdates`);
    const updates = response.data.result;

    if (updates.length > 0) {
      updates.forEach(async (update) => {
        if (update.message && update.message.photo) {
          // Extract file_id
          const fileId = update.message.photo[update.message.photo.length - 1].file_id;
          console.log('File ID:', fileId);
          
          // Call getFile method to fetch the file path
          const fileResponse = await axios.get(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
          const filePath = fileResponse.data.result.file_path;
          console.log('File Path:', filePath);

          // Now you can create the download URL
          const fileUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
          console.log('File URL:', fileUrl);
          
          // Store the image URL in the array
          imageUrls.push(fileUrl);
        }
      });
    }
  } catch (error) {
    console.error('Error fetching updates:', error);
  }
}

// Expose an endpoint to get the latest image URLs
app.get('/image', (req, res) => {
  res.json({ images: imageUrls });
});

// Set an interval to check for updates
setInterval(getUpdates, 5000); // Fetch updates every 5 seconds

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
