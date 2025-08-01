// src/services/glossaryService.js

// This map mirrors the one in the original json-router.js and is crucial for mapping
// URL slugs and old IDs to the correct JSON files and display names.
export const categoryMap = {
    'lgbt.mtf': { file: 'mtfs.json', displayName: 'MTFs', postNum: 3, urlSlug: 'mtfs' },
    'lgbt.ftm': { file: 'ftms.json', displayName: 'FTMs', postNum: 4, urlSlug: 'ftms' },
    'lgbt.nb': { file: 'nbs.json', displayName: 'NBs', postNum: 5, urlSlug: 'nbs' },
    'lgbt.gen': { file: 'general_trans.json', displayName: 'General Trans', postNum: 6, urlSlug: 'general-trans' },
    'lgbt.infite': { file: 'trans_infighting.json', displayName: 'Trans Infighting', postNum: 7, urlSlug: 'trans-infighting' },
    'lgbt.hon': { file: 'hons.json', displayName: 'Hons', postNum: 8, urlSlug: 'hons' },
    'lgbt.rep': { file: 'repression.json', displayName: 'Repression', postNum: 9, urlSlug: 'repression' },
    'lgbt.hrt': { file: 'hrt.json', displayName: 'HRT', postNum: 10, urlSlug: 'hrt' },
    'lgbt.age': { file: 'age.json', displayName: 'Age', postNum: 11, urlSlug: 'age' },
    'lgbt.say': { file: 'sayings.json', displayName: 'Sayings', postNum: 12, urlSlug: 'sayings' },
    'lgbt.pills': { file: 'pills.json', displayName: 'Pills', postNum: 13, urlSlug: 'pills' },
    'lgbt.pass': { file: 'passing.json', displayName: 'Passing', postNum: 14, urlSlug: 'passing' },
    'lgbt.body': { file: 'body_parts.json', displayName: 'Body Parts', postNum: 15, urlSlug: 'body-parts' },
    'lgbt.surgery': { file: 'gender_affirming_surgeries.json', displayName: 'Gender Affirming Surgeries', postNum: 16, urlSlug: 'surgeries' },
    'lgbt.para': { file: 'paraphilias.json', displayName: 'Sex & Kink', postNum: 17, urlSlug: 'paraphilias' },
    'lgbt.orientation': { file: 'sexual_orientations.json', displayName: 'Sexual Orientations', postNum: 18, urlSlug: 'sexual-orientations' },
    'lgbt.boys': { file: 'boys.json', displayName: 'Boys', postNum: 19, urlSlug: 'boys' },
    'lgbt.blanch': { file: 'blanchard.json', displayName: 'Blanchard', postNum: 20, urlSlug: 'blanchard' },
    'lgbt.terf': { file: 'terfs.json', displayName: 'TERFs', postNum: 21, urlSlug: 'terfs' },
    'lgbt.cis': { file: 'cissies.json', displayName: 'Cissies', postNum: 22, urlSlug: 'cissies' },
    'lgbt.ppl': { file: 'people.json', displayName: 'People', postNum: 23, urlSlug: 'people' },
    'lgbt.sui': { file: 'mental_illness_and_suicide.json', displayName: 'Mental Illness & Suicide', postNum: 24, urlSlug: 'mental-illness' },
    'lgbt.tran': { file: 'random_cultural_stuff.json', displayName: 'Random Cultural Stuff', postNum: 25, urlSlug: 'cultural' },
    'lgbt.misc': { file: 'miscellaneous.json', displayName: 'Miscellaneous', postNum: 26, urlSlug: 'misc' }
};

// Reverse mapping for URL slugs to category IDs
export const slugToCategoryId = {};
Object.entries(categoryMap).forEach(([id, info]) => {
    slugToCategoryId[info.urlSlug] = id;
});

// Simple in-memory cache to prevent re-fetching data on every navigation.
let glossaryDataCache = null;

