import { getColorClass, getKeywordDensityInfo, getReadabilityInfo, getLinkCountInfo, getKeywordInfo } from './seoAnalysis.js';

function displayResults(data) {
    const resultsContainer = document.getElementById('results');
    const keywordDensityInfo = getKeywordDensityInfo(data.keyword_density);
    const readabilityInfo = getReadabilityInfo(data.readability_score);
    const internalLinksInfo = getLinkCountInfo(data.internal_links, true);
    const externalLinksInfo = getLinkCountInfo(data.external_links, false);

    resultsContainer.innerHTML = `
        ${generateOverallScoreHTML(data)}
        ${generateMetaHTML(data)}
        ${generateTitleAndHeadingsHTML(data)}
        ${generateContentAndLinksHTML(data, keywordDensityInfo, readabilityInfo, internalLinksInfo, externalLinksInfo)}
        ${generateBreadcrumbsHTML(data)}
        ${generateSlugAnalysisHTML(data)}
    `;

    // Initialize collapsible sections
    initCollapsibleSections();
}

// Initialize collapsible sections for toggling details
function initCollapsibleSections() {
    document.querySelectorAll('.toggle-details').forEach(button => {
        button.addEventListener('click', () => {
            const details = button.closest('.analysis-result').querySelector('.analysis-details');
            details.classList.toggle('hidden');
            button.classList.toggle('open');
        });
    });
}

// Function to calculate the overall SEO score
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
    const scoreClass = overallScore >= 50 ? 'positive' : 'negative'; // Green if score >= 50, else Red

    return `
        <div class="seo-section overall-score ${getColorClass(overallScore, [50, 80])}">
            <div class="analysis-result">
                <div class="analysis-header ${scoreClass}">
                    <span class="icon">${overallScore >= 50 ? '✔️' : '❌'}</span>
                    <span class="title">Overall SEO Score is: ${overallScore}/100</span>
                    <button class="toggle-details">▼</button>
                </div>
                <div class="analysis-summary">
                    This score is based on various SEO factors analyzed on your page.
                </div>
                <div class="analysis-details hidden">
                    <p>Your overall SEO score is <strong>${overallScore}/100</strong>. It reflects the optimization level of key factors such as meta information, readability, links, and more.</p>
                    <a href="#" class="learn-more">Learn More</a>
                </div>
            </div>
        </div>
    `;
}



// Meta HTML + Meta SEO Section (including OG and Twitter Tags)
function generateMetaHTML(data) {
    // Updated ranges for title length and meta description length
    const titleLengthClass = getColorClass(data.title_analysis.length, [20, 30, 60, 75]);
    const metaDescLengthClass = getColorClass(data.meta_description ? data.meta_description.length : 0, [120, 150, 160, 195]);

    const ogImageClass = data.open_graph_tags.length > 0 ? 'good' : 'poor';
    const twitterMetaTagsClass = data.twitter_tags.length > 0 ? 'good' : 'poor';

    const titleExplanation = "The ideal title length is between 30 and 60 characters.";
    const metaDescExplanation = "The ideal meta description length is between 150 and 160 characters.";

    // Conditional logic for positive or negative header
    const isPositive = data.title_analysis.length > 0 && data.meta_description && data.open_graph_tags.length > 0;
    const headerClass = isPositive ? 'positive' : 'negative';
    const headerIcon = isPositive ? '✔️' : '❌';

    return `
        <div class="seo-section">
            <div class="analysis-result">
                <div class="analysis-header ${headerClass}">
                    <span class="icon">${headerIcon}</span>
                    <span class="title">Meta HTML & SEO</span>
                    <button class="toggle-details">▼</button>
                </div>
                <div class="analysis-summary">
                    Meta tags like title, description, OG, and Twitter tags are correctly optimized.
                </div>
                <div class="analysis-details hidden">
                    <p class="border-left ${titleLengthClass}">
                        <strong>Title:</strong> ${data.title} 
                        <span>(${data.title_analysis.length} characters)</span>
                        <small class="help-text">${titleExplanation}</small>
                    </p>
                    <p class="border-left ${metaDescLengthClass}">
                        <strong>Meta Description:</strong> ${data.meta_description || 'No meta description found'} 
                        <span>(${data.meta_description ? data.meta_description.length : 0} characters)</span>
                        <small class="help-text">${metaDescExplanation}</small>
                    </p>
                    <p class="border-left ${ogImageClass}">
                        <strong>OG Image:</strong> ${data.open_graph_tags.length > 0 ? 'Present' : 'Not found'}
                        <small class="help-text">Open Graph image is important for social media sharing.</small>
                    </p>
                    <p class="border-left ${twitterMetaTagsClass}">
                        <strong>Twitter Meta Tags:</strong> ${data.twitter_tags.length > 0 ? 'Present' : 'Not found'}
                        <small class="help-text">Twitter meta tags help ensure proper display when shared on Twitter.</small>
                    </p>
                    <a href="#" class="learn-more">Learn More</a>
                </div>
            </div>
        </div>
    `;
}


