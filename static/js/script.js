document.addEventListener('DOMContentLoaded', () => {
    const analyzeBtn = document.getElementById('analyze-btn');
    const urlInput = document.getElementById('url');
    const keywordInput = document.getElementById('keyword');
    const resultsContainer = document.getElementById('results');

    analyzeBtn.addEventListener('click', async () => {
        const url = urlInput.value.trim();
        const keyword = keywordInput.value.trim();

        if (!url || !keyword) {
            showError('Please enter both URL and keyword.');
            return;
        }

        try {
            showLoading();
            const response = await axios.post('/analyze', { url, keyword });
            displayResults(response.data);
        } catch (error) {
            showError('An error occurred while analyzing the URL.');
            console.error('Error:', error);
        }
    });

    function showLoading() {
        resultsContainer.innerHTML = '<p>Analyzing... Please wait.</p>';
    }

    function showError(message) {
        resultsContainer.innerHTML = `<p class="error">${message}</p>`;
    }

    function getColorClass(value, thresholds) {
        if (value < thresholds[0]) return 'poor';
        if (value < thresholds[1]) return 'moderate';
        return 'good';
    }

    function getKeywordDensityInfo(density) {
        const colorClass = getColorClass(density, [1, 2.5]);
        let explanation = '';
        if (density < 1) explanation = 'Too low. Consider increasing keyword usage.';
        else if (density > 3) explanation = 'Too high. Consider reducing keyword usage to avoid keyword stuffing.';
        else if (density >= 1 && density < 1.5) explanation = 'Good, but could be improved.';
        else if (density > 2.5 && density <= 3) explanation = 'Good, but be careful not to overuse.';
        else explanation = 'Excellent keyword density.';
        return { colorClass, explanation };
    }

    function getReadabilityInfo(score) {
        const colorClass = getColorClass(score, [30, 70]);
        let explanation = '';
        if (score < 30) explanation = 'Very difficult to read. Consider simplifying the content.';
        else if (score < 50) explanation = 'Difficult to read. Try to make it more accessible.';
        else if (score < 60) explanation = 'Fairly difficult to read. Some improvements could be made.';
        else if (score < 70) explanation = 'Plain English. Good readability.';
        else if (score < 80) explanation = 'Fairly easy to read. Well done!';
        else if (score < 90) explanation = 'Easy to read. Great job!';
        else explanation = 'Very easy to read. Excellent readability!';
        return { colorClass, explanation };
    }

    function getLinkCountInfo(count, isInternal) {
        const colorClass = getColorClass(count, [1, 5]);
        const linkType = isInternal ? 'internal' : 'external';
        let explanation = '';
        if (count === 0) explanation = `No ${linkType} links found. Consider adding some for better SEO.`;
        else if (count < 3) explanation = `Few ${linkType} links. Consider adding more for better SEO.`;
        else if (count < 10) explanation = `Good number of ${linkType} links.`;
        else explanation = `Excellent number of ${linkType} links. Make sure they're all relevant.`;
        return { colorClass, explanation };
    }

    function getKeywordInfo(isPresent, type) {
        const colorClass = isPresent ? 'good' : 'poor';
        const explanation = isPresent
            ? `Great! The keyword is present in the ${type}.`
            : `Consider including the keyword in the ${type} for better SEO.`;
        return { colorClass, explanation };
    }

    function calculateOverallScore(data) {
        let score = 0;
        if (data.keyword_density >= 1 && data.keyword_density <= 3) score += 20;
        if (data.readability_score >= 60) score += 20;
        if (data.internal_links > 0) score += 15;
        if (data.external_links > 0) score += 15;
        if (data.keyword_in_url) score += 15;
        if (data.keyword_in_headings > 0) score += 15;
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
        if (data.error) {
            showError(data.error);
            return;
        }

        const overallScore = calculateOverallScore(data);
        const overallScoreInfo = getOverallScoreInfo(overallScore);
        const keywordDensityInfo = getKeywordDensityInfo(data.keyword_density);
        const readabilityInfo = getReadabilityInfo(data.readability_score);
        const internalLinksInfo = getLinkCountInfo(data.internal_links, true);
        const externalLinksInfo = getLinkCountInfo(data.external_links, false);
        const keywordInUrlInfo = getKeywordInfo(data.keyword_in_url, 'URL');
        const keywordInHeadingsInfo = getKeywordInfo(data.keyword_in_headings > 0, 'headings');

        let resultsHTML = `
            <h2>SEO Analysis Results</h2>
            <div class="overall-score ${overallScoreInfo.colorClass}">
                <h3>Overall SEO Score: ${overallScore}%</h3>
                <p>${overallScoreInfo.explanation}</p>
            </div>
            <div class="metric">
                <h3>Title</h3>
                <p>${data.title}</p>
                <small>A good title should be 50-60 characters long and include your main keyword.</small>
            </div>
            <div class="metric">
                <h3>Meta Description</h3>
                <p>${data.meta_description}</p>
                <small>A good meta description should be 150-160 characters long and include your main keyword.</small>
            </div>
            <div class="metric">
                <h3>Keyword Density: <span class="${keywordDensityInfo.colorClass}">${data.keyword_density}%</span></h3>
                <p>${keywordDensityInfo.explanation}</p>
                <small>Keyword density is the percentage of times a keyword appears on a web page compared to the total number of words on the page.</small>
            </div>
            <div class="metric">
                <h3>Readability Score: <span class="${readabilityInfo.colorClass}">${data.readability_score}</span></h3>
                <p>${readabilityInfo.explanation}</p>
                <small>The readability score indicates how easy it is for people to read your content. A higher score means easier to read.</small>
            </div>
            <div class="metric">
                <h3>Internal Links: <span class="${internalLinksInfo.colorClass}">${data.internal_links}</span></h3>
                <p>${internalLinksInfo.explanation}</p>
                <small>Internal links help search engines understand the structure of your site and distribute page authority.</small>
            </div>
            <div class="metric">
                <h3>External Links: <span class="${externalLinksInfo.colorClass}">${data.external_links}</span></h3>
                <p>${externalLinksInfo.explanation}</p>
                <small>External links to reputable sources can improve your site's credibility and SEO.</small>
            </div>
            <div class="metric">
                <h3>Keyword in URL: <span class="${keywordInUrlInfo.colorClass}">${data.keyword_in_url ? 'Yes' : 'No'}</span></h3>
                <p>${keywordInUrlInfo.explanation}</p>
                <small>Having your keyword in the URL can help with SEO, but don't force it if it doesn't fit naturally.</small>
            </div>
            <div class="metric">
                <h3>Keyword in Headings: <span class="${keywordInHeadingsInfo.colorClass}">${data.keyword_in_headings}</span></h3>
                <p>${keywordInHeadingsInfo.explanation}</p>
                <small>Using your keyword in headings helps search engines understand the structure and topic of your content.</small>
            </div>
            <div class="metric">
                <h3>H1 Tags:</h3>
                <ul>
                    ${data.h1_tags.map(tag => `<li>${tag}</li>`).join('')}
                </ul>
                <small>H1 tags are crucial for SEO and user experience. Each page should have a unique H1 that accurately describes the page's content.</small>
            </div>
        `;

        resultsContainer.innerHTML = resultsHTML;
    }
});
