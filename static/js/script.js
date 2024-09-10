import { isValidUrl, showLoading, showError } from './utils.js';
import { displayResults, generateOverallScoreHTML, calculateOverallScore } from './resultsDisplay.js';
import { analyzeSEO } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const analyzeBtn = document.getElementById('analyze-btn');
    const urlInput = document.getElementById('url');
    const keywordInput = document.getElementById('keyword');

    analyzeBtn.addEventListener('click', async () => {
        const url = urlInput.value.trim();
        const keyword = keywordInput.value.trim();

        if (!isValidUrl(url)) {
            showError('Please enter a valid URL.');
            return;
        }

        if (!keyword) {
            showError('Please enter a keyword.');
            return;
        }

        try {
            showLoading();
            const results = await analyzeSEO(url, keyword);
            displayResults(results);
        } catch (error) {
            showError(error.message);
        }
    });
});