// Titles & Headings Section (combined)
function generateTitleAndHeadingsHTML(data) {
    const keywordColorClass = data.title_analysis.containsKeyword ? 'good' : 'poor';
    const isPositive = data.title_analysis.containsKeyword;
    const headerClass = isPositive ? 'positive' : 'negative';
    const headerIcon = isPositive ? '✔️' : '❌';

    const keywordExplanation = isPositive
        ? "Your title and headings are optimized with the keyword."
        : "The keyword is missing from the title or headings.";

    return `
        <div class="seo-section">
            <div class="analysis-result">
                <div class="analysis-header ${headerClass}">
                    <span class="icon">${headerIcon}</span>
                    <span class="title">Titles & Headings</span>
                    <button class="toggle-details">▼</button>
                </div>
                <div class="analysis-summary">
                    ${keywordExplanation}
                </div>
                <div class="analysis-details hidden">
                    <p class="border-left ${keywordColorClass}">
                        <strong>Page Title (H1):</strong> ${data.title}
                        <span>Contains Keyword: ${data.title_analysis.containsKeyword ? 'Yes' : 'No'}</span>
                    </p>
                    ${generateHeadingsForType(data.heading_analysis.h1, 'H1')}
                    ${generateHeadingsForType(data.heading_analysis.h2, 'H2')}
                    ${generateHeadingsForType(data.heading_analysis.h3, 'H3')}
                    <a href="#" class="learn-more">Learn More</a>
                </div>
            </div>
        </div>
    `;
}

// Helper function to generate headings (H1, H2, H3)
function generateHeadingsForType(headingData, type) {
    const headingColorClass = getColorClass(headingData.withKeyword, [0, 1]); // Green if keyword present, otherwise red
    const headingExplanation = headingData.withKeyword 
        ? `The keyword is present in ${type} headings.` 
        : `The keyword is missing in ${type} headings.`;

    return `
        <p class="border-left ${headingColorClass}">
            <strong>${type} Headings:</strong> Count: ${headingData.count}, Keyword: ${headingData.withKeyword ? 'Yes' : 'No'}
            <small class="help-text">${headingExplanation}</small>
        </p>
    `;
}

// Content & Links Section (combined)
function generateContentAndLinksHTML(data, keywordDensityInfo, readabilityInfo, internalLinksInfo, externalLinksInfo) {
    return `
        <div class="seo-section">
            <div class="analysis-result">
                <div class="analysis-header positive">
                    <span class="icon">✔️</span>
                    <span class="title">Content & Links</span>
                    <button class="toggle-details">▼</button>
                </div>
                <div class="analysis-summary">
                    Content and links are properly optimized with keyword density and readability.
                </div>
                <div class="analysis-details hidden">
                    <p>Keyword Density: ${data.keyword_density}% (${keywordDensityInfo.explanation})</p>
                    <p>Readability Score: ${data.readability_score} (${readabilityInfo.explanation})</p>
                    <p>Internal Links: ${data.internal_links} (${internalLinksInfo.explanation})</p>
                    <p>External Links: ${data.external_links} (${externalLinksInfo.explanation})</p>
                    <a href="#" class="learn-more">Learn More</a>
                </div>
            </div>
        </div>
    `;
}

// Breadcrumbs Section
function generateBreadcrumbsHTML(data) {
    const colorClass = data.breadcrumbs ? 'good' : 'poor';
    return `
        <div class="seo-section">
            <div class="analysis-result">
                <div class="analysis-header ${data.breadcrumbs ? 'positive' : 'negative'}">
                    <span class="icon">${data.breadcrumbs ? '✔️' : '❌'}</span>
                    <span class="title">Breadcrumbs</span>
                    <button class="toggle-details">▼</button>
                </div>
                <div class="analysis-summary">
                    ${data.breadcrumbs ? 'Breadcrumbs are properly implemented.' : 'Breadcrumbs are missing.'}
                </div>
                <div class="analysis-details hidden">
                    <p>Breadcrumbs help users and search engines navigate your site structure effectively.</p>
                    <a href="#" class="learn-more">Learn More</a>
                </div>
            </div>
        </div>
    `;
}

// Slug Analysis Section
function generateSlugAnalysisHTML(data) {
    const slugAnalysis = data.slug_analysis;
    const slugColorClass = getColorClass(slugAnalysis.isReadable && slugAnalysis.containsKeyword ? 100 : 0, [50, 80]);

    return `
        <div class="seo-section">
            <div class="analysis-result">
                <div class="analysis-header ${slugAnalysis.isReadable && slugAnalysis.containsKeyword ? 'positive' : 'negative'}">
                    <span class="icon">${slugAnalysis.isReadable && slugAnalysis.containsKeyword ? '✔️' : '❌'}</span>
                    <span class="title">Slug Analysis</span>
                    <button class="toggle-details">▼</button>
                </div>
                <div class="analysis-summary">
                    ${slugAnalysis.isReadable ? 'The URL slug is readable and optimized.' : 'The URL slug needs improvement.'}
                </div>
                <div class="analysis-details hidden">
                    <p>Slug: ${slugAnalysis.slug || 'No slug found'}</p>
                    <p>Contains Keyword: ${slugAnalysis.containsKeyword ? 'Yes' : 'No'}</p>
                    <p>Readable: ${slugAnalysis.isReadable ? 'Yes' : 'No'}</p>
                    <p>Uses Hyphens: ${slugAnalysis.hasDashes ? 'Yes' : 'No'}</p>
                    <p>Contains Numbers: ${slugAnalysis.hasNumbers ? 'Yes' : 'No'}</p>
                    <a href="#" class="learn-more">Learn More</a>
                </div>
            </div>
        </div>
    `;
}

export { displayResults, generateOverallScoreHTML, calculateOverallScore };