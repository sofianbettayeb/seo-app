const express = require('express');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'static')));

// Parse JSON bodies
app.use(express.json());

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

// Improved function to calculate readability score
function calculateReadabilityScore(text) {
  if (typeof text !== 'string' || text.trim().length === 0) {
    console.error('Invalid input: text must be a non-empty string');
    return 0;
  }

  const words = text.trim().split(/\s+/);
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  const syllables = words.reduce((count, word) => count + countSyllables(word), 0);

  if (words.length === 0 || sentences.length === 0) {
    console.error('Text contains no words or sentences');
    return 0;
  }

  const averageWordsPerSentence = words.length / sentences.length;
  const averageSyllablesPerWord = syllables / words.length;

  // Flesch-Kincaid Reading Ease score
  const score = 206.835 - (1.015 * averageWordsPerSentence) - (84.6 * averageSyllablesPerWord);

  console.log('Readability Score Calculation:');
  console.log('Total Words:', words.length);
  console.log('Total Sentences:', sentences.length);
  console.log('Total Syllables:', syllables);
  console.log('Average Words per Sentence:', averageWordsPerSentence.toFixed(2));
  console.log('Average Syllables per Word:', averageSyllablesPerWord.toFixed(2));
  console.log('Calculated Score:', score.toFixed(2));

  return Math.max(0, Math.min(100, score)); // Ensure score is between 0 and 100
}

// Improved function to count syllables
function countSyllables(word) {
  if (typeof word !== 'string' || word.trim().length === 0) {
    return 0;
  }

  word = word.toLowerCase().replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  
  // Specific common exceptions
  const commonWords = {
    'the': 1, 'she': 1, 'he': 1, 'me': 1, 'we': 1, 'be': 1,
    'tree': 1, 'flee': 1, 'knee': 1, 'being': 2, 'area': 3
  };
  
  if (commonWords.hasOwnProperty(word)) {
    return commonWords[word];
  }
  
  // Count vowel groups
  const syllableMatches = word.match(/[aeiouy]{1,2}/g);
  
  // Handle special cases
  let syllableCount = (syllableMatches && syllableMatches.length) || 0;
  if (word.length > 3 && syllableCount === 0) {
    syllableCount = 1;
  }
  
  // Handle words ending with 'le' or 'les'
  if (/le$/.test(word) || /les$/.test(word)) {
    syllableCount++;
  }
  
  // Handle words ending with 'es' or 'ed', but not 'les'
  if ((/es$/.test(word) || /ed$/.test(word)) && !/les$/.test(word)) {
    syllableCount = Math.max(1, syllableCount - 1);
  }
  
  // Handle words with 'io' and 'ia'
  if (/[io]a$/.test(word)) {
    syllableCount++;
  }
  
  return syllableCount;
}

// SEO analysis function
async function analyzeSEO(url, keyword) {
  try {
    // Add http:// prefix if it's missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'http://' + url;
    }

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
    const readabilityScore = calculateReadabilityScore(mainContent);

    // Log readability score and a sample of the text for verification
    console.log('Sample Text (first 200 characters):', mainContent.slice(0, 200));

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
