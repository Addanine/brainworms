// src/components/Tooltip.jsx
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { glossaryService } from '../services/glossaryService';

export default function Tooltip({ children, termPath, categoryId, isCategory = false, isGreentextMainPage = false, termData = null }) {
    const [isHovered, setIsHovered] = useState(false);
    const [tooltipData, setTooltipData] = useState(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isPositioned, setIsPositioned] = useState(false);
    const linkRef = useRef(null);
    const tooltipRef = useRef(null);
    const hoverTimeoutRef = useRef(null);
    const location = useLocation();

    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
        };
    }, []);

    const handleMouseEnter = async (e) => {
        // Disable tooltips on mobile devices
        if (window.matchMedia('(max-width: 480px)').matches) {
            return;
        }
        
        // Check if the link points to the current page
        if (isCategory && termPath) {
            // For category links, check if we're already on this category page
            const categoryPath = termPath; // termPath is like "/category/categorySlug"
            if (location.pathname === categoryPath) {
                return; // Don't show tooltip if we're already on this category page
            }
        } else if (termPath && !isCategory) {
            // For term links, check if we're already on this term page
            if (location.pathname.includes(termPath)) {
                return; // Don't show tooltip if we're already on this term page
            }
        }
        
        const rect = e.currentTarget.getBoundingClientRect();
        // Calculate initial position
        const yOffset = isCategory ? 25 : 5;
        setPosition({
            x: rect.left + window.scrollX,
            y: rect.top + window.scrollY - yOffset
        });
        setIsPositioned(false);

        hoverTimeoutRef.current = setTimeout(async () => {
            setIsHovered(true);
            
            if (isGreentextMainPage && termData) {
                // Don't show any tooltip for greentext links on main page
                return;
            } else if (isCategory) {
                // Handle category tooltip
                const allData = await glossaryService.getAllData();
                const categoryData = allData.categories[categoryId];
                
                if (categoryData) {
                    
                    setTooltipData({
                        term: `${categoryData.displayName} (category)`,
                        definition: categoryData.description,
                        isCategory: true,
                        image: null  // Don't show images for category tooltips
                    });
                }
            } else {
                // Parse the term path to get term slug
                const pathParts = termPath.split('/');
                const termSlug = pathParts[pathParts.length - 1];
                
                // Get all data and find the term
                const allData = await glossaryService.getAllData();
                const categories = allData.categories[categoryId];
                
                if (categories) {
                    const term = categories.terms.find(t => t.slug === termSlug);
                    if (term) {
                        setTooltipData({
                            term: term.term,
                            definition: term.definition,
                            categoryName: categories.displayName,
                            image: term.images && term.images.length > 0 ? term.images[0] : null
                        });
                    }
                }
            }
        }, 300); // 300ms delay before showing tooltip
    };

    const handleMouseLeave = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
        setIsHovered(false);
        setTooltipData(null);
        setIsPositioned(false);
    };

    // Adjust position only once when tooltip first appears
    useEffect(() => {
        if (isHovered && tooltipRef.current && linkRef.current && !isPositioned) {
            const tooltip = tooltipRef.current;
            const tooltipRect = tooltip.getBoundingClientRect();
            const linkRect = linkRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            
            let newX = position.x;
            let newY = position.y - tooltipRect.height;
            
            // Check right edge
            if (newX + tooltipRect.width > viewportWidth - 10) {
                newX = viewportWidth - tooltipRect.width - 10;
            }
            
            // Check left edge
            if (newX < 10) {
                newX = 10;
            }
            
            // Check top edge - if tooltip would go off top, position below instead
            if (newY < 10) {
                newY = linkRect.bottom + window.scrollY + 5;
            }
            
            // Update position and mark as positioned
            setPosition({ x: newX, y: newY });
            setIsPositioned(true);
        }
    }, [isHovered, isPositioned, position.x, position.y]); // Include position dependencies

    return (
        <>
            <span 
                ref={linkRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{ position: 'relative' }}
            >
                {children}
            </span>
            {isHovered && tooltipData && createPortal(
                <div 
                    ref={tooltipRef}
                    className="tooltip-container"
                    style={{
                        position: 'absolute',
                        left: `${position.x}px`,
                        top: `${position.y}px`,
                        zIndex: 1000
                    }}
                >
                    <div className="preview post reply">
                        <>
                                {tooltipData.image && (
                                    <div style={{ 
                                        background: '#eef2ff',
                                        width: '100%',
                                        height: '150px',
                                        overflow: 'hidden'
                                    }}>
                                        <img 
                                            src={`./${tooltipData.image}`} 
                                            alt={tooltipData.term}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                display: 'block'
                                            }}
                                        />
                                    </div>
                                )}
                                <blockquote className="postMessage" style={{ 
                                    padding: '10px',
                                    margin: 0,
                                    borderTop: tooltipData.image ? '1px solid #b7c5d9' : 'none'
                                }}>
                                    <strong>{tooltipData.term}</strong><br />
                                    {tooltipData.definition}
                                </blockquote>
                            </>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}