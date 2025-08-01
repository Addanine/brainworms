// src/pages/CategoryPage.jsx
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { glossaryService } from '../services/glossaryService';
import TermCard from '../components/TermCard';
import AutoLinkText from '../components/AutoLinkText';
import FileInfo from '../components/FileInfo';
import CategoryIcon from '../components/CategoryIcon';
import { useImageLightbox } from '../hooks/useImageLightbox';
import { truncateDescription, getAbsoluteImageUrl } from '../utils/metaUtils';

export default function CategoryPage() {
    const { categorySlug } = useParams();
    const [category, setCategory] = useState(null);
    const [dataCache, setDataCache] = useState({});
    const [secondaryTerms, setSecondaryTerms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const lightboxContainerRef = useImageLightbox();

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            
            // Load all data we need
            const [categoryData, cache, , allData] = await Promise.all([
                glossaryService.getCategoryBySlug(categorySlug),
                glossaryService.getDataCache(),
                glossaryService.getCategories(),
                glossaryService.getAllData()
            ]);
            
            if (!categoryData) {
                setIsLoading(false);
                return;
            }
            
            setCategory(categoryData);
            setDataCache(cache);
            
            // Find all secondary terms for this category
            const secondaryTermsList = [];
            Object.entries(allData.categories).forEach(([catId, catData]) => {
                if (catId !== categoryData.id) {
                    catData.terms.forEach(term => {
                        if (term.secondaryCategories && 
                            term.secondaryCategories.includes(categoryData.displayName)) {
                            secondaryTermsList.push({
                                ...term,
                                sourceCategoryId: catId,
                                sourceCategoryName: catData.displayName,
                                sourceCategoryIcon: catData.icon,
                                sourceCategoryUrlSlug: catData.urlSlug
                            });
                        }
                    });
                }
            });
            setSecondaryTerms(secondaryTermsList);
            
            setIsLoading(false);
            
            // Update page title
            if (categoryData) {
                document.title = `Category: ${categoryData.displayName} - Brainworms Glossary`;
            }
        }
        fetchData();
    }, [categorySlug]);

    if (isLoading) {
        return (
            <div className="loading-indicator">
                <div className="loading-spinner"></div>
                <div className="loading-text">Loading category...</div>
            </div>
        );
    }

    if (!category) {
        return <div className="post reply">Category not found.</div>;
    }

    
    // Get raw category data for intro
    const rawCategoryData = dataCache[category.id];
    
    // Sort terms: defining term first, then alphabetically
    const sortedTerms = [...category.terms].sort((a, b) => {
        if (a.isDefiningTerm) return -1;
        if (b.isDefiningTerm) return 1;
        return a.term.localeCompare(b.term);
    });

    // Prepare meta data
    const metaDescription = truncateDescription(rawCategoryData?.description || category.description);
    const metaImage = rawCategoryData?.categoryImage 
        ? getAbsoluteImageUrl(`./Brainworms Glossary_files/images/${rawCategoryData.categoryImage}`)
        : getAbsoluteImageUrl('./Brainworms Glossary_files/images/OP.webp');
    const currentUrl = window.location.href;

    return (
        <div className="page-content loaded" ref={lightboxContainerRef}>
            <Helmet>
                <title>{category.displayName} - Brainworms Glossary</title>
                
                {/* Open Graph tags */}
                <meta property="og:title" content={`${category.displayName} - Brainworms Glossary`} />
                <meta property="og:description" content={metaDescription} />
                <meta property="og:type" content="article" />
                <meta property="og:url" content={currentUrl} />
                {metaImage && <meta property="og:image" content={metaImage} />}
                
                {/* Twitter Card tags */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={`${category.displayName} - Brainworms Glossary`} />
                <meta name="twitter:description" content={metaDescription} />
                {metaImage && <meta name="twitter:image" content={metaImage} />}
            </Helmet>
            {/* Category intro post */}
            <div className="postContainer replyContainer" data-full-i-d={`${category.id}.intro`} id={`${category.id}.intro`}>
                <div className="replacedSideArrows" id={`sa${category.id}intro`}>
                    <a className="hide-reply-button" href="javascript:;"></a>
                </div>
                <div id={`p${category.id}intro`} className="post reply">
                    <div className={`postInfo ${category.icon ? 'postInfo-with-icon' : ''}`} id={`pi${category.id}intro`}>
                        <div className="postInfo-left">
                            <input type="checkbox" name={`${category.id}intro`} value="delete" />
                            <span className="nameBlock">
                                <span className="name post-name-prominent">{category.displayName}</span>
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
                                    currentCategoryId={category.id}
                                />
                            </div>
                        )}
                    </div>
                    {rawCategoryData.categoryImage && (
                        <div className="file" id={`f${category.id}intro`}>
                            <a className="fileThumb" href={`./Brainworms Glossary_files/images/${rawCategoryData.categoryImage}`}>
                                <img 
                                    src={`./Brainworms Glossary_files/images/${rawCategoryData.categoryImage}`} 
                                    alt={category.displayName}
                                />
                            </a>
                            <div className="fileText" id={`fT${category.id}intro`}>
                                <FileInfo imagePath={`./Brainworms Glossary_files/images/${rawCategoryData.categoryImage}`} />
                            </div>
                        </div>
                    )}
                    <blockquote className="postMessage" id={`m${category.id}intro`}>
                        {/* Category title in greentext */}
                        <span className="quote">&gt;{category.displayName}</span>
                        <br />
                        <AutoLinkText 
                            text={rawCategoryData.description || category.description} 
                            currentCategoryId={category.id}
                            isTermDetailView={false}
                        />
                    </blockquote>
                </div>
            </div>

            {/* Index navigation post */}
            <div data-full-i-d={`${category.id}.2`} id={`${category.id}.2`} className="postContainer replyContainer">
                <div className="replacedSideArrows" id="sa2">
                    <a className="hide-reply-button" href="javascript:;"></a>
                </div>
                <div id="p2" className="post reply">
                    <div className="postInfo" id="pi2">
                        <input type="checkbox" name="2" value="delete" />
                        <span className="nameBlock">
                            <span className="name post-name-regular">Index</span>
                        </span>
                    </div>
                    <blockquote className="postMessage index-links" id="m2">
                        {/* List all terms on this page with anchor links */}
                        {sortedTerms.map((term, index) => (
                            <span key={term.slug}>
                                <a 
                                    href={`#${category.id}.term${term.postNum}`} 
                                    className="quotelink"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        const element = document.getElementById(`${category.id}.term${term.postNum}`);
                                        if (element) {
                                            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                                            const offsetPosition = elementPosition - 71; // 26px header + 45px extra
                                            window.scrollTo({
                                                top: offsetPosition,
                                                behavior: 'smooth'
                                            });
                                        }
                                    }}
                                >
                                    &gt;&gt;{term.term}
                                </a>
                                {index < sortedTerms.length - 1 && <br />}
                            </span>
                        ))}
                        {/* Secondary terms */}
                        {secondaryTerms.length > 0 && (
                            <>
                                {sortedTerms.length > 0 && <br />}
                                {secondaryTerms.map((term, index) => (
                                    <span key={`secondary-${term.slug}`}>
                                        <a 
                                            href={`#${category.id}.term${term.postNum}`} 
                                            className="quotelink"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                const element = document.getElementById(`${category.id}.term${term.postNum}`);
                                                if (element) {
                                                    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                                                    const offsetPosition = elementPosition - 71; // 26px header + 45px extra
                                                    window.scrollTo({
                                                        top: offsetPosition,
                                                        behavior: 'smooth'
                                                    });
                                                }
                                            }}
                                        >
                                            &gt;&gt;{term.term}
                                        </a>
                                        {index < secondaryTerms.length - 1 && <br />}
                                    </span>
                                ))}
                            </>
                        )}
                    </blockquote>
                </div>
            </div>

            {/* Primary terms for this category */}
            {sortedTerms.map(term => (
                <TermCard 
                    key={term.slug} 
                    term={term} 
                    categoryInfo={category}
                    categoryId={category.id}
                    isPrimary={true}
                />
            ))}

            {/* Secondary terms from other categories */}
            {secondaryTerms.map(term => (
                <TermCard 
                    key={`secondary-${term.categoryId}-${term.slug}`} 
                    term={term} 
                    categoryInfo={category}
                    categoryId={category.id}
                    isPrimary={false}
                    sourceCategoryName={term.sourceCategoryName}
                />
            ))}
        </div>
    );
}