// src/components/Lightbox.jsx
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLightbox } from '../hooks/useLightbox';

export default function Lightbox() {
    const { lightboxState, closeLightbox, navigateLightbox } = useLightbox();
    const { isOpen, currentIndex, images } = lightboxState;
    const preloadedImages = useRef(new Set());
    const cardRef = useRef(null);
    const imageRef = useRef(null);
    const [cardWidth, setCardWidth] = useState('auto');

    // Handle keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeydown = (e) => {
            switch(e.key) {
                case 'Escape':
                    closeLightbox();
                    break;
                case 'ArrowLeft':
                    navigateLightbox(-1);
                    break;
                case 'ArrowRight':
                    navigateLightbox(1);
                    break;
            }
        };

        document.addEventListener('keydown', handleKeydown);
        return () => document.removeEventListener('keydown', handleKeydown);
    }, [isOpen, closeLightbox, navigateLightbox]);

    // Preload adjacent images
    useEffect(() => {
        if (!isOpen || images.length === 0) return;

        const preloadCount = 2; // Number of images to preload in each direction
        
        for (let i = 1; i <= preloadCount; i++) {
            // Preload next images
            const nextIndex = (currentIndex + i) % images.length;
            if (images[nextIndex] && !preloadedImages.current.has(nextIndex)) {
                const img = new Image();
                img.src = images[nextIndex].src;
                preloadedImages.current.add(nextIndex);
            }
            
            // Preload previous images
            const prevIndex = (currentIndex - i + images.length) % images.length;
            if (images[prevIndex] && !preloadedImages.current.has(prevIndex)) {
                const img = new Image();
                img.src = images[prevIndex].src;
                preloadedImages.current.add(prevIndex);
            }
        }
    }, [currentIndex, images, isOpen]);

    const currentImageSrc = images[currentIndex]?.src;

    // Step 1: When the image changes, reset the card's width.
    // This allows the new image to render without being constrained by the old width.
    useEffect(() => {
        if (isOpen) {
            setCardWidth('auto');
        }
    }, [isOpen, currentImageSrc]);

    // Step 2: After the width has been reset and the image has loaded,
    // measure the image's rendered width and set the card's width to match.
    useEffect(() => {
        const imgElement = imageRef.current;
        
        // Only run this effect after the width has been reset to 'auto'.
        if (isOpen && cardWidth === 'auto' && imgElement) {
            const setFinalWidth = () => {
                const imageRenderedWidth = imgElement.clientWidth;
                if (imageRenderedWidth > 0) {
                    setCardWidth(`${imageRenderedWidth}px`);
                }
            };

            // If the image is already loaded (e.g., from cache), measure it.
            // Otherwise, wait for the 'load' event.
            if (imgElement.complete) {
                setFinalWidth();
            } else {
                imgElement.addEventListener('load', setFinalWidth);
            }

            // Cleanup the event listener.
            return () => {
                imgElement.removeEventListener('load', setFinalWidth);
            };
        }
    }, [isOpen, cardWidth]);

    if (!isOpen || !images[currentIndex]) return null;

    const currentImage = images[currentIndex];

    return (
        <div 
            className="lightbox-overlay active"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    closeLightbox();
                }
            }}
        >
            <div className="lightbox-content">
                <button 
                    className="lightbox-close" 
                    onClick={closeLightbox}
                    aria-label="Close lightbox"
                >
                    &times;
                </button>
                
                <div className="lightbox-card" ref={cardRef} style={{ width: cardWidth }}>
                    <div className="lightbox-image-wrapper">
                        <img 
                            ref={imageRef}
                            className="lightbox-image" 
                            src={currentImage.src} 
                            alt={currentImage.alt || ''}
                        />
                    </div>
                    
                    <div className="lightbox-info">
                        <button 
                            className="lightbox-nav lightbox-prev" 
                            onClick={() => navigateLightbox(-1)}
                            aria-label="Previous image"
                        >
                            ‹
                        </button>
                        
                        <div className="lightbox-counter">
                            {currentIndex + 1} / {images.length}
                        </div>
                        
                        {currentImage.termName && (
                            <h3 className="lightbox-term">
                                {currentImage.linkPath ? (
                                    <Link 
                                        to={currentImage.linkPath} 
                                        onClick={closeLightbox}
                                    >
                                        {currentImage.termName}
                                    </Link>
                                ) : (
                                    currentImage.termName
                                )}
                            </h3>
                        )}
                        
                        {currentImage.definition && (
                            <p className="lightbox-definition">
                                {currentImage.linkPath ? (
                                    <Link 
                                        to={currentImage.linkPath} 
                                        onClick={closeLightbox}
                                    >
                                        {currentImage.definition}
                                    </Link>
                                ) : (
                                    currentImage.definition
                                )}
                            </p>
                        )}
                        
                        <button 
                            className="lightbox-nav lightbox-next" 
                            onClick={() => navigateLightbox(1)}
                            aria-label="Next image"
                        >
                            ›
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}