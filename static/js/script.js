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

    function displayResults(data) {
        if (data.error) {
            showError(data.error);
            return;
        }

        let resultsHTML = `
            <h2>SEO Analysis Results</h2>
            <p><strong>Title:</strong> ${data.title}</p>
            <p><strong>Meta Description:</strong> ${data.meta_description}</p>
            <p><strong>Keyword Count:</strong> ${data.keyword_count}</p>
            <h3>H1 Tags:</h3>
            <ul>
        `;

        data.h1_tags.forEach(tag => {
            resultsHTML += `<li>${tag}</li>`;
        });

        resultsHTML += '</ul>';
        resultsContainer.innerHTML = resultsHTML;
    }
});
