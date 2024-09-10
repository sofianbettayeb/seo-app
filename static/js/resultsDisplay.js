import { getColorClass, getKeywordDensityInfo, getReadabilityInfo, getLinkCountInfo, getKeywordInfo } from './seoAnalysis.js';

function calculateOverallScore(data) {
    let score = 0;
    if (data.keyword_density >= 1 && data.keyword_density <= 3) score += 15;
    if (data.readability_score >= 60) score += 15;
    if (data.internal_links > 0) score += 10;
    if (data.external_links > 0) score += 10;
    if (data.keyword_in_url) score += 10;
    if (data.keyword_in_title) score += 10;
    if (data.keyword_in_headings.h1 > 0) score += 10;
    if (data.keyword_in_headings.h2 > 0) score += 5;
    if (data.keyword_in_headings.h3 > 0) score += 5;
    if (data.meta_description) score += 10;
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
    const keywordInTitleInfo = getKeywordInfo(data.keyword_in_title, 'title');
    const keywordInH1Info = getKeywordInfo(data.keyword_in_headings.h1 > 0, 'H1');
    const keywordInH2Info = getKeywordInfo(data.keyword_in_headings.h2 > 0, 'H2');
    const keywordInH3Info = getKeywordInfo(data.keyword_in_headings.h3 > 0, 'H3');

    let resultsHTML = `
        <h2>SEO Analysis Results</h2>
        <div class="overall-score ${overallScoreInfo.colorClass}">
            <h3>${overallScore}%</h3>
            <p>Overall SEO Score</p>
            <p>${overallScoreInfo.explanation}</p>
        </div>
        ${generateTitleAnalysisHTML(data)}
        ${generateContentAnalysisHTML(data, keywordDensityInfo, readabilityInfo)}
        ${generateHeadingAnalysisHTML(data)}
        ${generateLinkAnalysisHTML(data, internalLinksInfo, externalLinksInfo)}
        ${generateKeywordOptimizationHTML(data, keywordInUrlInfo, keywordInTitleInfo, keywordInH1Info, keywordInH2Info, keywordInH3Info)}
        ${generateMetaSeoHTML(data)}
    `;

    resultsContainer.innerHTML = resultsHTML;
    resultsContainer.style.display = 'none';
    setTimeout(() => {
        resultsContainer.style.display = 'block';
    }, 100);
}

function generateTitleAnalysisHTML(data) {
    const titleLengthClass = getColorClass(data.title_analysis.length, [30, 60]);
    const keywordPositionClass = getColorClass(data.title_analysis.keywordPosition, [1, 5]);
    return `
        <div class="seo-section">
            <h3>Title Analysis</h3>
            <div class="metric">
                <h4><i class="fas fa-heading"></i> Title</h4>
                <p>${data.title}</p>
                <small>A good title should be 50-60 characters long and include your main keyword.</small>
            </div>
            <div class="metric">
                <h4><i class="fas fa-text-width"></i> Title Length: <span class="${titleLengthClass}">${data.title_analysis.length} characters</span></h4>
                <p>${getTitleLengthExplanation(data.title_analysis.length)}</p>
            </div>
            <div class="metric">
                <h4><i class="fas fa-key"></i> Keyword in Title: <span class="${data.title_analysis.containsKeyword ? 'good' : 'poor'}">${data.title_analysis.containsKeyword ? 'Yes' : 'No'}</span></h4>
                <p>${data.title_analysis.containsKeyword ? 'Great! Your keyword is in the title.' : 'Consider including your keyword in the title.'}</p>
            </div>
            ${data.title_analysis.containsKeyword ? `
                <div class="metric">
                    <h4><i class="fas fa-map-pin"></i> Keyword Position: <span class="${keywordPositionClass}">${data.title_analysis.keywordPosition}</span></h4>
                    <p>${getKeywordPositionExplanation(data.title_analysis.keywordPosition)}</p>
                </div>
            ` : ''}
        </div>
    `;
}

function getTitleLengthExplanation(length) {
    if (length < 30) return 'Your title is too short. Consider making it longer for better SEO.';
    if (length > 60) return 'Your title is too long. Try to keep it under 60 characters for optimal display in search results.';
    return 'Great! Your title length is optimal for SEO.';
}

function getKeywordPositionExplanation(position) {
    if (position === 1) return 'Excellent! Your keyword is at the beginning of the title, which is ideal for SEO.';
    if (position <= 5) return 'Good job! Your keyword is near the beginning of the title, which is good for SEO.';
    return 'Consider moving your keyword closer to the beginning of the title for better SEO impact.';
}

function generateContentAnalysisHTML(data, keywordDensityInfo, readabilityInfo) {
    return `
        <div class="seo-section">
            <h3>Content Analysis</h3>
            <div class="metric">
                <h4><i class="fas fa-percentage"></i> Keyword Density: <span class="${keywordDensityInfo.colorClass}">${data.keyword_density}%</span></h4>
                <p>${keywordDensityInfo.explanation}</p>
                <small>Keyword density is the percentage of times a keyword appears on a web page compared to the total number of words on the page.</small>
            </div>
            <div class="metric">
                <h4><i class="fas fa-book-reader"></i> Readability Score: <span class="${readabilityInfo.colorClass}">${data.readability_score}</span></h4>
                <p>${readabilityInfo.explanation}</p>
                <small>The readability score indicates how easy it is for people to read your content. A higher score means easier to read.</small>
            </div>
        </div>
    `;
}

