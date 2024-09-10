// Helper function to generate explanation text based on ranges and conditions
function getExplanationText(value, ranges) {
    for (const { condition, text } of ranges) {
        if (condition(value)) return text;
    }
    return '';
}

// Simplified color class function
function getColorClass(value, thresholds) {
    const [low, high] = thresholds;
    return value < low ? 'poor' : value < high ? 'moderate' : 'good';
}

// Keyword Density Info function
function getKeywordDensityInfo(density) {
    const colorClass = getColorClass(density, [1, 2.5]);
    const explanationRanges = [
        { condition: v => v < 1, text: 'Too low. Consider increasing keyword usage.' },
        { condition: v => v > 3, text: 'Too high. Consider reducing keyword usage to avoid keyword stuffing.' },
        { condition: v => v >= 1 && v < 1.5, text: 'Good, but could be improved.' },
        { condition: v => v > 2.5 && v <= 3, text: 'Good, but be careful not to overuse.' },
        { condition: v => v >= 1.5 && v <= 2.5, text: 'Excellent keyword density.' }
    ];
    const explanation = getExplanationText(density, explanationRanges);
    return { colorClass, explanation };
}

// Readability Info function
function getReadabilityInfo(score) {
    const colorClass = getColorClass(score, [30, 70]);
    const explanationRanges = [
        { condition: v => v < 30, text: 'Very difficult to read. Consider simplifying the content.' },
        { condition: v => v < 50, text: 'Difficult to read. Try to make it more accessible.' },
        { condition: v => v < 60, text: 'Fairly difficult to read. Some improvements could be made.' },
        { condition: v => v < 70, text: 'Plain English. Good readability.' },
        { condition: v => v < 80, text: 'Fairly easy to read. Well done!' },
        { condition: v => v < 90, text: 'Easy to read. Great job!' },
        { condition: v => v >= 90, text: 'Very easy to read. Excellent readability!' }
    ];
    const explanation = getExplanationText(score, explanationRanges);
    return { colorClass, explanation };
}

// Link Count Info function (internal/external links)
function getLinkCountInfo(count, isInternal) {
    const linkType = isInternal ? 'internal' : 'external';
    const colorClass = getColorClass(count, [1, 5]);
    const explanationRanges = [
        { condition: v => v === 0, text: `No ${linkType} links found. Consider adding some for better SEO.` },
        { condition: v => v < 3, text: `Few ${linkType} links. Consider adding more for better SEO.` },
        { condition: v => v < 10, text: `Good number of ${linkType} links.` },
        { condition: v => v >= 10, text: `Excellent number of ${linkType} links. Make sure they're all relevant.` }
    ];
    const explanation = getExplanationText(count, explanationRanges);
    return { colorClass, explanation };
}

// Keyword Presence Info function
function getKeywordInfo(isPresent, type) {
    const colorClass = isPresent ? 'good' : 'poor';
    const explanation = isPresent
        ? `Great! The keyword is present in the ${type}.`
        : `Consider including the keyword in the ${type} for better SEO.`;
    return { colorClass, explanation };
}

export { getColorClass, getKeywordDensityInfo, getReadabilityInfo, getLinkCountInfo, getKeywordInfo };