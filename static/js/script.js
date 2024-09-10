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
            showError('Please enter both a URL and a keyword.', 'MISSING_PARAMS');
            return;
        }

        const urlValidationResult = isValidUrl(urlValue);
        if (!urlValidationResult.isValid) {
            showError(urlValidationResult.error, urlValidationResult.code);
            return;
        }

        if (!isValidKeyword(keyword)) {
            showError('Please enter a valid keyword. It should contain only letters, numbers, spaces, and hyphens, and be between 1 and 100 characters long.', 'INVALID_KEYWORD');
            return;
        }

        try {
            showLoading();
            const results = await analyzeSEO(urlValidationResult.url, keyword);
            displayResults(results);
        } catch (error) {
            console.error('Error:', error);
            handleClientError(error);
        }
    });
});

function handleClientError(error) {
    if (error.response && error.response.data && error.response.data.error) {
        showError(`${error.response.data.error} (Code: ${error.response.data.code})`, error.response.data.code);
    } else if (error.message) {
        let errorMessage = error.message;
        let errorCode = 'CLIENT_ERROR';

        if (error.message.includes('Network Error')) {
            errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
            errorCode = 'NETWORK_ERROR';
        } else if (error.message.includes('timeout')) {
            errorMessage = 'The request timed out. The server might be busy or the website might be too slow to respond.';
            errorCode = 'TIMEOUT_ERROR';
        } else if (error.message.includes('Cannot read properties of undefined')) {
            errorMessage = 'An error occurred while processing the response. The website might have an unexpected structure.';
            errorCode = 'PARSING_ERROR';
        } else if (error.message.includes('404')) {
            errorMessage = 'The requested URL could not be found. Please check the URL and try again.';
            errorCode = 'URL_NOT_FOUND';
        } else if (error.message.includes('403')) {
            errorMessage = 'Access to the website is forbidden. The site may be blocking our requests.';
            errorCode = 'ACCESS_FORBIDDEN';
        } else if (error.message.includes('500')) {
            errorMessage = 'The target website is experiencing issues. Please try again later.';
            errorCode = 'SERVER_ERROR';
        } else if (error.message.includes('CERT_HAS_EXPIRED')) {
            errorMessage = 'The SSL certificate of the website has expired. This may pose security risks.';
            errorCode = 'SSL_CERT_EXPIRED';
        } else if (error.message.includes('CERT_INVALID')) {
            errorMessage = 'The SSL certificate of the website is invalid. This may pose security risks.';
            errorCode = 'SSL_CERT_INVALID';
        } else if (error.message.includes('ETIMEDOUT')) {
            errorMessage = 'The connection to the website timed out. The server might be slow or unresponsive.';
            errorCode = 'CONNECTION_TIMEOUT';
        } else if (error.message.includes('ENOTFOUND')) {
            errorMessage = 'The hostname of the website could not be resolved. Please check the URL.';
            errorCode = 'HOSTNAME_NOT_FOUND';
        }

        showError(errorMessage, errorCode);
    } else {
        showError('An unexpected error occurred. Please try again later.', 'UNEXPECTED_ERROR');
    }
}

export { handleClientError };
