// Utility function to check if icons should be shown
export function shouldShowIcon(location) {
    // Icons are shown everywhere except:
    // - Index posts (handled by component logic)
    // - Main page OP post (handled by component logic)
    // - Gallery page (needs to be checked)
    return !location?.includes('gallery');
}