function generateHeadingAnalysisHTML(data) {
    return `
        <div class="seo-section">
            <h3>Heading Analysis</h3>
            ${generateHeadingTypeAnalysis(data.heading_analysis.h1, 'H1')}
            ${generateHeadingTypeAnalysis(data.heading_analysis.h2, 'H2')}
            ${generateHeadingTypeAnalysis(data.heading_analysis.h3, 'H3')}
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
    let explanation = '';
    if (headingType === 'H1') {
        explanation = headingData.count === 1 ? 'Good! You have one H1 tag, which is ideal.' : 'Consider using only one H1 tag per page for better structure.';
    } else {
        explanation = headingData.count > 0 ? `Good use of ${headingType} tags for content structure.` : `Consider using ${headingType} tags to better organize your content.`;
    }
    explanation += headingData.withKeyword > 0 ? ` Great job including your keyword in ${headingType} tags!` : ` Try to include your keyword in some ${headingType} tags.`;
    return explanation;
}

function generateLinkAnalysisHTML(data, internalLinksInfo, externalLinksInfo) {
    return `
        <div class="seo-section">
            <h3>Link Analysis</h3>
            <div class="metric">
                <h4><i class="fas fa-link"></i> Internal Links: <span class="${internalLinksInfo.colorClass}">${data.internal_links}</span></h4>
                <p>${internalLinksInfo.explanation}</p>
                <small>Internal links help search engines understand the structure of your site and distribute page authority.</small>
            </div>
            <div class="metric">
                <h4><i class="fas fa-external-link-alt"></i> External Links: <span class="${externalLinksInfo.colorClass}">${data.external_links}</span></h4>
                <p>${externalLinksInfo.explanation}</p>
                <small>External links to reputable sources can improve your site's credibility and SEO.</small>
            </div>
        </div>
    `;
}

function generateKeywordOptimizationHTML(data, keywordInUrlInfo, keywordInTitleInfo, keywordInH1Info, keywordInH2Info, keywordInH3Info) {
    return `
        <div class="seo-section">
            <h3>Keyword Optimization</h3>
            <div class="metric">
                <h4><i class="fas fa-link"></i> Keyword in URL: <span class="${keywordInUrlInfo.colorClass}">${data.keyword_in_url ? 'Yes' : 'No'}</span></h4>
                <p>${keywordInUrlInfo.explanation}</p>
                <small>Having your keyword in the URL can help with SEO, but don't force it if it doesn't fit naturally.</small>
            </div>
            <div class="metric">
                <h4><i class="fas fa-heading"></i> Keyword in Title: <span class="${keywordInTitleInfo.colorClass}">${data.keyword_in_title ? 'Yes' : 'No'}</span></h4>
                <p>${keywordInTitleInfo.explanation}</p>
                <small>Including your keyword in the title tag is crucial for SEO as it helps search engines understand what your page is about.</small>
            </div>
            <div class="metric">
                <h4><i class="fas fa-h1"></i> Keyword in H1: <span class="${keywordInH1Info.colorClass}">${data.keyword_in_headings.h1}</span></h4>
                <p>${keywordInH1Info.explanation}</p>
                <small>Using your keyword in the H1 tag reinforces the topic of your page to search engines and users.</small>
            </div>
            <div class="metric">
                <h4><i class="fas fa-h2"></i> Keyword in H2: <span class="${keywordInH2Info.colorClass}">${data.keyword_in_headings.h2}</span></h4>
                <p>${keywordInH2Info.explanation}</p>
                <small>Including your keyword in H2 tags can help with topical relevance and content structure.</small>
            </div>
            <div class="metric">
                <h4><i class="fas fa-h3"></i> Keyword in H3: <span class="${keywordInH3Info.colorClass}">${data.keyword_in_headings.h3}</span></h4>
                <p>${keywordInH3Info.explanation}</p>
                <small>Using your keyword in H3 tags can further reinforce the topic of your content.</small>
            </div>
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

function generateMetaDescriptionHTML(data) {
    return `
        <div class="metric">
            <h4><i class="fas fa-align-left"></i> Meta Description</h4>
            <p>${data.meta_description || 'Not set'}</p>
            <small>A good meta description should be 150-160 characters long and include your main keyword.</small>
        </div>
    `;
}

function generateOpenGraphHTML(data) {
    return `
        <div class="metric">
            <h4><i class="fas fa-share-alt"></i> Open Graph Tags</h4>
            ${data.open_graph_tags.length > 0 ? `
                <ul>
                    ${data.open_graph_tags.map(tag => `<li><strong>${tag.name}:</strong> ${tag.content}</li>`).join('')}
                </ul>
            ` : '<p>No Open Graph tags found.</p>'}
            <small>Open Graph tags help control how your content appears when shared on social media platforms.</small>
        </div>
    `;
}

function generateTwitterCardsHTML(data) {
    return `
        <div class="metric">
            <h4><i class="fab fa-twitter"></i> Twitter Cards</h4>
            ${data.twitter_tags.length > 0 ? `
                <ul>
                    ${data.twitter_tags.map(tag => `<li><strong>${tag.name}:</strong> ${tag.content}</li>`).join('')}
                </ul>
            ` : '<p>No Twitter Card tags found.</p>'}
            <small>Twitter Card tags help control how your content appears when shared on Twitter.</small>
        </div>
    `;
}

function generateCanonicalURLHTML(data) {
    return `
        <div class="metric">
            <h4><i class="fas fa-link"></i> Canonical URL</h4>
            <p>${data.canonical_url || 'Not set'}</p>
            <small>The canonical URL helps prevent duplicate content issues by specifying the preferred version of a web page.</small>
        </div>
    `;
}

function generateRobotsMetaHTML(data) {
    return `
        <div class="metric">
            <h4><i class="fas fa-robot"></i> Robots Meta Tag</h4>
            <p>${data.robots_meta || 'Not set'}</p>
            <small>The robots meta tag tells search engines how to crawl or index a page.</small>
        </div>
    `;
}

export { displayResults };
