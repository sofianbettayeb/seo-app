// api.js
async function analyzeSEO(url, keyword) {
    try {
        const response = await axios.post('/analyze', { url, keyword });
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw new Error('An error occurred while analyzing the URL.');
    }
}

export { analyzeSEO };
