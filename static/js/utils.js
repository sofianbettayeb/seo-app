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
        if (url.hostname === 'localhost' || url.hostname.startsWith('127.') || url.hostname === '[::1]') {
            throw new Error("Local addresses not allowed");
        }
        if (!/^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/.test(url.hostname)) {
            throw new Error("Invalid hostname format");
        }

        // Check for common TLD typos
        const commonTypos = {
            'com': ['con', 'cmo', 'cm', 'co'],
            'org': ['ogr', 'or', 'rg'],
            'net': ['nte', 'ne', 'et'],
            'edu': ['ed', 'eu'],
            'gov': ['go', 'gv']
        };

        const tld = url.hostname.split('.').pop();
        for (const [correct, typos] of Object.entries(commonTypos)) {
            if (typos.includes(tld)) {
                throw new Error(`TLD typo: Did you mean .${correct} instead of .${tld}?`);
            }
        }

        return { isValid: true, url: url.href };
    } catch (error) {
        let errorMessage = "Invalid URL";
        let errorCode = "INVALID_URL";
        if (error.message === "Invalid protocol") {
            errorMessage = "Invalid protocol. URL must use http:// or https://";
            errorCode = "INVALID_PROTOCOL";
        } else if (error.message === "Missing hostname") {
            errorMessage = "Missing hostname. Please check the URL format";
            errorCode = "MISSING_HOSTNAME";
        } else if (error.message === "Local addresses not allowed") {
            errorMessage = "Local addresses are not allowed. Please enter a public URL";
            errorCode = "LOCAL_ADDRESS";
        } else if (error.message === "Invalid hostname format") {
            errorMessage = "Invalid hostname format. Please check the URL";
            errorCode = "INVALID_HOSTNAME";
        } else if (error.message.startsWith("TLD typo:")) {
            errorMessage = error.message;
            errorCode = "TLD_TYPO";
        }
        return { isValid: false, error: errorMessage, code: errorCode };
    }
}

function isValidKeyword(keyword) {
    // Check if the keyword is not empty, contains only alphanumeric characters, spaces, and hyphens, and is not too long
    return /^[a-zA-Z0-9\s-]+$/.test(keyword) && keyword.trim().length > 0 && keyword.trim().length <= 100;
}

function showLoading() {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Analyzing... Please wait.</div>';
}

function showError(message, code) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = `
        <div class="error">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
            ${code ? `<small>Error code: ${code}</small>` : ''}
        </div>`;
}

export { isValidUrl, isValidKeyword, showLoading, showError };
