function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function showLoading() {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Analyzing... Please wait.</div>';
}

function showError(message) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = `<div class="error"><i class="fas fa-exclamation-circle"></i> ${message}</div>`;
}

export { isValidUrl, showLoading, showError };
