// src/services/graphDataService.js
import { glossaryService } from './glossaryService';

let cachedGraphData = null;

// Color palette for categories (4chan-inspired colors)
export const categoryColors = {
    'lgbt.mtf': '#FF6B9D',      // Pink
    'lgbt.ftm': '#4ECDC4',      // Teal
    'lgbt.hon': '#FF6F61',      // Coral
    'lgbt.nb': '#95E1D3',       // Mint
    'lgbt.gen': '#A8E6CF',      // Light green
    'lgbt.age': '#FFD93D',      // Yellow
    'lgbt.infite': '#F38181',   // Light red
    'lgbt.blanch': '#C7CEEA',   // Lavender
    'lgbt.para': '#B983FF',     // Purple
    'lgbt.boys': '#74C0FC',     // Light blue
    'lgbt.hrt': '#FFB7B2',      // Peach
    'lgbt.pass': '#B4E7CE',     // Sage
    'lgbt.rep': '#DDA0DD',      // Plum
    'lgbt.body': '#F4A261',     // Sandy
    'lgbt.surgery': '#E76F51',  // Terracotta
    'lgbt.pills': '#FFE5CC',    // Cream
    'lgbt.terf': '#AA96DA',     // Mauve
    'lgbt.ppl': '#FCBAD3',      // Blush
    'lgbt.orientation': '#A8DADC', // Powder blue
    'lgbt.say': '#F1E4E8',      // Misty rose
    'lgbt.cis': '#E2D4BA',      // Beige
    'lgbt.sui': '#8B80F9',      // Periwinkle
    'lgbt.tran': '#FAD4D4',     // Light pink
    'lgbt.misc': '#D3D3D3'      // Light gray
};

/**
 * Processes glossary data to create nodes and links for the force graph
 */
