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

function generateTitleAnalysisHTML(data) {
    const titleColorClass = getColorClass(data.title_analysis.length, [30, 60]);
    const keywordColorClass = data.title_analysis.containsKeyword ? 'good' : 'poor';

    return `
        <div class="seo-section">
            <h3>Title Analysis</h3>
            <div class="metric">
                <h4><i class="fas fa-heading"></i> Title</h4>
                <p>${data.title}</p>
                <p class="${titleColorClass}">Length: ${data.title_analysis.length} characters</p>
                <p class="${keywordColorClass}">Contains Keyword: ${data.title_analysis.containsKeyword ? 'Yes' : 'No'}</p>
                ${data.title_analysis.containsKeyword ? `<p>Keyword Position: ${data.title_analysis.keywordPosition}</p>` : ''}
                <small>Ideal title length is between 50-60 characters. Include the main keyword near the beginning.</small>
            </div>
        </div>
    `;
}

function generateMetaDescriptionHTML(data) {
    const descriptionLength = data.meta_description ? data.meta_description.length : 0;
    const descriptionColorClass = getColorClass(descriptionLength, [50, 150]);

    return `
        <div class="seo-section">
            <h3>Meta Description</h3>
            <div class="metric">
                <h4><i class="fas fa-align-left"></i> Meta Description</h4>
                <p>${data.meta_description || 'No meta description found'}</p>
                <p class="${descriptionColorClass}">Length: ${descriptionLength} characters</p>
                <small>Ideal meta description length is between 150-160 characters.</small>
            </div>
        </div>
    `;
}

function generateHeadingAnalysisHTML(data) {
    const headingTypes = ['h1', 'h2', 'h3'];
    let headingHTML = '';

    headingTypes.forEach(type => {
        const headingData = data.heading_analysis[type];
        const headingColorClass = getColorClass(headingData.withKeyword, [0, 1]);

        headingHTML += `
            <div class="metric">
                <h4><i class="fas fa-heading"></i> ${type.toUpperCase()} Headings</h4>
                <p>Count: ${headingData.count}</p>
                <p class="${headingColorClass}">With Keyword: ${headingData.withKeyword}</p>
                <p>Average Length: ${headingData.averageLength.toFixed(2)} characters</p>
                <small>${type === 'h1' ? 'Use only one H1 tag per page.' : `Use ${type} tags to structure your content.`}</small>
            </div>
        `;
    });

    return `
        <div class="seo-section">
            <h3>Heading Analysis</h3>
            ${headingHTML}
        </div>
    `;
}

function generateContentAnalysisHTML(data, keywordDensityInfo, readabilityInfo) {
    return `
        <div class="seo-section">
            <h3>Content Analysis</h3>
            <div class="metric">
                <h4><i class="fas fa-file-alt"></i> Content Overview</h4>
                <p>Word Count: ${data.content_analysis.wordCount}</p>
                <p class="${keywordDensityInfo.colorClass}">Keyword Density: ${data.keyword_density}%</p>
                <small>${keywordDensityInfo.explanation}</small>
            </div>
            <div class="metric">
                <h4><i class="fas fa-book-reader"></i> Readability</h4>
                <p class="${readabilityInfo.colorClass}">Score: ${data.readability_score}</p>
                <small>${readabilityInfo.explanation}</small>
            </div>
        </div>
    `;
}

function generateLinkAnalysisHTML(data, internalLinksInfo, externalLinksInfo) {
    return `
        <div class="seo-section">
            <h3>Link Analysis</h3>
            <div class="metric">
                <h4><i class="fas fa-link"></i> Internal Links</h4>
                <p class="${internalLinksInfo.colorClass}">Count: ${data.internal_links}</p>
                <small>${internalLinksInfo.explanation}</small>
            </div>
            <div class="metric">
                <h4><i class="fas fa-external-link-alt"></i> External Links</h4>
                <p class="${externalLinksInfo.colorClass}">Count: ${data.external_links}</p>
                <small>${externalLinksInfo.explanation}</small>
            </div>
        </div>
    `;
}

function generateMetaSEOAnalysisHTML(data) {
    return `
        <div class="seo-section">
            <h3>Meta SEO Analysis</h3>
            ${generateOpenGraphTagsHTML(data.open_graph_tags)}
            ${generateTwitterTagsHTML(data.twitter_tags)}
            ${generateCanonicalURLHTML(data.canonical_url)}
            ${generateRobotsMetaHTML(data.robots_meta)}
        </div>
    `;
}

