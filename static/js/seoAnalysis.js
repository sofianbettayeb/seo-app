// Function to return color class based on ranges
function getColorClass(value, ranges = []) {
    if (!ranges || ranges.length === 0) {
        // Default behavior if no ranges are provided
        if (value < 20) return "poor";
        if (value < 40) return "moderate";
        if (value < 60) return "average";
        if (value < 80) return "good";
        return "excellent";
    }


    // Destructure ranges and fallback to the default ranges if not all provided
    const [poorMin = 0, moderateMin = 0, goodMin = 0, excellentMin = 0] =
        ranges;

    if (value < poorMin) return "poor";
    if (value < moderateMin) return "moderate";
    if (value < goodMin) return "average";
    if (value < excellentMin) return "good";
    return "excellent";
}

function getKeywordDensityInfo(density) {
    const colorClass = getColorClass(density, [1, 2.5]);
    let explanation = "";
    if (density < 1)
        explanation = "Too low. Consider increasing keyword usage.";
    else if (density > 3)
        explanation =
            "Too high. Consider reducing keyword usage to avoid keyword stuffing.";
    else if (density >= 1 && density < 1.5)
        explanation = "Good, but could be improved.";
    else if (density > 2.5 && density <= 3)
        explanation = "Good, but be careful not to overuse.";
    else explanation = "Excellent keyword density.";
    return { colorClass, explanation };
}

function getReadabilityInfo(score) {
    const colorClass = getColorClass(score, [30, 70]);
    let explanation = "";
    if (score < 30)
        explanation =
            "Very difficult to read. Consider simplifying the content.";
    else if (score < 50)
        explanation = "Difficult to read. Try to make it more accessible.";
    else if (score < 60)
        explanation =
            "Fairly difficult to read. Some improvements could be made.";
    else if (score < 70) explanation = "Plain English. Good readability.";
    else if (score < 80) explanation = "Fairly easy to read. Well done!";
    else if (score < 90) explanation = "Easy to read. Great job!";
    else explanation = "Very easy to read. Excellent readability!";
    return { colorClass, explanation };
}

function getLinkCountInfo(count, isInternal) {
    const colorClass = getColorClass(count, [1, 5]);
    const linkType = isInternal ? "internal" : "external";
    let explanation = "";
    if (count === 0)
        explanation = `No ${linkType} links found. Consider adding some for better SEO.`;
    else if (count < 3)
        explanation = `Few ${linkType} links. Consider adding more for better SEO.`;
    else if (count < 10) explanation = `Good number of ${linkType} links.`;
    else
        explanation = `Excellent number of ${linkType} links. Make sure they're all relevant.`;
    return { colorClass, explanation };
}

function getKeywordInfo(isPresent, type) {
    const colorClass = isPresent ? "good" : "poor";
    const explanation = isPresent
        ? `Great! The keyword is present in the ${type}.`
        : `Consider including the keyword in the ${type} for better SEO.`;
    return { colorClass, explanation };
}

export {
    getColorClass,
    getKeywordDensityInfo,
    getReadabilityInfo,
    getLinkCountInfo,
    getKeywordInfo,
};
