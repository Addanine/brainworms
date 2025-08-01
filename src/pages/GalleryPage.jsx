// src/pages/GalleryPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { glossaryService } from '../services/glossaryService';
import { useLightbox } from '../hooks/useLightbox';

export default function GalleryPage() {
    const [termsWithImages, setTermsWithImages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { openLightbox } = useLightbox();

    useEffect(() => {
        document.title = 'Gallery - Brainworms Glossary';
        
        async function fetchData() {
            setIsLoading(true);
            
            const allData = await glossaryService.getAllData();
            const imagesTerms = [];
            
            // Collect all categories that have images
            Object.entries(allData.categories).forEach(([categoryId, category]) => {
                if (category.categoryImage) {
                    imagesTerms.push({
                        term: category.displayName,
                        definition: category.description,
                        image: category.categoryImage,
                        categoryId,
                        categoryName: category.displayName,
                        categorySlug: category.urlSlug,
                        isCategory: true,
                        slug: category.urlSlug
                    });
                }
                
                // Collect all terms that have images
                category.terms.forEach(term => {
                    if (term.images && term.images.length > 0) {
                        // Add each image as a separate gallery item
                        term.images.forEach(imagePath => {
                            // Extract just the filename from the path
                            const filename = imagePath.split('/').pop();
                            imagesTerms.push({
                                ...term,
                                image: filename,
                                categoryId,
                                categoryName: category.displayName,
                                categorySlug: category.urlSlug,
                                isCategory: false
                            });
                        });
                    }
                });
            });
            
            // Sort alphabetically by term name
            imagesTerms.sort((a, b) => a.term.localeCompare(b.term));
            
            setTermsWithImages(imagesTerms);
            setIsLoading(false);
        }
        
        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="loading-indicator">
                <div className="loading-spinner"></div>
                <div className="loading-text">Loading gallery...</div>
            </div>
        );
    }

    // Prepare lightbox images
    const lightboxImages = termsWithImages.map(term => ({
        src: `./Brainworms Glossary_files/images/${term.image}`,
        alt: term.term,
        termName: term.term + (term.isCategory ? ' (category)' : ''),
        definition: term.definition,
        linkPath: term.isCategory ? `/category/${term.categorySlug}` : `/term/${term.slug}`,
        isCategory: term.isCategory
    }));

    const handleImageClick = (e, index) => {
        e.preventDefault();
        openLightbox(lightboxImages, index);
    };

    return (
        <>
            {/* Gallery header post */}
            <div className="postContainer replyContainer" data-full-i-d="gallery.1" id="gallery.1">
                <div id="p1" className="post reply">
                    <div className="postInfo" id="pi1">
                        <input type="checkbox" name="1" value="delete" />
                        <span className="nameBlock">
                            <span className="name post-name-regular">Image Gallery</span>
                        </span>
                    </div>
                    <blockquote className="postMessage" id="m1">
                        All terms with associated images. Click on any image to view the lightbox gallery.
                        <br /><br />
                        <span className="quote">&gt;Total images: {termsWithImages.length}</span>
                    </blockquote>
                </div>
            </div>


            {/* Gallery grid */}
            <div className="gallery-container">
                {termsWithImages.map((term, index) => (
                    <div key={`${term.categoryId}-${term.slug}`} className="gallery-item">
                        <div 
                            className="gallery-image"
                            onClick={(e) => handleImageClick(e, index)}
                            style={{ cursor: 'pointer' }}
                        >
                            <img 
                                src={`./Brainworms Glossary_files/images/${term.image}`}
                                alt={term.term}
                                loading="lazy"
                            />
                        </div>
                        <div className="gallery-caption">
                            <Link 
                                to={term.isCategory ? `/category/${term.categorySlug}` : `/term/${term.slug}`}
                                className="gallery-link"
                            >
                                <strong>{term.term}{term.isCategory ? ' (category)' : ''}</strong>
                                <div className="gallery-definition">{term.definition}</div>
                            </Link>
                            {!term.isCategory && (
                                <Link to={`/category/${term.categorySlug}`} className="gallery-category-link">
                                    <span className="gallery-category">{term.categoryName}</span>
                                </Link>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}