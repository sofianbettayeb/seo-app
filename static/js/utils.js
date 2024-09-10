function isValidUrl(string) {
    // Trim leading and trailing whitespace, quotes, and apostrophes
    string = string.trim().replace(/^['"]|['"]$/g, '');

    // Add 'https://' if not present
    if (!/^https?:\/\//i.test(string)) {
        string = 'https://' + string;
    }

    try {
        const url = new URL(string);
        if (url.protocol !== "http:" && url.protocol !== "https:") {
            throw new Error("Invalid protocol");
        }
        if (!url.hostname) {
            throw new Error("Missing hostname");
        }
        return { isValid: true, url: url.href };
    } catch (error) {
        let errorMessage = "Invalid URL";
        if (error.message === "Invalid protocol") {
            errorMessage = "Invalid protocol. URL must use http:// or https://";
        } else if (error.message === "Missing hostname") {
            errorMessage = "Missing hostname. Please check the URL format";
        }
        return { isValid: false, error: errorMessage };
    }
}

function isValidKeyword(keyword) {
    // Check if the keyword is not empty and contains only alphanumeric characters, spaces, and hyphens
    return /^[a-zA-Z0-9\s-]+$/.test(keyword) && keyword.trim().length > 0;
}

function showLoading() {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Analyzing... Please wait.</div>';
}

function showError(message) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = `<div class="error"><i class="fas fa-exclamation-circle"></i> ${message}</div>`;
}

export { isValidUrl, isValidKeyword, showLoading, showError };
