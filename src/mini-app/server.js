const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files from the mini-app directory
app.use(express.static(path.join(__dirname)));

// Serve the main HTML file for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Mini app server running on port ${PORT}`);
  console.log(`Access the mini app at: http://localhost:${PORT}`);
});