function generateOpenGraphTagsHTML(openGraphTags) {
    const tags = openGraphTags.map(tag => `<li>${tag.name}: ${tag.content}</li>`).join('');
    return `
        <div class="metric">
            <h4><i class="fab fa-facebook"></i> Open Graph Tags</h4>
            ${tags ? `<ul>${tags}</ul>` : '<p>No Open Graph tags found</p>'}
            <small>Open Graph tags help control how your content appears when shared on social media.</small>
        </div>
    `;
}

function generateTwitterTagsHTML(twitterTags) {
    const tags = twitterTags.map(tag => `<li>${tag.name}: ${tag.content}</li>`).join('');
    return `
        <div class="metric">
            <h4><i class="fab fa-twitter"></i> Twitter Cards</h4>
            ${tags ? `<ul>${tags}</ul>` : '<p>No Twitter Card tags found</p>'}
            <small>Twitter Card tags control how your content appears when shared on Twitter.</small>
        </div>
    `;
}

function generateCanonicalURLHTML(canonicalUrl) {
    return `
        <div class="metric">
            <h4><i class="fas fa-link"></i> Canonical URL</h4>
            <p>${canonicalUrl || 'No canonical URL found'}</p>
            <small>The canonical URL helps prevent duplicate content issues.</small>
        </div>
    `;
}

function generateRobotsMetaHTML(robotsMeta) {
    return `
        <div class="metric">
            <h4><i class="fas fa-robot"></i> Robots Meta Tag</h4>
            <p>${robotsMeta || 'No robots meta tag found'}</p>
            <small>The robots meta tag controls how search engines crawl and index your page.</small>
        </div>
    `;
}

function generateNewContentAnalysisHTML(data) {
    return `
        <div class="seo-section">
            <h3>Additional Content Analysis</h3>
            ${generateBreadcrumbsHTML(data.breadcrumbs)}
            ${generateKeywordInIntroductionHTML(data.keyword_in_introduction)}
            ${generateInternalLinksCountHTML(data.internal_links_count)}
            ${generateOutboundLinksCountHTML(data.outbound_links_count)}
            ${generateSchemaPresenceHTML(data.schema_presence)}
        </div>
    `;
}

function generateBreadcrumbsHTML(breadcrumbs) {
    const colorClass = breadcrumbs ? 'good' : 'poor';
    return `
        <div class="metric">
            <h4><i class="fas fa-bread-slice"></i> Breadcrumbs</h4>
            <p class="${colorClass}">${breadcrumbs ? 'Present' : 'Not found'}</p>
            <small>Breadcrumbs help users and search engines understand the site structure.</small>
        </div>
    `;
}

function generateKeywordInIntroductionHTML(keywordInIntro) {
    const colorClass = keywordInIntro ? 'good' : 'poor';
    return `
        <div class="metric">
            <h4><i class="fas fa-paragraph"></i> Keyword in Introduction</h4>
            <p class="${colorClass}">${keywordInIntro ? 'Present' : 'Not found'}</p>
            <small>Including the main keyword early in the content helps establish relevance.</small>
        </div>
    `;
}

function generateInternalLinksCountHTML(internalLinksCount) {
    const colorClass = getColorClass(internalLinksCount, [2, 5]);
    return `
        <div class="metric">
            <h4><i class="fas fa-project-diagram"></i> Internal Links Count</h4>
            <p class="${colorClass}">${internalLinksCount}</p>
            <small>Internal links help distribute page authority and guide users through your site.</small>
        </div>
    `;
}

function generateOutboundLinksCountHTML(outboundLinksCount) {
    const colorClass = getColorClass(outboundLinksCount, [1, 3]);
    return `
        <div class="metric">
            <h4><i class="fas fa-external-link-alt"></i> Outbound Links Count</h4>
            <p class="${colorClass}">${outboundLinksCount}</p>
            <small>Outbound links to authoritative sources can boost your content's credibility.</small>
        </div>
    `;
}

function generateSchemaPresenceHTML(schemaPresence) {
    const colorClass = schemaPresence ? 'good' : 'poor';
    return `
        <div class="metric">
            <h4><i class="fas fa-code"></i> Schema Markup</h4>
            <p class="${colorClass}">${schemaPresence ? 'Present' : 'Not found'}</p>
            <small>Schema markup helps search engines understand your content better.</small>
        </div>
    `;
}

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
