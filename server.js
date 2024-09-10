const express = require('express');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');

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
    console.error('Error: Missing URL or keyword');
    return res.status(400).json({ error: 'URL and keyword are required', code: 'MISSING_PARAMS' });
  }

  // Trim leading and trailing whitespace, quotes, and apostrophes
  url = url.trim().replace(/^['"]|['"]$/g, '');
  keyword = keyword.trim();

  // Validate keyword
  if (!/^[a-zA-Z0-9\s-]+$/.test(keyword) || keyword.length === 0 || keyword.length > 100) {
    console.error('Error: Invalid keyword');
    return res.status(400).json({ error: 'Invalid keyword. It should contain only letters, numbers, spaces, and hyphens, and be between 1 and 100 characters long.', code: 'INVALID_KEYWORD' });
  }

  try {
    // Validate and normalize URL
    const normalizedUrlResult = normalizeUrl(url);
    if (!normalizedUrlResult.isValid) {
      console.error('Error: Invalid URL');
      return res.status(400).json({ error: normalizedUrlResult.error, code: normalizedUrlResult.code });
    }

    console.log(`Analyzing URL: ${normalizedUrlResult.url} with keyword: ${keyword}`);

    const response = await axios.get(normalizedUrlResult.url, { 
      timeout: 10000, // 10 seconds timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      maxContentLength: 10 * 1024 * 1024, // 10MB max content length
      maxRedirects: 5 // Maximum number of redirects to follow
    });
    
    const html = response.data;
    const $ = cheerio.load(html);

    // Perform SEO analysis
    const title = $('title').text() || '';
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const h1 = $('h1').first().text() || '';
    const content = $('body').text() || '';

    // Heading analysis with enhanced error handling
    const headingAnalysis = analyzeHeadings($, keyword);

    // Perform other SEO analyses
    const keywordDensity = calculateKeywordDensity(content, keyword);
    const readabilityScore = calculateReadabilityScore(content);
    const internalLinks = countInternalLinks($, normalizedUrlResult.url);
    const externalLinks = countExternalLinks($, normalizedUrlResult.url);

    // Additional SEO analyses
    const slugAnalysis = analyzeSlug(normalizedUrlResult.url, keyword);
    const openGraphTags = getOpenGraphTags($);
    const twitterTags = getTwitterTags($);
    const canonicalUrl = getCanonicalUrl($);
    const robotsMeta = getRobotsMeta($);
    const breadcrumbs = checkBreadcrumbs($);
    const keywordInIntroduction = checkKeywordInIntroduction($, keyword);
    const schemaPresence = checkSchemaPresence($);

    console.log('Analysis completed successfully');

    res.json({
      title,
      metaDescription,
      h1,
      headingAnalysis,
      keywordDensity,
      readabilityScore,
      internalLinks,
      externalLinks,
      slugAnalysis,
      openGraphTags,
      twitterTags,
      canonicalUrl,
      robotsMeta,
      breadcrumbs,
      keywordInIntroduction,
      schemaPresence
    });
  } catch (error) {
    console.error('Full error object:', error);
    handleError(error, res);
  }
});

function normalizeUrl(url) {
  try {
    // Remove leading/trailing whitespace and any surrounding quotes
    url = url.trim().replace(/^['"]|['"]$/g, '');

    // If the URL doesn't start with a protocol, add https://
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    const urlObj = new URL(url);

    // Check for valid protocol
    if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
      return { isValid: false, error: 'Invalid protocol. URL must use http:// or https://.', code: 'INVALID_PROTOCOL' };
    }

    // Check for local addresses
    if (urlObj.hostname === 'localhost' || urlObj.hostname.startsWith('127.') || urlObj.hostname === '[::1]') {
      return { isValid: false, error: 'Local addresses are not allowed. Please enter a public URL.', code: 'LOCAL_ADDRESS' };
    }

    // Check for valid hostname format
    if (!/^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/.test(urlObj.hostname)) {
      return { isValid: false, error: 'Invalid hostname format. Please check the URL.', code: 'INVALID_HOSTNAME' };
    }

    // Check for common typos in TLDs
    const commonTypos = {
      'com': ['con', 'cmo', 'cm', 'co'],
      'org': ['ogr', 'or', 'rg'],
      'net': ['nte', 'ne', 'et'],
      'edu': ['ed', 'eu'],
      'gov': ['go', 'gv']
    };

    const tld = urlObj.hostname.split('.').pop();
    for (const [correct, typos] of Object.entries(commonTypos)) {
      if (typos.includes(tld)) {
        return { isValid: false, error: `Did you mean .${correct} instead of .${tld}?`, code: 'TLD_TYPO' };
      }
    }

    // Normalize the URL
    return { isValid: true, url: urlObj.href };
  } catch (error) {
    console.error('URL normalization error:', error);
    return { isValid: false, error: 'Invalid URL format. Please check the URL.', code: 'INVALID_URL_FORMAT' };
  }
}

// ... (rest of the file remains unchanged)

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
