const fs = require('fs');
const path = require('path');

// Assuming `qrCode` contains the base64 encoded image data from your database

// Remove the data:image/png;base64, prefix
const base64Data = qrCode.replace(/^data:image\/png;base64,/, '');

// Define a file path to save the image
const imagePath = path.join(__dirname, 'qr_code.png');

// Write the base64 data to a file
fs.writeFile(imagePath, base64Data, 'base64', function(err) {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Image saved successfully:', imagePath);
    // Now you can display the image path or serve it using an HTTP server
  }
});
