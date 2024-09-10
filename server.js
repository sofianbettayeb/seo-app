const express = require('express');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const sizeOf = require('image-size');

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
    const h2Tags = $('h2').map((i, el) => $(el).text()).get();
    const h3Tags = $('h3').map((i, el) => $(el).text()).get();
    const keywordDensity = calculateKeywordDensity(html, keyword);
    const readabilityScore = calculateReadabilityScore(html);
    const internalLinks = $('a[href^="/"], a[href^="' + url + '"]').length;
    const externalLinks = $('a[href^="http"]:not([href^="' + url + '"])').length;
    const keywordInUrl = url.toLowerCase().includes(keyword.toLowerCase());
    const keywordInTitle = title.toLowerCase().includes(keyword.toLowerCase());
    const keywordInHeadings = {
      h1: h1Tags.filter(tag => tag.toLowerCase().includes(keyword.toLowerCase())).length,
      h2: h2Tags.filter(tag => tag.toLowerCase().includes(keyword.toLowerCase())).length,
      h3: h3Tags.filter(tag => tag.toLowerCase().includes(keyword.toLowerCase())).length
    };

    // Enhanced title analysis
    const titleAnalysis = {
      length: title.length,
      containsKeyword: keywordInTitle,
      keywordPosition: keywordInTitle ? title.toLowerCase().indexOf(keyword.toLowerCase()) + 1 : 0,
    };

    // Enhanced heading analysis
    const headingAnalysis = {
      h1: analyzeHeadings(h1Tags, keyword),
      h2: analyzeHeadings(h2Tags, keyword),
      h3: analyzeHeadings(h3Tags, keyword)
    };

    // Meta SEO analysis
    const metaTags = $('meta').map((i, el) => ({
      name: $(el).attr('name') || $(el).attr('property'),
      content: $(el).attr('content')
    })).get();

    const openGraphTags = metaTags.filter(tag => tag.name && tag.name.startsWith('og:'));
    const twitterTags = metaTags.filter(tag => tag.name && tag.name.startsWith('twitter:'));

    const canonicalUrl = $('link[rel="canonical"]').attr('href') || '';
    const robotsMeta = $('meta[name="robots"]').attr('content') || '';

    // Image analysis
    const imageAnalysis = await analyzeImages($, url);

    res.json({
      title,
      title_analysis: titleAnalysis,
      meta_description: metaDescription,
      heading_analysis: headingAnalysis,
      keyword_density: keywordDensity,
      readability_score: readabilityScore,
      internal_links: internalLinks,
      external_links: externalLinks,
      keyword_in_url: keywordInUrl,
      keyword_in_title: keywordInTitle,
      keyword_in_headings: keywordInHeadings,
      meta_tags: metaTags,
      open_graph_tags: openGraphTags,
      twitter_tags: twitterTags,
      canonical_url: canonicalUrl,
      robots_meta: robotsMeta,
      image_analysis: imageAnalysis
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

function analyzeHeadings(headings, keyword) {
  return {
    count: headings.length,
    withKeyword: headings.filter(h => h.toLowerCase().includes(keyword.toLowerCase())).length,
    averageLength: headings.reduce((sum, h) => sum + h.length, 0) / headings.length || 0,
    list: headings
  };
}

async function analyzeImages($, baseUrl) {
  const images = $('img');
  const totalImages = images.length;
  let imagesWithAlt = 0;
  let imagesWithKeywordInAlt = 0;
  let imagesWithKeywordInFilename = 0;
  let largeImages = 0;
  let smallImages = 0;

  const imageAnalysisPromises = images.map(async (i, img) => {
    const src = $(img).attr('src');
    const alt = $(img).attr('alt');
    const fullSrc = src.startsWith('http') ? src : new URL(src, baseUrl).href;

    if (alt) {
      imagesWithAlt++;
      if (alt.toLowerCase().includes(keyword.toLowerCase())) {
        imagesWithKeywordInAlt++;
      }
    }

    if (src.toLowerCase().includes(keyword.toLowerCase())) {
      imagesWithKeywordInFilename++;
    }

    try {
      const response = await axios.get(fullSrc, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary');
      const dimensions = sizeOf(buffer);
      
      if (dimensions.width > 100 && dimensions.height > 100) {
        largeImages++;
      } else {
        smallImages++;
      }
    } catch (error) {
      console.error(`Error analyzing image: ${fullSrc}`, error.message);
    }
  });

  await Promise.all(imageAnalysisPromises);

  return {
    totalImages,
    imagesWithAlt,
    imagesWithKeywordInAlt,
    imagesWithKeywordInFilename,
    largeImages,
    smallImages
  };
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
