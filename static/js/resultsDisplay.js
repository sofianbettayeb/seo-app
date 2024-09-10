import { getColorClass, getKeywordDensityInfo, getReadabilityInfo, getLinkCountInfo, getKeywordInfo } from './seoAnalysis.js';

// Helper to generate a metric section
function generateMetric(title, icon, value, explanation, smallText = '') {
    return `
        <div class="metric">
            <h4><i class="${icon}"></i> ${title}: <span>${value}</span></h4>
            <p>${explanation}</p>
            ${smallText ? `<small>${smallText}</small>` : ''}
        </div>
    `;
}

function calculateOverallScore(data) {
    const scoreConfig = [
        { condition: data.keyword_density >= 1 && data.keyword_density <= 3, points: 15 },
        { condition: data.readability_score >= 60, points: 15 },
        { condition: data.internal_links > 0, points: 10 },
        { condition: data.external_links > 0, points: 10 },
        { condition: data.keyword_in_url, points: 10 },
        { condition: data.keyword_in_title, points: 10 },
        { condition: data.keyword_in_headings.h1 > 0, points: 10 },
        { condition: data.keyword_in_headings.h2 > 0, points: 5 },
        { condition: data.keyword_in_headings.h3 > 0, points: 5 },
        { condition: data.meta_description, points: 10 }
    ];
    return scoreConfig.reduce((total, { condition, points }) => total + (condition ? points : 0), 0);
}

function getOverallScoreInfo(score) {
    const colorClass = getColorClass(score, [50, 80]);
    const explanation = score < 50
        ? 'Poor SEO. Significant improvements needed.'
        : score < 80
            ? 'Moderate SEO. Some improvements can be made.'
            : 'Good SEO. Keep up the good work!';
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

    const sectionsHTML = [
        generateTitleAnalysisHTML(data),
        generateContentAnalysisHTML(data),
        generateHeadingAnalysisHTML(data),
        generateLinkAnalysisHTML(data),
        generateKeywordOptimizationHTML(data),
        generateMetaSeoHTML(data)
    ].join('');

    resultsContainer.innerHTML = `
        <h2>SEO Analysis Results</h2>
        <div class="overall-score ${overallScoreInfo.colorClass}">
            <h3>${overallScore}%</h3>
            <p>Overall SEO Score</p>
            <p>${overallScoreInfo.explanation}</p>
        </div>
        ${sectionsHTML}
    `;
    toggleResultsDisplay(resultsContainer);
}

function toggleResultsDisplay(container) {
    container.style.display = 'none';
    setTimeout(() => {
        container.style.display = 'block';
    }, 100);
}

function generateTitleAnalysisHTML(data) {
    const { length, containsKeyword, keywordPosition } = data.title_analysis;
    const titleLengthClass = getColorClass(length, [30, 60]);
    const keywordPositionClass = getColorClass(keywordPosition, [1, 5]);

    return `
        <div class="seo-section">
            <h3>Title Analysis</h3>
            ${generateMetric('Title', 'fas fa-heading', data.title, 'A good title should be 50-60 characters long and include your main keyword.')}
            ${generateMetric('Title Length', 'fas fa-text-width', `${length} characters`, getTitleLengthExplanation(length), '50-60 characters is optimal')}
            ${generateMetric('Keyword in Title', 'fas fa-key', containsKeyword ? 'Yes' : 'No', containsKeyword ? 'Great! Your keyword is in the title.' : 'Consider including your keyword in the title.')}
            ${containsKeyword ? generateMetric('Keyword Position', 'fas fa-map-pin', keywordPosition, getKeywordPositionExplanation(keywordPosition)) : ''}
        </div>
    `;
}

function getTitleLengthExplanation(length) {
    return length < 30
        ? 'Your title is too short. Consider making it longer for better SEO.'
        : length > 60
            ? 'Your title is too long. Try to keep it under 60 characters for optimal display in search results.'
            : 'Great! Your title length is optimal for SEO.';
}

function getKeywordPositionExplanation(position) {
    return position === 1
        ? 'Excellent! Your keyword is at the beginning of the title, which is ideal for SEO.'
        : position <= 5
            ? 'Good job! Your keyword is near the beginning of the title, which is good for SEO.'
            : 'Consider moving your keyword closer to the beginning of the title for better SEO impact.';
}

function generateContentAnalysisHTML(data) {
    const keywordDensityInfo = getKeywordDensityInfo(data.keyword_density);
    const readabilityInfo = getReadabilityInfo(data.readability_score);

    return `
        <div class="seo-section">
            <h3>Content Analysis</h3>
            ${generateMetric('Keyword Density', 'fas fa-percentage', `${data.keyword_density}%`, keywordDensityInfo.explanation, 'Keyword density is the percentage of times a keyword appears on a web page compared to the total number of words.')}
            ${generateMetric('Readability Score', 'fas fa-book-reader', data.readability_score, readabilityInfo.explanation, 'A higher score means easier to read content.')}
        </div>
    `;
}

function generateHeadingAnalysisHTML(data) {
    return `
        <div class="seo-section">
            <h3>Heading Analysis</h3>
            ${['h1', 'h2', 'h3'].map(tag => generateHeadingTypeAnalysis(data.heading_analysis[tag], tag.toUpperCase())).join('')}
        </div>
    `;
}

