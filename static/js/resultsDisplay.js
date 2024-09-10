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
    `;
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
    return Math.min(score, 100);
}

function generateTitleAnalysisHTML(data) {
    const titleInfo = getKeywordInfo(data.keyword_in_title, 'title');
    return `
        <div class="seo-section">
            <h3>Title Analysis</h3>
            <div class="metric">
                <h4><i class="fas fa-heading"></i> Title</h4>
                <p>${data.title}</p>
                <p class="${titleInfo.colorClass}">Keyword in title: ${titleInfo.explanation}</p>
                <p>Length: ${data.title_analysis.length} characters</p>
                <small>Ideal title length is between 50-60 characters.</small>
            </div>
        </div>
    `;
}

function generateMetaDescriptionHTML(data) {
    return `
        <div class="seo-section">
            <h3>Meta Description</h3>
            <div class="metric">
                <h4><i class="fas fa-align-left"></i> Meta Description</h4>
                <p>${data.meta_description || 'No meta description found.'}</p>
                <p>Length: ${(data.meta_description || '').length} characters</p>
                <small>Ideal meta description length is between 150-160 characters.</small>
            </div>
        </div>
    `;
}

function generateHeadingAnalysisHTML(data) {
    return `
        <div class="seo-section">
            <h3>Heading Analysis</h3>
            ${generateHeadingTypeHTML('H1', data.heading_analysis.h1)}
            ${generateHeadingTypeHTML('H2', data.heading_analysis.h2)}
            ${generateHeadingTypeHTML('H3', data.heading_analysis.h3)}
        </div>
    `;
}

function generateHeadingTypeHTML(type, headingData) {
    return `
        <div class="metric">
            <h4><i class="fas fa-heading"></i> ${type} Tags</h4>
            <p>Count: ${headingData.count}</p>
            <p>With Keyword: ${headingData.withKeyword}</p>
            <p>Average Length: ${headingData.averageLength.toFixed(2)} characters</p>
            <small>${type === 'H1' ? 'Ideal to have one H1 tag with the keyword.' : `${type} tags help structure your content.`}</small>
        </div>
    `;
}

function generateContentAnalysisHTML(data, keywordDensityInfo, readabilityInfo) {
    const contentAnalysis = data.content_analysis;
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
            <div class="metric">
                <h4><i class="fas fa-file-alt"></i> Content Overview</h4>
                <p>Word Count: ${contentAnalysis.wordCount}</p>
                <p>Sentence Count: ${contentAnalysis.sentenceCount}</p>
                <p>Paragraph Count: ${contentAnalysis.paragraphCount}</p>
                <p>Average Words per Sentence: ${contentAnalysis.avgWordsPerSentence}</p>
                <p>Average Paragraph Length: ${contentAnalysis.avgParagraphLength} words</p>
                <small>These metrics provide an overview of your content structure.</small>
            </div>
        </div>
    `;
}

function generateLinkAnalysisHTML(data, internalLinksInfo, externalLinksInfo) {
    return `
        <div class="seo-section">
            <h3>Link Analysis</h3>
            <div class="metric">
                <h4><i class="fas fa-link"></i> Internal Links: <span class="${internalLinksInfo.colorClass}">${data.internal_links}</span></h4>
                <p>${internalLinksInfo.explanation}</p>
                <small>Internal links help in website navigation and distribute page authority throughout your site.</small>
            </div>
            <div class="metric">
                <h4><i class="fas fa-external-link-alt"></i> External Links: <span class="${externalLinksInfo.colorClass}">${data.external_links}</span></h4>
                <p>${externalLinksInfo.explanation}</p>
                <small>External links to authoritative sources can boost your page's credibility and SEO.</small>
            </div>
        </div>
    `;
}

function generateMetaSEOAnalysisHTML(data) {
    return `
        <div class="seo-section">
            <h3>Meta SEO Analysis</h3>
            ${generateMetaTagsHTML('Open Graph Tags', data.open_graph_tags)}
            ${generateMetaTagsHTML('Twitter Cards', data.twitter_tags)}
            ${generateCanonicalUrlHTML(data.canonical_url)}
            ${generateRobotsMetaHTML(data.robots_meta)}
        </div>
    `;
}

function generateMetaTagsHTML(title, tags) {
    return `
        <div class="metric">
            <h4><i class="fas fa-tags"></i> ${title}</h4>
            ${tags.length > 0 ? 
                `<ul>${tags.map(tag => `<li>${tag.name}: ${tag.content}</li>`).join('')}</ul>` :
                `<p>No ${title} found.</p>`
            }
            <small>${title} help control how your page appears when shared on social media.</small>
        </div>
    `;
}

function generateCanonicalUrlHTML(canonicalUrl) {
    return `
        <div class="metric">
            <h4><i class="fas fa-link"></i> Canonical URL</h4>
            <p>${canonicalUrl || 'No canonical URL found.'}</p>
            <small>Canonical URL helps prevent duplicate content issues.</small>
        </div>
    `;
}

function generateRobotsMetaHTML(robotsMeta) {
    return `
        <div class="metric">
            <h4><i class="fas fa-robot"></i> Robots Meta Tag</h4>
            <p>${robotsMeta || 'No robots meta tag found.'}</p>
            <small>Robots meta tag controls how search engines crawl and index your page.</small>
        </div>
    `;
}

function generateNewContentAnalysisHTML(data) {
    return `
        <div class="seo-section">
            <h3>Additional Content Analysis</h3>
            <div class="metric">
                <h4><i class="fas fa-sitemap"></i> Breadcrumbs</h4>
                <p class="${data.breadcrumbs ? 'good' : 'poor'}">
                    ${data.breadcrumbs ? 'Present' : 'Not found'}
                </p>
                <small>Breadcrumbs help users navigate your site and improve SEO.</small>
            </div>
            <div class="metric">
                <h4><i class="fas fa-paragraph"></i> Keyword in Introduction</h4>
                <p class="${data.keyword_in_introduction ? 'good' : 'poor'}">
                    ${data.keyword_in_introduction ? 'Present' : 'Not found'}
                </p>
                <small>Including the keyword in the introduction helps establish relevance early.</small>
            </div>
            <div class="metric">
                <h4><i class="fas fa-link"></i> Internal Links</h4>
                <p class="${getColorClass(data.internal_links_count, [3, 5])}">
                    Count: ${data.internal_links_count}
                </p>
                <small>Aim for at least 3-5 internal links to improve site structure and user navigation.</small>
            </div>
            <div class="metric">
                <h4><i class="fas fa-external-link-alt"></i> Outbound Links</h4>
                <p class="${getColorClass(data.outbound_links_count, [3, 5])}">
                    Count: ${data.outbound_links_count}
                </p>
                <small>Aim for at least 3 outbound links to authoritative sources to boost credibility.</small>
            </div>
            <div class="metric">
                <h4><i class="fas fa-code"></i> Schema Markup</h4>
                <p class="${data.schema_presence ? 'good' : 'poor'}">
                    ${data.schema_presence ? 'Present' : 'Not found'}
                </p>
                <small>Schema markup helps search engines understand your content better.</small>
            </div>
        </div>
    `;
}

export { displayResults, generateOverallScoreHTML, calculateOverallScore };
