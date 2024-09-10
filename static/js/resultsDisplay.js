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
        ${generateImageAnalysisHTML(data)}
    `;

    resultsContainer.innerHTML = resultsHTML;
    resultsContainer.style.display = 'none';
    setTimeout(() => {
        resultsContainer.style.display = 'block';
    }, 100);
}

// ... (keep all existing functions)

function generateImageAnalysisHTML(data) {
    const imageAnalysis = data.image_analysis;
    const altTextPercentage = (imageAnalysis.imagesWithAlt / imageAnalysis.totalImages * 100).toFixed(2);
    const keywordInAltPercentage = (imageAnalysis.imagesWithKeywordInAlt / imageAnalysis.totalImages * 100).toFixed(2);
    const keywordInFilenamePercentage = (imageAnalysis.imagesWithKeywordInFilename / imageAnalysis.totalImages * 100).toFixed(2);
    const largeImagesPercentage = (imageAnalysis.largeImages / imageAnalysis.totalImages * 100).toFixed(2);

    const totalFileSizeMB = (imageAnalysis.totalFileSize / (1024 * 1024)).toFixed(2);
    const averageFileSizeKB = (imageAnalysis.averageFileSize / 1024).toFixed(2);
    const averageLoadTimeMS = imageAnalysis.averageLoadTime.toFixed(2);

    const imageFormatsHTML = Object.entries(imageAnalysis.imageFormats)
        .map(([format, count]) => `<li>${format.toUpperCase()}: ${count}</li>`)
        .join('');

    return `
        <div class="seo-section">
            <h3>Image Analysis</h3>
            <div class="metric">
                <h4><i class="fas fa-images"></i> Total Images</h4>
                <p>${imageAnalysis.totalImages}</p>
                <small>The total number of images found on the page.</small>
            </div>
            <div class="metric">
                <h4><i class="fas fa-font"></i> Images with Alt Text</h4>
                <p>${imageAnalysis.imagesWithAlt} (${altTextPercentage}%)</p>
                <small>Alt text helps search engines understand image content and improves accessibility.</small>
            </div>
            <div class="metric">
                <h4><i class="fas fa-key"></i> Images with Keyword in Alt Text</h4>
                <p>${imageAnalysis.imagesWithKeywordInAlt} (${keywordInAltPercentage}%)</p>
                <small>Including the keyword in alt text can help with image SEO.</small>
            </div>
            <div class="metric">
                <h4><i class="fas fa-file-image"></i> Images with Keyword in Filename</h4>
                <p>${imageAnalysis.imagesWithKeywordInFilename} (${keywordInFilenamePercentage}%)</p>
                <small>Using keywords in image filenames can improve image search visibility.</small>
            </div>
            <div class="metric">
                <h4><i class="fas fa-expand"></i> Large Images (>100x100px)</h4>
                <p>${imageAnalysis.largeImages} (${largeImagesPercentage}%)</p>
                <small>Large images are more likely to be content-relevant. Ensure they are optimized for web.</small>
            </div>
            <div class="metric">
                <h4><i class="fas fa-compress"></i> Small Images (≤100x100px)</h4>
                <p>${imageAnalysis.smallImages}</p>
                <small>Small images might be icons or thumbnails. Ensure they are used appropriately.</small>
            </div>
            <div class="metric">
                <h4><i class="fas fa-weight"></i> Total Image Size</h4>
                <p>${totalFileSizeMB} MB</p>
                <small>The combined file size of all images on the page.</small>
            </div>
            <div class="metric">
                <h4><i class="fas fa-balance-scale"></i> Average Image Size</h4>
                <p>${averageFileSizeKB} KB</p>
                <small>The average file size of images on the page. Aim for smaller sizes to improve load times.</small>
            </div>
            <div class="metric">
                <h4><i class="fas fa-clock"></i> Average Load Time</h4>
                <p>${averageLoadTimeMS} ms</p>
                <small>The average time it takes to load an image. Lower is better for page speed.</small>
            </div>
            <div class="metric">
                <h4><i class="fas fa-file-image"></i> Image Formats</h4>
                <ul>
                    ${imageFormatsHTML}
                </ul>
                <small>The distribution of image formats used on the page. Modern formats like WebP can improve performance.</small>
            </div>
        </div>
    `;
}

export { displayResults };
