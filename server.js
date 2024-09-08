const express = require('express');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'static')));

// Parse JSON bodies
app.use(express.json());

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

// SEO analysis function
async function analyzeSEO(url, keyword) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    // Extract main text content
    const mainContent = $('body').text();

    // Analyze SEO factors
    const title = $('title').text() || 'No title found';
    const metaDescription = $('meta[name="description"]').attr('content') || 'No meta description found';
    const h1Tags = $('h1').map((i, el) => $(el).text()).get();
    const keywordCount = (mainContent.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
    const totalWords = mainContent.split(/\s+/).length;
    const keywordDensity = (keywordCount / totalWords) * 100;

    // Calculate readability score
    const { fleschKincaidGrade } = await import('text-readability');
    const readabilityScore = fleschKincaidGrade(mainContent);

    // Analyze internal and external links
    const internalLinks = $('a[href^="/"]').length;
    const externalLinks = $('a[href^="http"]').length;

    // Check for keyword in URL
    const keywordInUrl = url.toLowerCase().includes(keyword.toLowerCase());

    // Check for keyword in headings (h1, h2, h3)
    const headings = $('h1, h2, h3');
    const keywordInHeadings = headings.filter((i, el) => $(el).text().toLowerCase().includes(keyword.toLowerCase())).length;

    return {
      title,
      meta_description: metaDescription,
      h1_tags: h1Tags,
      keyword_count: keywordCount,
      keyword_density: parseFloat(keywordDensity.toFixed(2)),
      readability_score: parseFloat(readabilityScore.toFixed(2)),
      internal_links: internalLinks,
      external_links: externalLinks,
      keyword_in_url: keywordInUrl,
      keyword_in_headings: keywordInHeadings
    };
  } catch (error) {
    console.error('Error analyzing SEO:', error);
    throw error;
  }
}

// Analyze route
app.post('/analyze', async (req, res) => {
  const { url, keyword } = req.body;

  if (!url || !keyword) {
    return res.status(400).json({ error: 'URL and keyword are required' });
  }

  try {
    const results = await analyzeSEO(url, keyword);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while analyzing the URL' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});
