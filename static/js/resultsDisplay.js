import { getColorClass, getKeywordDensityInfo, getReadabilityInfo, getLinkCountInfo, getKeywordInfo } from './seoAnalysis.js';

function displayResults(data) {
    console.log('Entering displayResults function');
    console.log('Data received:', JSON.stringify(data, null, 2));

    const resultsContainer = document.getElementById('results');
    if (!data || data.error) {
        resultsContainer.innerHTML = `<div class="error"><i class="fas fa-exclamation-circle"></i> ${data?.error || 'An unknown error occurred'}</div>`;
        return;
    }

    try {
        let resultsHTML = `
            <h2>SEO Analysis Results</h2>
            ${generateTitleAnalysisHTML(data)}
            ${generateContentAnalysisHTML(data)}
            ${generateHeadingAnalysisHTML(data)}
            ${generateLinkAnalysisHTML(data)}
            ${generateKeywordOptimizationHTML(data)}
            ${generateMetaSeoHTML(data)}
            ${generateImageAnalysisHTML(data)}
        `;

        resultsContainer.innerHTML = resultsHTML;
        resultsContainer.style.display = 'none';
        setTimeout(() => {
            resultsContainer.style.display = 'block';
        }, 100);
    } catch (error) {
        console.error('Error in displayResults:', error);
        resultsContainer.innerHTML = `<div class="error"><i class="fas fa-exclamation-circle"></i> An error occurred while displaying results: ${error.message}</div>`;
    }
}

function generateTitleAnalysisHTML(data) {
    console.log('Entering generateTitleAnalysisHTML function');
    console.log('Data received:', JSON.stringify(data, null, 2));

    if (!data || !data.title_analysis) {
        console.log('No title analysis data found');
        return '<div class="error">No title analysis data available</div>';
    }

    const titleAnalysis = data.title_analysis;
    console.log('Title analysis:', titleAnalysis);

    let titleLengthClass = 'moderate';
    let keywordPositionClass = 'moderate';

    try {
        if (typeof getColorClass !== 'function') {
            console.error('getColorClass is not a function');
            return '<div class="error">Error: getColorClass is not a function</div>';
        }

        if (titleAnalysis.length !== undefined) {
            titleLengthClass = getColorClass(titleAnalysis.length, [30, 60]) || 'moderate';
            console.log('Title length class:', titleLengthClass);
        } else {
            console.log('Title length is undefined');
        }

        if (titleAnalysis.keywordPosition !== undefined) {
            keywordPositionClass = getColorClass(titleAnalysis.keywordPosition, [1, 5]) || 'moderate';
            console.log('Keyword position class:', keywordPositionClass);
        } else {
            console.log('Keyword position is undefined');
        }
    } catch (error) {
        console.error('Error in getColorClass:', error);
        return '<div class="error">Error in color class calculation: ' + error.message + '</div>';
    }

    return `
        <div class="seo-section">
            <h3>Title Analysis</h3>
            <div class="metric">
                <h4><i class="fas fa-heading"></i> Title Length</h4>
                <p class="${titleLengthClass}">${titleAnalysis.length !== undefined ? `${titleAnalysis.length} characters` : 'N/A'}</p>
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
    if (length === undefined) return 'Unable to determine title length.';
    if (length < 30) return 'The title is too short. Aim for 50-60 characters for optimal visibility in search results.';
    if (length > 60) return 'The title is too long. Consider shortening it to 50-60 characters for better visibility in search results.';
    return 'The title length is good. It will display well in search results.';
}

function getKeywordPositionExplanation(position) {
    if (position === undefined) return 'Unable to determine keyword position.';
    if (position === 0) return 'The keyword is not present in the title. Consider including it for better SEO.';
    if (position <= 5) return 'Great! The keyword is near the beginning of the title, which is optimal for SEO.';
    return 'The keyword is present in the title, but consider moving it closer to the beginning for better SEO impact.';
}

// ... (rest of the code remains unchanged)

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
