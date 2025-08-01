// src/components/TermCard.jsx
import { Link } from 'react-router-dom';
import AutoLinkText from './AutoLinkText';
import FileInfo from './FileInfo';
import Tooltip from './Tooltip';
import CategoryIcon from './CategoryIcon';
import { useState, useEffect } from 'react';
import { glossaryService, categoryMap } from '../services/glossaryService';

export default function TermCard({ 
    term, 
    categoryInfo, 
    categoryId,
    postNum,
    isPrimary = true,
    sourceCategoryName = null,
    isDetailPage = false 
}) {
    const [relatedTermsHTML, setRelatedTermsHTML] = useState('');
    const [secondaryCategoriesHTML, setSecondaryCategoriesHTML] = useState('');
    
    useEffect(() => {
        async function formatRelatedData() {
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

            // Helper function to format related terms
            async function formatRelatedTerms(relatedTerms) {
                const allData = await glossaryService.getAllData();
                const validLinks = [];
                
                for (const relatedTerm of relatedTerms) {
                    const termData = await findTermByName(relatedTerm, allData);
                    if (termData) {
                        const { term: foundTerm, categoryId: foundCategoryId } = termData;
                        const termSlug = foundTerm.slug;
                        const linkPath = `term/${termSlug}`;
                        
                        validLinks.push(
                            <Tooltip
                                key={relatedTerm}
                                termPath={linkPath}
                                categoryId={foundCategoryId}
                            >
                                <Link 
                                    to={`/${linkPath}`} 
                                    className="quotelink related-term-link"
                                >
                                    {relatedTerm}
                                </Link>
                            </Tooltip>
                        );
                    }
                }
                
                if (validLinks.length === 0) return null;
                
                return <>
                    {validLinks.map((link, index) => (
                        <span key={index}>
                            {link}
                            {index < validLinks.length - 1 && ', '}
                        </span>
                    ))}
                </>;
            }

            // Format related terms
            if (term.relatedTerms && term.relatedTerms.length > 0) {
                const relatedLinks = await formatRelatedTerms(term.relatedTerms);
                if (relatedLinks) {
                    setRelatedTermsHTML(relatedLinks);
                }
            }

            // Format secondary categories
            let categoriesToShow = [];
            
            // If this is a secondary term, include its primary category
            if (!isPrimary && sourceCategoryName) {
                categoriesToShow.push(sourceCategoryName);
            }
            
            // Add secondary categories, excluding the current category
            if (term.secondaryCategories && term.secondaryCategories.length > 0) {
                const otherCategories = term.secondaryCategories.filter(cat => cat !== categoryInfo.displayName);
                categoriesToShow = categoriesToShow.concat(otherCategories);
            }
            
            // Only show "Secondary Categories:" if there are categories to display
            if (categoriesToShow.length > 0) {
                const categoryLinks = formatSecondaryCategories(categoriesToShow);
                if (categoryLinks) {
                    setSecondaryCategoriesHTML(categoryLinks);
                }
            }
        }
        
        formatRelatedData();
    }, [term, categoryId, categoryInfo, isPrimary, sourceCategoryName]);


    function formatSecondaryCategories(categories) {
        const validLinks = [];
        
        categories.forEach(categoryName => {
            const categoryId = Object.keys(categoryMap).find(id => 
                categoryMap[id].displayName === categoryName
            );
            
            if (categoryId) {
                const catInfo = categoryMap[categoryId];
                validLinks.push(
                    <Tooltip
                        key={categoryName}
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
                );
            }
        });
        
        if (validLinks.length === 0) return null;
        
        return <>
            {validLinks.map((link, index) => (
                <span key={index}>
                    {link}
                    {index < validLinks.length - 1 && ', '}
                </span>
            ))}
        </>;
    }


    const actualPostNum = postNum || term.postNum;
    const termLink = `/term/${term.slug}`;

    return (
        <div className="postContainer replyContainer" id={`${categoryId}.term${actualPostNum}`} data-full-i-d={`${categoryId}.term${actualPostNum}`}>
            <div className="replacedSideArrows" id={`sa${actualPostNum}`}>
                <a className="hide-reply-button" href="javascript:;"></a>
            </div>
            <div id={`p${actualPostNum}`} className="post reply">
                <div className={`postInfo ${categoryInfo.icon ? 'postInfo-with-icon' : ''}`} id={`pi${actualPostNum}`}>
                    <div className="postInfo-left">
                        <input type="checkbox" name={actualPostNum} value="delete" />
                        <span className="nameBlock">
                            <span className="name post-name-regular">
                                {term.isDefiningTerm ? (
                                    <strong>
                                        {isDetailPage ? term.term : <Link to={termLink}>{term.term}</Link>}
                                    </strong>
                                ) : (
                                    isDetailPage ? term.term : <Link to={termLink}>{term.term}</Link>
                                )}
                            </span>
                        </span>
                    </div>
                    {(isPrimary ? categoryInfo.icon : (term.sourceCategoryIcon || categoryInfo.icon)) && (
                        <div className="postInfo-icon">
                            <CategoryIcon 
                                icon={isPrimary ? categoryInfo.icon : (term.sourceCategoryIcon || categoryInfo.icon)} 
                                displayName={isPrimary ? categoryInfo.displayName : (term.sourceCategoryName || categoryInfo.displayName)}
                                size="24px"
                                categoryUrlSlug={isPrimary ? categoryInfo.urlSlug : (term.sourceCategoryUrlSlug || categoryInfo.urlSlug)}
                                categoryId={isPrimary ? categoryInfo.id : (term.sourceCategoryId || categoryInfo.id)}
                                currentCategoryId={categoryInfo.id}
                            />
                        </div>
                    )}
                </div>
                
                {term.images && term.images.length > 0 && (
                    <div className="file" id={`f${actualPostNum}`}>
                        <a className="fileThumb" href={`./${term.images[0]}`}>
                            <img src={`./${term.images[0]}`} alt={term.term} />
                        </a>
                        <div className="fileText" id={`fT${actualPostNum}`}>
                            <FileInfo imagePath={`./${term.images[0]}`} />
                        </div>
                    </div>
                )}
                
                <blockquote className="postMessage" id={`m${actualPostNum}`}>
                    {/* Term title in greentext - only show if has image */}
                    {term.images && term.images.length > 0 && (
                        <>
                            <span className="quote">
                                &gt;<Link to={termLink} className="term-link">
                                    {term.term}
                                </Link>
                            </span>
                            <br />
                        </>
                    )}
                    
                    {/* Term definition */}
                    <AutoLinkText 
                        text={term.definition} 
                        currentTermName={term.term}
                        currentCategoryId={categoryId}
                        isTermDetailView={isDetailPage}
                    />
                    <br />
                    <hr />
                    
                    {/* Category - only show on detail pages */}
                    {isDetailPage && (
                        <>
                            <strong className="metadata-label">Category:</strong>{' '}
                            <Tooltip
                                categoryId={categoryId}
                                isCategory={true}
                            >
                                <Link to={`/category/${categoryInfo.urlSlug}`} className="quotelink">
                                    {categoryInfo.displayName}
                                </Link>
                            </Tooltip>
                        </>
                    )}
                    
                    {relatedTermsHTML && (
                        <>
                            <strong className="metadata-label">Related Terms:</strong> {relatedTermsHTML}
                        </>
                    )}
                    
                    {/* Secondary Categories - show as main category list on category pages */}
                    {secondaryCategoriesHTML && (
                        <>
                            {relatedTermsHTML && (
                                <>
                                    <br />
                                    <br />
                                </>
                            )}
                            <strong className="metadata-label">Secondary Categories:</strong> {secondaryCategoriesHTML}
                        </>
                    )}
                </blockquote>
            </div>
        </div>
    );
}