// Function to convert a term's name into a URL-friendly slug.
function termToSlug(term) {
    // First, handle emoji conversions
    const emojiMap = {
        '🚂': 'train',
        '🦵': 'knee',
        '🚬': 'fag',
        '🐐': 'goat'
    };
    
    let processedTerm = term;
    Object.entries(emojiMap).forEach(([emoji, text]) => {
        processedTerm = processedTerm.replace(new RegExp(emoji, 'g'), text);
    });
    
    return processedTerm.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Function to generate term variations for matching
function generateTermVariations(term) {
    const variations = new Set();
    variations.add(term);
    
    // Handle plurals and common variations
    if (term.endsWith('s')) {
        variations.add(term.slice(0, -1)); // Remove 's'
    } else {
        variations.add(term + 's'); // Add 's'
    }
    
    // Handle apostrophe variations
    if (term.includes("'")) {
        variations.add(term.replace(/'/g, "'"));
        variations.add(term.replace(/'/g, "'"));
    }
    
    // Handle specific known variations
    const specificVariations = {
        'MTF': ['trans woman', 'trans women', 'transgirl', 'transgirls', 'MTFs', 'MtF'],
        'FTM': ['trans man', 'trans men', 'transguy', 'transguys', 'FTMs', 'FtM'],
        'HRT': ['hormone replacement therapy', 'hormones'],
        'NB': ['non-binary', 'nonbinary', 'enby', 'enbies', 'NBs'],
        'TERF': ['terfs', 'TERFs'],
        'AGP': ['autogynephile', 'autogynephiles', 'autogynephilia', 'AGPs'],
        'AAP': ['autoandrophile', 'autoandrophiles', 'autoandrophilia', 'AAPs'],
        'HSTS': ['homosexual transsexual', 'homosexual transsexuals'],
        'Cis': ['cisgender', 'cissie', 'cissies'],
        'Trans': ['transgender', 'transsexual'],
        'Repper / Repressor': ['repper', 'repressor', 'reppers', 'repressors'],
        'Boymoder': ['boymode', 'boymoding', 'boymoders'],
        'Girlmoder': ['girlmode', 'girlmoding', 'girlmoders'],
        'Manmoder': ['manmode', 'manmoding', 'manmoders'],
        'Youngshit': ['youngshits'],
        'Oldshit': ['oldshits'],
        'Midshit': ['midshits'],
        'Hon': ['hons'],
        'Mogs/Mogging': ['mog', 'mogs', 'mogging', 'mogged'],
        'Rope/Roping': ['rope', 'roping', 'roped'],
        'Brain Worms': ['brainworm', 'brainworms', 'brain worm'],
        'BDD': ['body dysmorphic disorder'],
        'GD': ['gender dysphoria'],
        'SRS': ['sex reassignment surgery', 'bottom surgery'],
        'FFS': ['facial feminization surgery'],
        'Pills': ['hrt pills', 'estrogen pills', 'testosterone pills'],
        'T': ['testosterone'],
        'E': ['estrogen'],
        'E Gel': ['estrogen gel', 'estrogel'],
        'Bica': ['bicalutamide'],
        'Spiro': ['spironolactone'],
        'Prog': ['progesterone'],
        'Transbian': ['transbians', 'trans lesbian', 'trans lesbians'],
        'ST4T': ['T4T', 't4t']
    };
    
    if (specificVariations[term]) {
        specificVariations[term].forEach(v => variations.add(v));
    }
    
    return Array.from(variations);
}

/**
 * Loads all glossary data from the JSON files, processes it, and caches it.
 * This function should only run once.
 */
async function loadGlossaryData() {
    if (glossaryDataCache) {
        return glossaryDataCache;
    }

    console.log('Fetching and processing glossary data for the first time...');

    const data = {
        categories: {},
        dataCache: {}, // Store raw category data by category ID
        termsBySlug: {}, // A flat map of all terms for easy lookup by slug.
        termMap: new Map(), // For auto-linking - main terms
        termVariations: new Map(), // For auto-linking - variations
    };

    const categoryPromises = Object.entries(categoryMap).map(async ([categoryId, categoryInfo]) => {
        try {
            const response = await fetch(`./jsons/${categoryInfo.file}`);
            if (!response.ok) {
                throw new Error(`Failed to load ${categoryInfo.file}: ${response.status} ${response.statusText}`);
            }
            const categoryData = await response.json();
        
        // Store raw data in dataCache
        data.dataCache[categoryId] = categoryData;
        
        const processedCategory = {
            ...categoryInfo,
            id: categoryId,
            description: categoryData.description,
            categoryImage: categoryData.categoryImage,
            icon: categoryData.icon,
            terms: categoryData.terms.map((term, index) => ({
                ...term,
                slug: termToSlug(term.term),
                categoryId: categoryId,
                categorySlug: categoryInfo.urlSlug,
                postNum: categoryInfo.postNum + index + 1 // Calculate post number
            })),
        };
        data.categories[categoryId] = processedCategory;

        // Build term maps
        processedCategory.terms.forEach(term => {
            const termSlug = term.slug;
            const linkPath = `term/${termSlug}`;
            
            // Store in flat map
            data.termsBySlug[termSlug] = term;
            
            // Store main term for auto-linking
            data.termMap.set(term.term.toLowerCase(), {
                originalTerm: term.term,
                linkPath: linkPath,
                categoryId: categoryId
            });
            
            // Store variations for auto-linking
            const variations = generateTermVariations(term.term);
            variations.forEach(variation => {
                data.termVariations.set(variation.toLowerCase(), {
                    originalTerm: term.term,
                    linkPath: linkPath,
                    categoryId: categoryId
                });
            });
        });
        } catch (error) {
            console.error(`Error loading category ${categoryId}:`, error);
            throw error;
        }
    });

    await Promise.all(categoryPromises);

    glossaryDataCache = data;
    console.log('Glossary data loaded and cached.', glossaryDataCache);
    return glossaryDataCache;
}

// The public API for our service. Components will use these functions.
export const glossaryService = {
    loadData: loadGlossaryData, // Expose for explicit loading if needed.
    
    async getCategories() {
        const data = await loadGlossaryData();
        return Object.values(data.categories);
    },

    async getCategoryBySlug(categorySlug) {
        const data = await loadGlossaryData();
        return Object.values(data.categories).find(c => c.urlSlug === categorySlug) || null;
    },

    async getCategoryById(categoryId) {
        const data = await loadGlossaryData();
        return data.categories[categoryId] || null;
    },

    async getTermBySlug(termSlug) {
        const data = await loadGlossaryData();
        return data.termsBySlug[termSlug] || null;
    },

    async getTermMap() {
        const data = await loadGlossaryData();
        return data.termMap;
    },

    async getTermVariations() {
        const data = await loadGlossaryData();
        return data.termVariations;
    },

    async getAllData() {
        const data = await loadGlossaryData();
        return data;
    },

    async getDataCache() {
        const data = await loadGlossaryData();
        return data.dataCache;
    }
};