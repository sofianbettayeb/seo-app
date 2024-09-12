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
        ${generateImagesHTML(data.seo_images)}
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

function getTitleColorClass(value) {
    if (value < 20 || value > 75) return "poor"; // Red for too short or too long
    if (value >= 30 && value <= 60) return "good"; // Green for ideal length
    return "moderate"; // Orange for in-between lengths
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

    if (data.slug_analysis && data.slug_analysis.isReadable) score += 3;
    if (data.slug_analysis && data.slug_analysis.containsKeyword) score += 3;
    if (data.slug_analysis && data.slug_analysis.hasDashes && !data.slug_analysis.hasUnderscores) score += 2;
    if (data.slug_analysis && !data.slug_analysis.hasNumbers) score += 2;

    return Math.min(score, 100);
}

function generateOverallScoreHTML(data) {
    const overallScore = calculateOverallScore(data);
    const scoreClass = getColorClass(overallScore);

    return `
        <div class='seo-section overall-score ${scoreClass}'>
            <div class='analysis-result'>
                <div class='analysis-header'>
                    <span class='icon'>🎯</span>
                    <span class='title'>Overall SEO Score</span>
                </div>
                <div class='score-circle'>
                    <svg viewBox='0 0 36 36' class='circular-chart ${scoreClass}'>
                        <path class='circle-bg' d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'/>
                        <path class='circle' stroke-dasharray='${overallScore}, 100' d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'/>
                        <text x='18' y='18' class='percentage'>${overallScore}%</text>
                    </svg>
                </div>
                <div class='analysis-summary'>
                    This score is based on various SEO factors analyzed on your page.
                </div>
            </div>
        </div>
    `;
}

// Meta HTML + Meta SEO Section (including OG and Twitter Tags)
function generateMetaHTML(data) {
    const titleLength = data.title_analysis && data.title_analysis.length ? data.title_analysis.length : 0;
    const titleLengthClass = getTitleColorClass(titleLength);

    const metaDescLength = data.meta_description ? data.meta_description.length : 0;
    const metaDescLengthClass = getColorClass(metaDescLength, [120, 150, 160, 195]);

    const ogImageClass = data.open_graph_tags.length > 0 ? 'good' : 'poor';
    const twitterMetaTagsClass = data.twitter_tags.length > 0 ? 'good' : 'poor';

    const titleExplanation = "The ideal title length is between 30 and 60 characters.";
    const metaDescExplanation = "The ideal meta description length is between 150 and 160 characters.";

    const isPositive = titleLength > 0 && data.meta_description && data.open_graph_tags.length > 0;
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
                        <span>(${titleLength} characters)</span>
                        <small class="help-text">${titleExplanation}</small>
                    </p>
                    <p class="border-left ${metaDescLengthClass}">
                        <strong>Meta Description:</strong> ${data.meta_description || 'No meta description found'} 
                        <span>(${metaDescLength} characters)</span>
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
    let headingColorClass;
    let headingExplanation;

    if (type === 'H1' && headingData.count > 1) {
        headingColorClass = 'poor'; // Red border for more than 1 H1
        headingExplanation = 'Only one H1 should be present on a page.';
    } else {
        headingColorClass = getColorClass(headingData.withKeyword, [0, 1]); // Green if keyword present, otherwise red
        headingExplanation = headingData.withKeyword 
            ? `The keyword is present in ${type} headings.` 
            : `The keyword is missing in ${type} headings.`;
    }

    return `
        <p class="border-left ${headingColorClass}">
            <strong>${type} Headings:</strong> Count: ${headingData.count}, Keyword: ${headingData.withKeyword ? 'Yes' : 'No'}
            <small class="help-text">${headingExplanation}</small>
        </p>
    `;
}

// Content & Links Section (combined)
function getExternalLinkClass(externalLinks) {
    if (externalLinks < 5) return 'poor';
    if (externalLinks >= 5 && externalLinks <= 10) return 'good';
    if (externalLinks > 15) return 'excellent';
    return 'moderate'; // Default for any other case
}