export async function generateGraphData() {
    if (cachedGraphData) {
        console.log('generateGraphData: Returning cached data...');
        return cachedGraphData;
    }

    try {
        console.log('generateGraphData: Starting...');
        const allData = await glossaryService.getAllData();
        console.log('generateGraphData: Got all data', allData);
        const nodes = [];
        const links = [];
        const nodeMap = new Map(); // Track nodes by id to avoid duplicates
        
    // First, create the central brainworms node
    const brainwormsNode = {
        id: 'brainworms-central',
        name: '', // Remove the text label
        type: 'central',
        radius: 30, // Largest radius for central node
        color: 'rgba(0,0,0,0)', // Make the default circle transparent
        x: 0,
        y: 0
    };
    nodes.push(brainwormsNode);
    nodeMap.set(brainwormsNode.id, brainwormsNode);
    
    // Then, create category nodes
    const categoryEntries = Object.entries(allData.categories);
    const categoryCount = categoryEntries.length;
    const angleStep = (2 * Math.PI) / categoryCount;
    const CATEGORY_RING_RADIUS = 400;

    categoryEntries.forEach(([categoryId, category], index) => {
        // Calculate position in a circle around center (0,0)
        const angle = index * angleStep - Math.PI / 2; // Start from top
        const categoryNode = {
            id: `category-${categoryId}`,
            name: category.displayName,
            type: 'category',
            categoryId: categoryId,
            radius: 20, // Larger radius for categories
            color: categoryColors[categoryId] || '#789',
            x: CATEGORY_RING_RADIUS * Math.cos(angle),
            y: CATEGORY_RING_RADIUS * Math.sin(angle)
        };
        nodes.push(categoryNode);
        nodeMap.set(categoryNode.id, categoryNode);
        
        // Create link from central brainworms node to this category
        links.push({
            source: 'brainworms-central',
            target: `category-${categoryId}`,
            type: 'central-category',
            strength: 0.8
        });
    });
    
    // Then, create term nodes and category-term links
    const TERM_RING_RADIUS = 150;
    Object.entries(allData.categories).forEach(([categoryId, category]) => {
        const categoryNode = nodeMap.get(`category-${categoryId}`);
        const termCount = category.terms.length;
        const termAngleStep = (2 * Math.PI) / termCount;
        
        category.terms.forEach((term, termIndex) => {
            // Calculate position in a circle around parent category
            const termAngle = termIndex * termAngleStep;
            const termNode = {
                id: term.slug,
                name: term.term,
                type: 'term',
                categoryId: categoryId,
                categorySlug: category.urlSlug,
                definition: term.definition,
                isDefiningTerm: term.isDefiningTerm,
                radius: term.isDefiningTerm ? 10 : 6,
                color: categoryColors[categoryId] || '#789',
                x: categoryNode.x + TERM_RING_RADIUS * Math.cos(termAngle),
                y: categoryNode.y + TERM_RING_RADIUS * Math.sin(termAngle)
            };
            
            if (!nodeMap.has(termNode.id)) {
                nodes.push(termNode);
                nodeMap.set(termNode.id, termNode);
                
                // Create link from category to term
                links.push({
                    source: `category-${categoryId}`,
                    target: term.slug,
                    type: 'category',
                    strength: 0.5
                });
            }
        });
    });
    
    // Create links based on related terms
    Object.entries(allData.categories).forEach(([, category]) => {
        category.terms.forEach(term => {
            if (term.relatedTerms && term.relatedTerms.length > 0) {
                term.relatedTerms.forEach(relatedTermName => {
                    // Find the related term in any category
                    let relatedTermSlug = null;
                    
                    Object.values(allData.categories).forEach(cat => {
                        const found = cat.terms.find(t => 
                            t.term.toLowerCase() === relatedTermName.toLowerCase()
                        );
                        if (found) {
                            relatedTermSlug = found.slug;
                        }
                    });
                    
                    if (relatedTermSlug && nodeMap.has(relatedTermSlug)) {
                        // Avoid duplicate links
                        const linkExists = links.some(link => 
                            (link.source === term.slug && link.target === relatedTermSlug) ||
                            (link.source === relatedTermSlug && link.target === term.slug)
                        );
                        
                        if (!linkExists) {
                            links.push({
                                source: term.slug,
                                target: relatedTermSlug,
                                type: 'related',
                                strength: 1
                            });
                        }
                    }
                });
            }
        });
    });
    
    // Create links based on terms mentioned in definitions
    const termMap = await glossaryService.getTermMap();
    const termVariations = await glossaryService.getTermVariations();
    
    Object.entries(allData.categories).forEach(([, category]) => {
        category.terms.forEach(term => {
            const definitionLower = term.definition.toLowerCase();
            const foundTerms = new Set();
            
            // Check for exact term matches
            termMap.forEach((value, key) => {
                if (definitionLower.includes(key) && value.originalTerm !== term.term) {
                    // Find the slug for this term
                    Object.values(allData.categories).forEach(cat => {
                        const found = cat.terms.find(t => t.term === value.originalTerm);
                        if (found) {
                            foundTerms.add(found.slug);
                        }
                    });
                }
            });
            
            // Check for term variations
            termVariations.forEach((value, key) => {
                if (definitionLower.includes(key) && value.originalTerm !== term.term) {
                    // Find the slug for this term
                    Object.values(allData.categories).forEach(cat => {
                        const found = cat.terms.find(t => t.term === value.originalTerm);
                        if (found) {
                            foundTerms.add(found.slug);
                        }
                    });
                }
            });
            
            // Create links for mentioned terms
            foundTerms.forEach(targetSlug => {
                if (nodeMap.has(targetSlug)) {
                    const linkExists = links.some(link => 
                        (link.source === term.slug && link.target === targetSlug) ||
                        (link.source === targetSlug && link.target === term.slug)
                    );
                    
                    if (!linkExists) {
                        links.push({
                            source: term.slug,
                            target: targetSlug,
                            type: 'mentioned',
                            strength: 0.7
                        });
                    }
                }
            });
        });
    });
    
    console.log('generateGraphData: Caching and returning data...');
    cachedGraphData = { nodes, links };
    return cachedGraphData;
    } catch (error) {
        console.error('Error generating graph data:', error);
        throw new Error('Failed to generate graph data: ' + error.message);
    }
}