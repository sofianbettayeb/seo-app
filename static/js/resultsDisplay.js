import { getColorClass, getKeywordDensityInfo, getReadabilityInfo, getLinkCountInfo, getKeywordInfo } from './seoAnalysis.js';

function calculateOverallScore(data) {
    // Implementation details...
}

function getOverallScoreInfo(score) {
    // Implementation details...
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
        ${generateImageAnalysisHTML(data)}
    `;

    resultsContainer.innerHTML = resultsHTML;
    resultsContainer.style.display = 'none';
    setTimeout(() => {
        resultsContainer.style.display = 'block';
    }, 100);
}

function generateTitleAnalysisHTML(data) {
    const titleAnalysis = data.title_analysis;
    const titleLengthClass = getColorClass(titleAnalysis.length, [30, 60]);
    const keywordPositionClass = getColorClass(titleAnalysis.keywordPosition, [1, 5]);

    return `
        <div class="seo-section">
            <h3>Title Analysis</h3>
            <div class="metric">
                <h4><i class="fas fa-heading"></i> Title Length</h4>
                <p class="${titleLengthClass}">${titleAnalysis.length} characters</p>
                <small>${getTitleLengthExplanation(titleAnalysis.length)}</small>
            </div>
            <div class="metric">
                <h4><i class="fas fa-key"></i> Keyword in Title</h4>
                <p class="${titleAnalysis.containsKeyword ? 'good' : 'poor'}">${titleAnalysis.containsKeyword ? 'Yes' : 'No'}</p>
                <small>${titleAnalysis.containsKeyword ? 'Great! The keyword is present in the title.' : 'Consider including the keyword in the title for better SEO.'}</small>
            </div>
            <div class="metric">
                <h4><i class="fas fa-map-pin"></i> Keyword Position</h4>
                <p class="${keywordPositionClass}">${titleAnalysis.keywordPosition > 0 ? `Position ${titleAnalysis.keywordPosition}` : 'N/A'}</p>
                <small>${getKeywordPositionExplanation(titleAnalysis.keywordPosition)}</small>
            </div>
        </div>
    `;
}

function getTitleLengthExplanation(length) {
    if (length < 30) return 'The title is too short. Aim for 50-60 characters for optimal visibility in search results.';
    if (length > 60) return 'The title is too long. Consider shortening it to 50-60 characters for better visibility in search results.';
    return 'The title length is good. It will display well in search results.';
}

function getKeywordPositionExplanation(position) {
    if (position === 0) return 'The keyword is not present in the title. Consider including it for better SEO.';
    if (position <= 5) return 'Great! The keyword is near the beginning of the title, which is optimal for SEO.';
    return 'The keyword is present in the title, but consider moving it closer to the beginning for better SEO impact.';
}

function generateContentAnalysisHTML(data, keywordDensityInfo, readabilityInfo) {
    // Implementation details...
}

function generateHeadingAnalysisHTML(data) {
    // Implementation details...
}

function generateLinkAnalysisHTML(data, internalLinksInfo, externalLinksInfo) {
    // Implementation details...
}

function generateKeywordOptimizationHTML(data, keywordInUrlInfo, keywordInTitleInfo, keywordInH1Info, keywordInH2Info, keywordInH3Info) {
    // Implementation details...
}

function generateMetaSeoHTML(data) {
    // Implementation details...
}

function generateImageAnalysisHTML(data) {
    // Implementation details...
}

export { 
    displayResults, 
    generateTitleAnalysisHTML, 
    generateContentAnalysisHTML, 
    generateHeadingAnalysisHTML, 
    generateLinkAnalysisHTML, 
    generateKeywordOptimizationHTML, 
    generateMetaSeoHTML, 
    generateImageAnalysisHTML 
};
