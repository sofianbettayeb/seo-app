// api.js
async function analyzeSEO(url, keyword) {
    try {
        const response = await axios.post('/analyze', { url, keyword });
        return response.data;
    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            throw new Error(error.response.data.error || 'An error occurred while analyzing the URL.');
        } else if (error.request) {
            // The request was made but no response was received
            throw new Error('No response received from the server. Please try again later.');
        } else {
            // Something happened in setting up the request that triggered an Error
            throw new Error('An error occurred while sending the request. Please try again.');
        }
    }
}

export { analyzeSEO };
