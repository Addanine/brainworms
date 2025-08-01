// Utility functions for meta tags

export function truncateDescription(text, maxLength = 155) {
    if (!text) return '';
    
    // Remove any HTML tags
    const cleanText = text.replace(/<[^>]*>/g, '');
    
    if (cleanText.length <= maxLength) {
        return cleanText;
    }
    
    // Truncate to maxLength and add ellipsis
    const truncated = cleanText.substring(0, maxLength - 3);
    // Find the last space to avoid cutting words
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > 0) {
        return truncated.substring(0, lastSpace) + '...';
    }
    
    return truncated + '...';
}

export function getAbsoluteImageUrl(imagePath) {
    if (!imagePath) return null;
    
    // If it already starts with http, return as is
    if (imagePath.startsWith('http')) {
        return imagePath;
    }
    
    // For relative paths, we need to construct the full URL
    // This will be replaced with the actual domain when deployed
    const baseUrl = window.location.origin;
    
    // Remove leading ./ if present
    const cleanPath = imagePath.replace(/^\.\//, '');
    
    return `${baseUrl}/${cleanPath}`;
}