function generateContentAndLinksHTML(data, keywordDensityInfo, readabilityInfo, internalLinksInfo, externalLinksInfo) {
    // Calculate readability score color class using the same function as overall score
    const readabilityScoreClass = getColorClass(data.readability_score);
    const externalLinkClass = getExternalLinkClass(data.external_links);

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
                    <p class="border-left ${keywordDensityInfo.colorClass}">
                        <strong>Keyword Density:</strong> ${data.keyword_density}% 
                        <small class="help-text">${keywordDensityInfo.explanation}</small>
                    </p>
                    <p class="border-left ${readabilityScoreClass}">
                        <strong>Readability Score:</strong> ${data.readability_score} 
                        <small class="help-text">${readabilityInfo.explanation}</small>
                    </p>
                    <p class="border-left ${internalLinksInfo.colorClass}">
                        <strong>Internal Links:</strong> ${data.internal_links} 
                        <small class="help-text">${internalLinksInfo.explanation}</small>
                    </p>
                    <p class="border-left ${externalLinkClass}">
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

    if (!slugAnalysis || !slugAnalysis.slug) {
        return ''; // Skip the slug analysis if no slug is found
    }

    const isSlugOptimized = slugAnalysis.isReadable && slugAnalysis.containsKeyword;
    const slugColorClass = getColorClass(isSlugOptimized ? 100 : 0, [50, 80]);

    const headerClass = isSlugOptimized ? 'positive' : 'negative';
    const headerIcon = isSlugOptimized ? '✔️' : '❌';
    const summaryText = isSlugOptimized
        ? 'The URL slug is readable and optimized.'
        : 'The URL slug needs improvement.';

    // Logic to check for hyphens and underscores
    const hasHyphens = slugAnalysis.hasDashes;
    const hasUnderscores = slugAnalysis.hasUnderscores;
    let hyphenStatus = "No";
    let hyphenHelpText = "Use hyphens (-) in slugs instead of underscores (_).";
    let hyphenClass = "poor"; // Default to red border and color

    // Update messages based on presence of hyphens or underscores
    if (!hasHyphens && !hasUnderscores) {
        hyphenStatus = "Neither hyphens nor underscores found";
        hyphenHelpText = "Use hyphens (-) in slugs to separate words.";
        hyphenClass = "neutral"; // Apply neutral class for no border and white text
    } else if (hasHyphens && !hasUnderscores) {
        hyphenStatus = "Yes";
        hyphenHelpText = "Hyphens are used correctly.";
        hyphenClass = "good"; // Green if hyphens are correctly used
    } else if (!hasHyphens && hasUnderscores) {
        hyphenStatus = "No";
        hyphenHelpText = "Use hyphens (-) instead of underscores (_).";
        hyphenClass = "poor"; // Red if underscores are present
    }

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
                    <p class="${hyphenClass}">
                        <strong>Uses Hyphens:</strong> ${hyphenStatus}
                        <small class="help-text">${hyphenHelpText}</small>
                    </p>
                    <p class="border-left ${!slugAnalysis.hasNumbers ? 'good' : 'poor'}">
                        <strong>Contains Numbers:</strong> ${slugAnalysis.hasNumbers ? 'Yes' : 'No'}
                        <small class="help-text">Avoid using numbers in slugs unless they are necessary.</small>
                    </p>
                    <a href="#" class="learn-more">Learn More</a>
                </div>
            </div>
        </div>
    `;
}

// Function to generate SEO Images HTML
function generateImagesHTML(images) {
    const issues = images.filter(img => !img.hasAlt || !img.webOptimized).length > 0;
    const headerClass = issues ? 'negative' : 'positive';
    const headerIcon = issues ? '❌' : '✔️';

    const imagesHTML = images.map(image => {
        const formatDisplay = image.webOptimized ? `${image.format} (web-optimized)` : image.format;
        const altTextDisplay = image.alt ? image.alt : 'No alt text';
        const altBorderClass = image.hasAlt ? 'good' : 'poor'; // Alt text border based on its presence
        const formatBorderClass = image.webOptimized ? 'good' : 'poor'; // Format border based on web optimization

        return `
            <p><strong>Image Source:</strong> ${image.src}</p>
            <p class="border-left ${altBorderClass}">
                <strong>Alt Text:</strong> ${altTextDisplay}
            </p>
            <p class="border-left ${formatBorderClass}">
                <strong>Format:</strong> ${formatDisplay}
            </p>
        `;
    }).join('');

    return `
        <div class="seo-section">
            <div class="analysis-result">
                <div class="analysis-header ${headerClass}">
                    <span class="icon">${headerIcon}</span>
                    <span class="title">SEO Images</span>
                    <button class="toggle-details">▼</button>
                </div>
                <div class="analysis-summary">
                    Checks if images have alt text and use web formats.
                </div>
                <div class="analysis-details hidden">
                    ${imagesHTML}
                    <a href="#" class="learn-more">Learn More</a>
                </div>
            </div>
        </div>
    `;
}

export { displayResults, generateOverallScoreHTML, calculateOverallScore };