function generateHeadingTypeAnalysis(headingData, headingType) {
    const headingCountClass = getColorClass(headingData.count, headingType === 'H1' ? [1, 1] : [1, 5]);
    const keywordUsageClass = getColorClass(headingData.withKeyword, [1, 2]);

    return `
        <div class="metric">
            <h4><i class="fas fa-${headingType.toLowerCase()}"></i> ${headingType} Tags</h4>
            <p>Count: <span class="${headingCountClass}">${headingData.count}</span></p>
            <p>With Keyword: <span class="${keywordUsageClass}">${headingData.withKeyword}</span></p>
            <p>Average Length: ${headingData.averageLength.toFixed(2)} characters</p>
            <ul>
                ${headingData.list.map(tag => `<li>${tag}</li>`).join('')}
            </ul>
            <small>${getHeadingExplanation(headingType, headingData)}</small>
        </div>
    `;
}

function getHeadingExplanation(headingType, headingData) {
    const countExplanation = headingType === 'H1'
        ? headingData.count === 1 ? 'Good! You have one H1 tag, which is ideal.' : 'Consider using only one H1 tag per page.'
        : headingData.count > 0 ? `Good use of ${headingType} tags.` : `Consider using ${headingType} tags to organize content.`;

    const keywordExplanation = headingData.withKeyword > 0 ? ` Great job including your keyword in ${headingType} tags!` : ` Try to include your keyword in some ${headingType} tags.`;

    return countExplanation + keywordExplanation;
}

function generateLinkAnalysisHTML(data) {
    const internalLinksInfo = getLinkCountInfo(data.internal_links, true);
    const externalLinksInfo = getLinkCountInfo(data.external_links, false);

    return `
        <div class="seo-section">
            <h3>Link Analysis</h3>
            ${generateMetric('Internal Links', 'fas fa-link', data.internal_links, internalLinksInfo.explanation, 'Internal links help search engines understand site structure.')}
            ${generateMetric('External Links', 'fas fa-external-link-alt', data.external_links, externalLinksInfo.explanation, 'External links to reputable sources can improve credibility and SEO.')}
        </div>
    `;
}

function generateKeywordOptimizationHTML(data) {
    const keywordInUrlInfo = getKeywordInfo(data.keyword_in_url, 'URL');
    const keywordInTitleInfo = getKeywordInfo(data.keyword_in_title, 'Title');
    const keywordInH1Info = getKeywordInfo(data.keyword_in_headings.h1 > 0, 'H1');
    const keywordInH2Info = getKeywordInfo(data.keyword_in_headings.h2 > 0, 'H2');
    const keywordInH3Info = getKeywordInfo(data.keyword_in_headings.h3 > 0, 'H3');

    return `
        <div class="seo-section">
            <h3>Keyword Optimization</h3>
            ${generateMetric('Keyword in URL', 'fas fa-link', data.keyword_in_url ? 'Yes' : 'No', keywordInUrlInfo.explanation, 'Having your keyword in the URL can help with SEO.')}
            ${generateMetric('Keyword in Title', 'fas fa-heading', data.keyword_in_title ? 'Yes' : 'No', keywordInTitleInfo.explanation, 'Including the keyword in the title tag is crucial for SEO.')}
            ${generateMetric('Keyword in H1', 'fas fa-h1', data.keyword_in_headings.h1, keywordInH1Info.explanation)}
            ${generateMetric('Keyword in H2', 'fas fa-h2', data.keyword_in_headings.h2, keywordInH2Info.explanation)}
            ${generateMetric('Keyword in H3', 'fas fa-h3', data.keyword_in_headings.h3, keywordInH3Info.explanation)}
        </div>
    `;
}

function generateMetaSeoHTML(data) {
    return `
        <div class="seo-section">
            <h3>Meta SEO</h3>
            ${generateMetaDescriptionHTML(data)}
            ${generateOpenGraphHTML(data)}
            ${generateTwitterCardsHTML(data)}
            ${generateCanonicalURLHTML(data)}
            ${generateRobotsMetaHTML(data)}
        </div>
    `;
}

// Functions to generate individual meta tags
function generateMetaDescriptionHTML(data) {
    return generateMetric('Meta Description', 'fas fa-align-left', data.meta_description || 'Not set', 'A good meta description should be 150-160 characters long and include your main keyword.');
}

function generateOpenGraphHTML(data) {
    return `
        <div class="metric">
            <h4><i class="fas fa-share-alt"></i> Open Graph Tags</h4>
            ${data.open_graph_tags.length > 0 ? `<ul>${data.open_graph_tags.map(tag => `<li><strong>${tag.name}:</strong> ${tag.content}</li>`).join('')}</ul>` : '<p>No Open Graph tags found.</p>'}
            <small>Open Graph tags help control how your content appears when shared on social media.</small>
        </div>
    `;
}

function generateTwitterCardsHTML(data) {
    return `
        <div class="metric">
            <h4><i class="fab fa-twitter"></i> Twitter Cards</h4>
            ${data.twitter_tags.length > 0 ? `<ul>${data.twitter_tags.map(tag => `<li><strong>${tag.name}:</strong> ${tag.content}</li>`).join('')}</ul>` : '<p>No Twitter Card tags found.</p>'}
            <small>Twitter Card tags help control how your content appears when shared on Twitter.</small>
        </div>
    `;
}

function generateCanonicalURLHTML(data) {
    return generateMetric('Canonical URL', 'fas fa-link', data.canonical_url || 'Not set', 'The canonical URL helps prevent duplicate content issues.');
}

function generateRobotsMetaHTML(data) {
    return generateMetric('Robots Meta Tag', 'fas fa-robot', data.robots_meta || 'Not set', 'The robots meta tag tells search engines how to crawl or index a page.');
}

export { displayResults };