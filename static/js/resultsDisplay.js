import { getColorClass, getKeywordDensityInfo, getReadabilityInfo, getLinkCountInfo, getKeywordInfo } from './seoAnalysis.js';

function displayResults(data) {
    const resultsContainer = document.getElementById('results');
    const keywordDensityInfo = getKeywordDensityInfo(data.keyword_density);
    const readabilityInfo = getReadabilityInfo(data.readability_score);
    const internalLinksInfo = getLinkCountInfo(data.internal_links, true);
    const externalLinksInfo = getLinkCountInfo(data.external_links, false);

    resultsContainer.innerHTML = `
        ${generateOverallScoreHTML(data)}
        ${generateTitleAnalysisHTML(data)}
        ${generateMetaDescriptionHTML(data)}
        ${generateHeadingAnalysisHTML(data)}
        ${generateContentAnalysisHTML(data, keywordDensityInfo, readabilityInfo)}
        ${generateLinkAnalysisHTML(data, internalLinksInfo, externalLinksInfo)}
        ${generateMetaSEOAnalysisHTML(data)}
        ${generateNewContentAnalysisHTML(data)}
        ${generateSlugAnalysisHTML(data)}
    `;
}

function calculateOverallScore(data) {
    let score = 0;
    if (data.keyword_in_title) score += 10;
    if (data.keyword_in_url) score += 5;
    if (data.keyword_in_headings.h1 > 0) score += 10;
    if (data.keyword_density >= 1 && data.keyword_density <= 3) score += 15;
    if (data.readability_score > 60) score += 15;
    if (data.internal_links > 0) score += 10;
    if (data.external_links > 0) score += 5;
    if (data.meta_description) score += 10;
    if (data.breadcrumbs) score += 5;
    if (data.keyword_in_introduction) score += 5;
    if (data.internal_links_count >= 3) score += 5;
    if (data.outbound_links_count >= 3) score += 5;

    // Add slug analysis to the overall score
    if (data.slug_analysis.isReadable) score += 3;
    if (data.slug_analysis.containsKeyword) score += 3;
    if (data.slug_analysis.hasDashes && !data.slug_analysis.hasUnderscores) score += 2;
    if (!data.slug_analysis.hasNumbers) score += 2;

    return Math.min(score, 100);
}

function generateOverallScoreHTML(data) {
    const overallScore = calculateOverallScore(data);
    return `
        <div class="seo-section overall-score ${getColorClass(overallScore, [50, 80])}">
            <h3>Overall SEO Score</h3>
            <div class="score">${overallScore}/100</div>
            <p>This score is based on various SEO factors analyzed on your page.</p>
        </div>
    `;
}

// ... (keep all other existing functions)

function generateSlugAnalysisHTML(data) {
    const slugAnalysis = data.slug_analysis;
    const slugColorClass = getColorClass(slugAnalysis.isReadable && slugAnalysis.containsKeyword ? 100 : 0, [50, 80]);

    return `
        <div class="seo-section">
            <h3>Slug Analysis</h3>
            <div class="metric">
                <h4><i class="fas fa-link"></i> URL Slug</h4>
                <p>Slug: ${slugAnalysis.slug || 'No slug found'}</p>
                <p>Length: ${slugAnalysis.length} characters</p>
                <p class="${slugAnalysis.containsKeyword ? 'good' : 'poor'}">
                    Contains Keyword: ${slugAnalysis.containsKeyword ? 'Yes' : 'No'}
                </p>
                <p class="${slugAnalysis.isReadable ? 'good' : 'poor'}">
                    Readable: ${slugAnalysis.isReadable ? 'Yes' : 'No'}
                </p>
                <p class="${slugAnalysis.hasDashes ? 'good' : 'moderate'}">
                    Uses Hyphens: ${slugAnalysis.hasDashes ? 'Yes' : 'No'}
                </p>
                <p class="${slugAnalysis.hasUnderscores ? 'poor' : 'good'}">
                    Uses Underscores: ${slugAnalysis.hasUnderscores ? 'Yes' : 'No'}
                </p>
                <p class="${slugAnalysis.hasNumbers ? 'moderate' : 'good'}">
                    Contains Numbers: ${slugAnalysis.hasNumbers ? 'Yes' : 'No'}
                </p>
                <p class="${slugColorClass}">Recommendation: ${slugAnalysis.recommendation}</p>
                <small>A well-optimized slug is short, readable, and contains the main keyword.</small>
            </div>
        </div>
    `;
}

export { displayResults, generateOverallScoreHTML, calculateOverallScore };
