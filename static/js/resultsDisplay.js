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
        ${generateTitleHierarchyHTML(data.title_hierarchy_analysis)}
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


// Function to generate Title Hierarchy HTML
function generateTitleHierarchyHTML(hierarchyAnalysis) {
    const { headings, hierarchyIssues } = hierarchyAnalysis;
    const issueClass = hierarchyIssues.length > 0 ? 'negative' : 'positive';
    const issueIcon = hierarchyIssues.length > 0 ? '❌' : '✔️';

    let issuesHTML = '';

    // If there are issues with the hierarchy, display them
    if (hierarchyIssues.length > 0) {
        issuesHTML = `
            <div class="analysis-issues">
                ${hierarchyIssues.map(issue => `
                    <p class="border-left poor">
                        <strong>Issue:</strong> ${issue.message}
                        <br><em>Problem with: ${issue.text}</em>
                    </p>
                `).join('')}
            </div>
        `;
    }

    // Generate HTML for heading tags
    const headingsHTML = headings.map(heading => `
        <p class="border-left good">
            <strong>${heading.tag.toUpperCase()}:</strong> ${heading.text}
        </p>
    `).join('');

    return `
        <div class="seo-section">
            <div class="analysis-result">
                <div class="analysis-header ${issueClass}">
                    <span class="icon">${issueIcon}</span>
                    <span class="title">Title Hierarchy</span>
                    <button class="toggle-details">▼</button>
                </div>
                <div class="analysis-summary">
                    Checks for correct sequence of heading tags.
                </div>
                <div class="analysis-details hidden">
                    ${issuesHTML}
                    <div class="analysis-headings">
                        ${headingsHTML}
                    </div>
                    <a href="#" class="learn-more">Learn More</a>
                </div>
            </div>
        </div>
    `;
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
    // Determine if the content and links are optimized (positive or negative header)
    const isContentOptimized = data.keyword_density > 0 && data.readability_score >= 60 && data.internal_links > 0 && data.external_links > 0;
    const headerClass = isContentOptimized ? 'positive' : 'negative';
    const headerIcon = isContentOptimized ? '✔️' : '❌';
    const summaryText = isContentOptimized 
        ? "Content and links are properly optimized with keyword density and readability." 
        : "Content or links are not properly optimized.";

    return `
        <div class="seo-section">
            <div class="analysis-result">
                <div class="analysis-header ${headerClass}">
                    <span class="icon">${headerIcon}</span>
                    <span class="title">Content & Links</span>
                    <button class="toggle-details">▼</button>
                </div>
                <div class="analysis-summary">
                    ${summaryText}
                </div>
                <div class="analysis-details hidden">
                    <p class="border-left ${keywordDensityInfo.colorClass}">
                        <strong>Keyword Density:</strong> ${data.keyword_density}% 
                        <small class="help-text">${keywordDensityInfo.explanation}</small>
                    </p>
                    <p class="border-left ${readabilityInfo.colorClass}">
                        <strong>Readability Score:</strong> ${data.readability_score} 
                        <small class="help-text">${readabilityInfo.explanation}</small>
                    </p>
                    <p class="border-left ${internalLinksInfo.colorClass}">
                        <strong>Internal Links:</strong> ${data.internal_links} 
                        <small class="help-text">${internalLinksInfo.explanation}</small>
                    </p>
                    <p class="border-left ${externalLinksInfo.colorClass}">
                        <strong>External Links:</strong> ${data.external_links} 
                        <small class="help-text">${externalLinksInfo.explanation}</small>
                    </p>
                    <a href="#" class="learn-more">Learn More</a>
                </div>
            </div>
        </div>
    `;
}

// Breadcrumbs Section
function generateBreadcrumbsHTML(data) {
    const isBreadcrumbsPresent = !!data.breadcrumbs;  // Ensure it's a boolean value
    const colorClass = isBreadcrumbsPresent ? 'good' : 'poor';
    const headerClass = isBreadcrumbsPresent ? 'positive' : 'negative';
    const headerIcon = isBreadcrumbsPresent ? '✔️' : '❌';
    const summaryText = isBreadcrumbsPresent 
        ? 'Breadcrumbs are properly implemented.' 
        : 'Breadcrumbs are missing.';

    return `
        <div class="seo-section">
            <div class="analysis-result">
                <div class="analysis-header ${headerClass}">
                    <span class="icon">${headerIcon}</span>
                    <span class="title">Breadcrumbs</span>
                    <button class="toggle-details">▼</button>
                </div>
                <div class="analysis-summary">
                    ${summaryText}
                </div>
                <div class="analysis-details hidden">
                    <p class="border-left ${colorClass}">
                        <strong>Breadcrumbs:</strong> ${isBreadcrumbsPresent ? 'Present' : 'Not Found'}
                        <small class="help-text">
                            Breadcrumbs help users and search engines navigate your site structure effectively.
                        </small>
                    </p>
                    <a href="#" class="learn-more">Learn More</a>
                </div>
            </div>
        </div>
    `;
}

// Slug Analysis Section
function generateSlugAnalysisHTML(data) {
    const slugAnalysis = data.slug_analysis;
    const isSlugOptimized = slugAnalysis.isReadable && slugAnalysis.containsKeyword;
    const slugColorClass = getColorClass(isSlugOptimized ? 100 : 0, [50, 80]);

    const headerClass = isSlugOptimized ? 'positive' : 'negative';
    const headerIcon = isSlugOptimized ? '✔️' : '❌';
    const summaryText = isSlugOptimized
        ? 'The URL slug is readable and optimized.'
        : 'The URL slug needs improvement.';

    return `
        <div class="seo-section">
            <div class="analysis-result">
                <div class="analysis-header ${headerClass}">
                    <span class="icon">${headerIcon}</span>
                    <span class="title">Slug Analysis</span>
                    <button class="toggle-details">▼</button>
                </div>
                <div class="analysis-summary">
                    ${summaryText}
                </div>
                <div class="analysis-details hidden">
                    <p class="border-left ${slugColorClass}">
                        <strong>Slug:</strong> ${slugAnalysis.slug || 'No slug found'}
                    </p>
                    <p class="border-left ${slugAnalysis.containsKeyword ? 'good' : 'poor'}">
                        <strong>Contains Keyword:</strong> ${slugAnalysis.containsKeyword ? 'Yes' : 'No'}
                        <small class="help-text">The slug should contain the main keyword for better optimization.</small>
                    </p>
                    <p class="border-left ${slugAnalysis.isReadable ? 'good' : 'poor'}">
                        <strong>Readable:</strong> ${slugAnalysis.isReadable ? 'Yes' : 'No'}
                        <small class="help-text">A readable slug is short, simple, and easy to understand.</small>
                    </p>
                    <p class="border-left ${slugAnalysis.hasDashes ? 'good' : 'poor'}">
                        <strong>Uses Hyphens:</strong> ${slugAnalysis.hasDashes ? 'Yes' : 'No'}
                        <small class="help-text">Use hyphens (-) in slugs instead of underscores (_).</small>
                    </p>
                    <p class="border-left ${!slugAnalysis.hasNumbers ? 'good' : 'poor'}">
                        <strong>Don't Contains Numbers:</strong> ${slugAnalysis.hasNumbers ? 'No' : 'Yes'}
                        <small class="help-text">Avoid using numbers in slugs unless they are necessary.</small>
                    </p>
                    <a href="#" class="learn-more">Learn More</a>
                </div>
            </div>
        </div>
    `;
}

export { displayResults, generateOverallScoreHTML, calculateOverallScore };