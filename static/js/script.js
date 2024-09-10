import { isValidUrl, isValidKeyword, showLoading, showError } from './utils.js';
import { displayResults } from './resultsDisplay.js';
import { analyzeSEO } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const analyzeBtn = document.getElementById('analyze-btn');
    const urlInput = document.getElementById('url');
    const keywordInput = document.getElementById('keyword');

    analyzeBtn.addEventListener('click', async () => {
        const urlValue = urlInput.value.trim();
        const keyword = keywordInput.value.trim();

        if (!urlValue || !keyword) {
            showError('Please enter both a URL and a keyword.');
            return;
        }

        const urlValidationResult = isValidUrl(urlValue);
        if (!urlValidationResult.isValid) {
            showError(urlValidationResult.error);
            return;
        }

        if (!isValidKeyword(keyword)) {
            showError('Please enter a valid keyword. It should contain only letters, numbers, spaces, and hyphens.');
            return;
        }

        try {
            showLoading();
            const results = await analyzeSEO(urlValidationResult.url, keyword);
            displayResults(results);
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                showError(error.response.data.error);
            } else {
                showError('An unexpected error occurred. Please try again later.');
            }
        }
    });
});
