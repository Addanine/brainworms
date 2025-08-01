// src/pages/TermPage.jsx
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { glossaryService, categoryMap } from '../services/glossaryService';
import AutoLinkText from '../components/AutoLinkText';
import FileInfo from '../components/FileInfo';
import Tooltip from '../components/Tooltip';
import CategoryIcon from '../components/CategoryIcon';
import { useImageLightbox } from '../hooks/useImageLightbox';
import { truncateDescription, getAbsoluteImageUrl } from '../utils/metaUtils';

export default function TermPage() {
    const { categorySlug, termSlug } = useParams();
    const [term, setTerm] = useState(null);
    const [category, setCategory] = useState(null);
    const [backlinks, setBacklinks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const lightboxContainerRef = useImageLightbox();

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            
            let categoryData, termData;
            
            if (categorySlug) {
                // First get the category to find which category ID we need
                categoryData = await glossaryService.getCategoryBySlug(categorySlug);
                if (!categoryData) {
                    setIsLoading(false);
                    return;
                }
                
                // Find the term within this category
                termData = categoryData.terms.find(t => t.slug === termSlug);
                if (!termData) {
                    setIsLoading(false);
                    return;
                }
            } else {
                // No category slug provided, search all categories for the term
                const allCategories = await glossaryService.getCategories();
                
                for (const cat of allCategories) {
                    const foundTerm = cat.terms.find(t => t.slug === termSlug);
                    if (foundTerm) {
                        termData = foundTerm;
                        categoryData = cat;
                        break;
                    }
                }
                
                if (!termData || !categoryData) {
                    setIsLoading(false);
                    return;
                }
            }
            
            setTerm(termData);
            setCategory(categoryData);
            
            // Find backlinks - terms that reference this term
            const allData = await glossaryService.getAllData();
            const backlinksList = [];
            
            Object.entries(allData.categories).forEach(([catId, catData]) => {
                catData.terms.forEach(t => {
                    // Check if this term's definition contains our term
                    const ourTermLower = termData.term.toLowerCase();
                    const definitionLower = t.definition.toLowerCase();
                    
                    // Don't include self-references
                    if (t.slug === termSlug && catId === categoryData.id) {
                        return;
                    }
                    
                    // Check if definition contains our term (simple word boundary check)
                    const regex = new RegExp(`\\b${escapeRegex(ourTermLower)}\\b`, 'i');
                    if (regex.test(definitionLower)) {
                        backlinksList.push({
                            term: t,
                            categoryId: catId,
                            categoryInfo: categoryMap[catId]
                        });
                    }
                    
                    // Also check if our term is in related terms
                    if (t.relatedTerms && t.relatedTerms.some(rt => 
                        rt.toLowerCase() === ourTermLower)) {
                        // Avoid duplicates
                        if (!backlinksList.some(bl => 
                            bl.term.slug === t.slug && bl.categoryId === catId)) {
                            backlinksList.push({
                                term: t,
                                categoryId: catId,
                                categoryInfo: categoryMap[catId]
                            });
                        }
                    }
                });
            });
            
            setBacklinks(backlinksList);
            setIsLoading(false);
            
            // Update page title
            if (termData) {
                document.title = `${termData.term} - Brainworms Glossary`;
            }
        }
        fetchData();
    }, [categorySlug, termSlug]);

    if (isLoading) {
        return (
            <div className="loading-indicator">
                <div className="loading-spinner"></div>
                <div className="loading-text">Loading term...</div>
            </div>
        );
    }

    if (!term || !category) {
        return <div className="post reply">Term not found.</div>;
    }

    // Prepare meta data
    const metaDescription = truncateDescription(term.definition);
    const metaImage = term.images && term.images.length > 0
        ? getAbsoluteImageUrl(`./${term.images[0]}`)
        : getAbsoluteImageUrl('./Brainworms Glossary_files/images/OP.webp');
    const currentUrl = window.location.href;

    return (
        <div className="page-content loaded" ref={lightboxContainerRef}>
            <Helmet>
                <title>{term.term} - Brainworms Glossary</title>
                
                {/* Open Graph tags */}
                <meta property="og:title" content={`${term.term} - Brainworms Glossary`} />
                <meta property="og:description" content={metaDescription} />
                <meta property="og:type" content="article" />
                <meta property="og:url" content={currentUrl} />
                {metaImage && <meta property="og:image" content={metaImage} />}
                
                {/* Twitter Card tags */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={`${term.term} - Brainworms Glossary`} />
                <meta name="twitter:description" content={metaDescription} />
                {metaImage && <meta name="twitter:image" content={metaImage} />}
            </Helmet>
            {/* Single consolidated term post */}
            <div className="postContainer replyContainer" id={`${category.id}.term1`} data-full-i-d={`${category.id}.term1`}>
                <div className="replacedSideArrows" id="sa1">
                    <a className="hide-reply-button" href="javascript:;"></a>
                </div>
                <div id="p1" className="post reply">
                    <div className={`postInfo ${category.icon ? 'postInfo-with-icon' : ''}`} id="pi1">
                        <div className="postInfo-left">
                            <input type="checkbox" name="1" value="delete" />
                            <span className="nameBlock">
                                <span className="name post-name-prominent">{term.term}</span>
                            </span>
                        </div>
                        {category.icon && (
                            <div className="postInfo-icon">
                                <CategoryIcon 
                                    icon={category.icon} 
                                    displayName={category.displayName}
                                    size="30px"
                                    categoryUrlSlug={category.urlSlug}
                                    categoryId={category.id}
                                />
                            </div>
                        )}
                    </div>
                    
                    {term.images && term.images.length > 0 && (
                        <div className="file" id="f1">
                            <a className="fileThumb" href={`./${term.images[0]}`}>
                                <img src={`./${term.images[0]}`} alt={term.term} />
                            </a>
                            <div className="fileText" id="fT1">
                                <FileInfo imagePath={`./${term.images[0]}`} />
                            </div>
                        </div>
                    )}
                    
                    <blockquote className="postMessage" id="m1">
                        {/* Term title in greentext - only show if has image */}
                        {term.images && term.images.length > 0 && (
                            <>
                                <span className="quote">&gt;{term.term}</span>
                                <br />
                            </>
                        )}
                        
                        {/* Term definition */}
                        <AutoLinkText 
                            text={term.definition} 
                            currentTermName={term.term}
                            currentCategoryId={category.id}
                            isTermDetailView={true}
                        />
                        <br />
                        <hr />
                        
                        {/* Category */}
                        <strong className="metadata-label">Category:</strong>{' '}
                        <Tooltip
                            categoryId={category.id}
                            isCategory={true}
                        >
                            <Link to={`/category/${category.urlSlug}`} className="quotelink">
                                {category.displayName}
                            </Link>
                        </Tooltip>
                        
                        {/* Related terms */}
                        {term.relatedTerms && term.relatedTerms.length > 0 && (
                            <>
                                <br /><br />
                                <strong className="metadata-label">Related Terms:</strong>{' '}
                                <RelatedTermsLinks 
                                    relatedTerms={term.relatedTerms}
                                    categoryId={category.id}
                                />
                            </>
                        )}
                        
                        {/* Secondary categories */}
                        {term.secondaryCategories && term.secondaryCategories.length > 0 && (
                            <>
                                <br /><br />
                                <strong className="metadata-label">Secondary Categories:</strong>{' '}
                                <SecondaryCategoriesLinks 
                                    categories={term.secondaryCategories}
                                    currentCategory={category.displayName}
                                />
                            </>
                        )}
                        
                        {/* Backlinks section if any */}
                        {backlinks.length > 0 && (
                            <>
                                <br /><br />
                                <strong className="metadata-label">Referenced by:</strong>{' '}
                                {backlinks.map((backlink, index) => (
                                    <span key={`${backlink.categoryId}-${backlink.term.slug}`}>
                                        <Tooltip
                                            termPath={`${backlink.categoryInfo.urlSlug}/term/${backlink.term.slug}`}
                                            categoryId={backlink.categoryId}
                                        >
                                            <Link 
                                                to={`/term/${backlink.term.slug}`}
                                                className="quotelink"
                                            >
                                                {backlink.term.term}
                                            </Link>
                                        </Tooltip>
                                        {index < backlinks.length - 1 && ', '}
                                    </span>
                                ))}
                            </>
                        )}
                    </blockquote>
                </div>
            </div>
        </div>
    );
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Helper component for related terms links
function RelatedTermsLinks({ relatedTerms, categoryId }) {
    const [links, setLinks] = useState(null);
    
    useEffect(() => {
        async function loadLinks() {
            const allData = await glossaryService.getAllData();
            const validLinks = [];
            
            for (const relatedTerm of relatedTerms) {
                const termData = await findTermByName(relatedTerm, allData);
                if (termData) {
                    const { term: foundTerm, categoryId: foundCategoryId } = termData;
                    const termSlug = foundTerm.slug;
                    const linkPath = `term/${termSlug}`;
                    
                    validLinks.push({
                        path: linkPath,
                        name: relatedTerm,
                        categoryId: foundCategoryId
                    });
                }
            }
            
            setLinks(validLinks);
        }
        
        loadLinks();
    }, [relatedTerms, categoryId]);
    
    if (!links) return null;
    
    return (
        <>
            {links.map((link, index) => (
                <span key={link.name}>
                    <Tooltip
                        termPath={link.path}
                        categoryId={link.categoryId}
                    >
                        <Link 
                            to={`/${link.path}`} 
                            className="quotelink"
                        >
                            {link.name}
                        </Link>
                    </Tooltip>
                    {index < links.length - 1 && ', '}
                </span>
            ))}
        </>
    );
}

// Helper component for secondary categories links
function SecondaryCategoriesLinks({ categories, currentCategory }) {
    const filteredCategories = categories.filter(cat => cat !== currentCategory);
    
    if (filteredCategories.length === 0) return null;
    
    return (
        <>
            {filteredCategories.map((categoryName, index) => {
                const categoryId = Object.keys(categoryMap).find(id => 
                    categoryMap[id].displayName === categoryName
                );
                
                if (!categoryId) return null;
                
                const catInfo = categoryMap[categoryId];
                
                return (
                    <span key={categoryName}>
                        <Tooltip
                            categoryId={categoryId}
                            isCategory={true}
                        >
                            <Link 
                                to={`/category/${catInfo.urlSlug}`}
                                className="quotelink"
                            >
                                {categoryName}
                            </Link>
                        </Tooltip>
                        {index < filteredCategories.length - 1 && ', '}
                    </span>
                );
            })}
        </>
    );
}

// Helper function to find term by name
async function findTermByName(searchTerm, allData) {
    const searchLower = searchTerm.toLowerCase();
    
    for (const [catId, category] of Object.entries(allData.categories)) {
        const foundTerm = category.terms.find(t => 
            t.term.toLowerCase() === searchLower
        );
        if (foundTerm) {
            return { term: foundTerm, categoryId: catId };
        }
    }
    
    return null;
}