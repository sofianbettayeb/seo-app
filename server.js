const express = require('express');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

// Serve static files from the 'static' directory
app.use(express.static(path.join(__dirname, 'static')));

// Parse JSON bodies
app.use(express.json());

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

// Analyze endpoint
app.post('/analyze', async (req, res) => {
  let { url, keyword } = req.body;

  // Validate input
  if (!url || !keyword) {
    return res.status(400).json({ error: 'URL and keyword are required' });
  }

  // Trim leading and trailing whitespace, quotes, and apostrophes
  url = url.trim().replace(/^['"]|['"]$/g, '');

  // Add 'https://' if not present
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }

  // Validate keyword
  if (!/^[a-zA-Z0-9\s-]+$/.test(keyword) || keyword.trim().length === 0) {
    return res.status(400).json({ error: 'Invalid keyword. It should contain only letters, numbers, spaces, and hyphens.' });
  }

  try {
    // Validate URL
    const urlObj = new URL(url);
    if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
      return res.status(400).json({ error: 'Invalid protocol. URL must use http:// or https://' });
    }

    const response = await axios.get(url, { 
      timeout: 10000, // 10 seconds timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const html = response.data;
    const $ = cheerio.load(html);

    // Perform SEO analysis (rest of the code remains the same)
    // ...

    res.json({
      // Analysis results
      // ...
    });
  } catch (error) {
    console.error('Error:', error);
    if (error instanceof TypeError && error.message.includes('Invalid URL')) {
      res.status(400).json({ error: 'The provided URL is invalid. Please enter a valid URL.' });
    } else if (error.code === 'ENOTFOUND') {
      res.status(404).json({ error: 'The requested URL could not be found. Please check the URL and try again.' });
    } else if (error.code === 'ETIMEDOUT') {
      res.status(504).json({ error: 'The request timed out. The website may be slow or unavailable.' });
    } else if (error.response && error.response.status === 403) {
      res.status(403).json({ error: 'Access to the website is forbidden. The site may be blocking our requests.' });
    } else if (error.response && error.response.status === 429) {
      res.status(429).json({ error: 'Too many requests. Please try again later.' });
    } else if (error.response && error.response.status >= 400 && error.response.status < 500) {
      res.status(error.response.status).json({ error: `Client error: ${error.response.status}. Please check your input and try again.` });
    } else if (error.response && error.response.status >= 500) {
      res.status(error.response.status).json({ error: `Server error: ${error.response.status}. The target website might be experiencing issues.` });
    } else {
      res.status(500).json({ error: 'An unexpected error occurred while analyzing the URL. Please try again later.' });
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
