import { getColorClass, getKeywordDensityInfo, getReadabilityInfo, getLinkCountInfo, getKeywordInfo } from './seoAnalysis.js';

function calculateOverallScore(data) {
    let score = 0;
    if (data.keyword_density >= 1 && data.keyword_density <= 3) score += 15;
    if (data.readability_score >= 60) score += 15;
    if (data.internal_links > 0) score += 10;
    if (data.external_links > 0) score += 10;
    if (data.keyword_in_url) score += 10;
    if (data.keyword_in_headings > 0) score += 10;
    if (data.meta_description) score += 10;
    if (data.open_graph_tags.length > 0) score += 10;
    if (data.twitter_tags.length > 0) score += 5;
    if (data.canonical_url) score += 5;
    return score;
}

function getOverallScoreInfo(score) {
    const colorClass = getColorClass(score, [50, 80]);
    let explanation = '';
    if (score < 50) explanation = 'Poor SEO. Significant improvements needed.';
    else if (score < 80) explanation = 'Moderate SEO. Some improvements can be made.';
    else explanation = 'Good SEO. Keep up the good work!';
    return { colorClass, explanation };
}

function displayResults(data) {
    const resultsContainer = document.getElementById('results');
    if (data.error) {
        resultsContainer.innerHTML = `<div class="error"><i class="fas fa-exclamation-circle"></i> ${data.error}</div>`;
        return;
    }

    const overallScore = calculateOverallScore(data);
    const overallScoreInfo = getOverallScoreInfo(overallScore);
    const keywordDensityInfo = getKeywordDensityInfo(data.keyword_density);
    const readabilityInfo = getReadabilityInfo(data.readability_score);
    const internalLinksInfo = getLinkCountInfo(data.internal_links, true);
    const externalLinksInfo = getLinkCountInfo(data.external_links, false);
    const keywordInUrlInfo = getKeywordInfo(data.keyword_in_url, 'URL');
    const keywordInHeadingsInfo = getKeywordInfo(data.keyword_in_headings > 0, 'headings');

    let resultsHTML = `
        <h2>SEO Analysis Results</h2>
        <div class="overall-score ${overallScoreInfo.colorClass}">
            <h3>${overallScore}%</h3>
            <p>Overall SEO Score</p>
            <p>${overallScoreInfo.explanation}</p>
        </div>
        <div class="metric">
            <h3><i class="fas fa-heading"></i> Title</h3>
            <p>${data.title}</p>
            <small>A good title should be 50-60 characters long and include your main keyword.</small>
        </div>
        <div class="metric">
            <h3><i class="fas fa-align-left"></i> Meta Description</h3>
            <p>${data.meta_description}</p>
            <small>A good meta description should be 150-160 characters long and include your main keyword.</small>
        </div>
        <div class="metric">
            <h3><i class="fas fa-percentage"></i> Keyword Density: <span class="${keywordDensityInfo.colorClass}">${data.keyword_density}%</span></h3>
            <p>${keywordDensityInfo.explanation}</p>
            <small>Keyword density is the percentage of times a keyword appears on a web page compared to the total number of words on the page.</small>
        </div>
        <div class="metric">
            <h3><i class="fas fa-book-reader"></i> Readability Score: <span class="${readabilityInfo.colorClass}">${data.readability_score}</span></h3>
            <p>${readabilityInfo.explanation}</p>
            <small>The readability score indicates how easy it is for people to read your content. A higher score means easier to read.</small>
        </div>
        <div class="metric">
            <h3><i class="fas fa-link"></i> Internal Links: <span class="${internalLinksInfo.colorClass}">${data.internal_links}</span></h3>
            <p>${internalLinksInfo.explanation}</p>
            <small>Internal links help search engines understand the structure of your site and distribute page authority.</small>
        </div>
        <div class="metric">
            <h3><i class="fas fa-external-link-alt"></i> External Links: <span class="${externalLinksInfo.colorClass}">${data.external_links}</span></h3>
            <p>${externalLinksInfo.explanation}</p>
            <small>External links to reputable sources can improve your site's credibility and SEO.</small>
        </div>
        <div class="metric">
            <h3><i class="fas fa-link"></i> Keyword in URL: <span class="${keywordInUrlInfo.colorClass}">${data.keyword_in_url ? 'Yes' : 'No'}</span></h3>
            <p>${keywordInUrlInfo.explanation}</p>
            <small>Having your keyword in the URL can help with SEO, but don't force it if it doesn't fit naturally.</small>
        </div>
        <div class="metric">
            <h3><i class="fas fa-heading"></i> Keyword in Headings: <span class="${keywordInHeadingsInfo.colorClass}">${data.keyword_in_headings}</span></h3>
            <p>${keywordInHeadingsInfo.explanation}</p>
            <small>Using your keyword in headings helps search engines understand the structure and topic of your content.</small>
        </div>
        <div class="metric">
            <h3><i class="fas fa-h1"></i> H1 Tags:</h3>
            <ul>
                ${data.h1_tags.map(tag => `<li>${tag}</li>`).join('')}
            </ul>
            <small>H1 tags are crucial for SEO and user experience. Each page should have a unique H1 that accurately describes the page's content.</small>
        </div>
        <div class="metric">
            <h3><i class="fas fa-share-alt"></i> Open Graph Tags</h3>
            <ul>
                ${data.open_graph_tags.map(tag => `<li><strong>${tag.name}:</strong> ${tag.content}</li>`).join('')}
            </ul>
            <small>Open Graph tags help control how your content appears when shared on social media platforms.</small>
        </div>
        <div class="metric">
            <h3><i class="fab fa-twitter"></i> Twitter Cards</h3>
            <ul>
                ${data.twitter_tags.map(tag => `<li><strong>${tag.name}:</strong> ${tag.content}</li>`).join('')}
            </ul>
            <small>Twitter Card tags help control how your content appears when shared on Twitter.</small>
        </div>
        <div class="metric">
            <h3><i class="fas fa-link"></i> Canonical URL</h3>
            <p>${data.canonical_url || 'Not set'}</p>
            <small>The canonical URL helps prevent duplicate content issues by specifying the preferred version of a web page.</small>
        </div>
        <div class="metric">
            <h3><i class="fas fa-robot"></i> Robots Meta Tag</h3>
            <p>${data.robots_meta || 'Not set'}</p>
            <small>The robots meta tag tells search engines how to crawl or index a page.</small>
        </div>
    `;

    resultsContainer.innerHTML = resultsHTML;
    resultsContainer.style.display = 'none';
    setTimeout(() => {
        resultsContainer.style.display = 'block';
    }, 100);
}

export { displayResults };
