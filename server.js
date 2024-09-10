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

  // Add 'https://' if not present
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }

  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    // Perform SEO analysis (enhanced version)
    const title = $('title').text();
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const h1Tags = $('h1').map((i, el) => $(el).text()).get();
    const keywordDensity = calculateKeywordDensity(html, keyword);
    const readabilityScore = calculateReadabilityScore(html);
    const internalLinks = $('a[href^="/"], a[href^="' + url + '"]').length;
    const externalLinks = $('a[href^="http"]:not([href^="' + url + '"])').length;
    const keywordInUrl = url.toLowerCase().includes(keyword.toLowerCase());
    const keywordInHeadings = $('h1, h2, h3, h4, h5, h6').text().toLowerCase().includes(keyword.toLowerCase()) ? 1 : 0;

    // Meta SEO analysis
    const metaTags = $('meta').map((i, el) => ({
      name: $(el).attr('name') || $(el).attr('property'),
      content: $(el).attr('content')
    })).get();

    const openGraphTags = metaTags.filter(tag => tag.name && tag.name.startsWith('og:'));
    const twitterTags = metaTags.filter(tag => tag.name && tag.name.startsWith('twitter:'));

    const canonicalUrl = $('link[rel="canonical"]').attr('href') || '';
    const robotsMeta = $('meta[name="robots"]').attr('content') || '';

    res.json({
      title,
      meta_description: metaDescription,
      h1_tags: h1Tags,
      keyword_density: keywordDensity,
      readability_score: readabilityScore,
      internal_links: internalLinks,
      external_links: externalLinks,
      keyword_in_url: keywordInUrl,
      keyword_in_headings: keywordInHeadings,
      meta_tags: metaTags,
      open_graph_tags: openGraphTags,
      twitter_tags: twitterTags,
      canonical_url: canonicalUrl,
      robots_meta: robotsMeta
    });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while analyzing the URL' });
  }
});

function calculateKeywordDensity(html, keyword) {
  const text = cheerio.load(html).text().toLowerCase();
  const wordCount = text.split(/\s+/).length;
  const keywordCount = (text.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
  return ((keywordCount / wordCount) * 100).toFixed(2);
}

function calculateReadabilityScore(html) {
  const text = cheerio.load(html).text();
  const words = text.trim().split(/\s+/).length;
  const sentences = text.split(/[.!?]+/).length;
  const avgWordsPerSentence = words / sentences;
  return Math.max(0, Math.min(100, 206.835 - 1.015 * avgWordsPerSentence)).toFixed(2);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
