// src/hooks/useImageLightbox.js
import { useEffect, useRef } from 'react';
import { useLightbox } from './useLightbox';

export function useImageLightbox() {
    const { openLightbox } = useLightbox();
    const containerRef = useRef(null);
    
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        
        // Collect all images on the page
        const collectImages = () => {
            const images = [];
            const fileThumbLinks = container.querySelectorAll('.fileThumb');
            
            fileThumbLinks.forEach((link, index) => {
                const img = link.querySelector('img');
                if (!img) return;
                
                // Get the parent post for term information
                const post = link.closest('.post');
                const nameBlock = post?.querySelector('.nameBlock .name');
                const postMessage = post?.querySelector('.postMessage');
                
                // Extract term name and link
                let termName = '';
                let linkPath = '';
                let definition = '';
                
                if (nameBlock) {
                    const linkElement = nameBlock.querySelector('a');
                    if (linkElement) {
                        termName = linkElement.textContent;
                        const href = linkElement.getAttribute('href');
                        if (href && href.startsWith('#')) {
                            linkPath = href.substring(1); // Remove #
                        }
                    } else {
                        termName = nameBlock.textContent.trim();
                    }
                }
                
                // Get first line of definition (before any <br> or metadata)
                if (postMessage) {
                    const firstTextNode = postMessage.childNodes[0];
                    if (firstTextNode && firstTextNode.nodeType === Node.TEXT_NODE) {
                        definition = firstTextNode.textContent.trim();
                    } else {
                        // Try to get text content before first BR
                        const clone = postMessage.cloneNode(true);
                        const br = clone.querySelector('br');
                        if (br) {
                            br.parentNode.removeChild(br);
                        }
                        definition = clone.textContent.trim().substring(0, 200) + '...';
                    }
                }
                
                images.push({
                    src: img.src,
                    alt: img.alt || termName,
                    termName: termName,
                    definition: definition,
                    linkPath: linkPath ? `/${linkPath}` : '',
                    index: index
                });
            });
            
            return images;
        };
        
        // Add click handlers
        const handleClick = (e) => {
            const link = e.target.closest('.fileThumb');
            if (!link) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            const images = collectImages();
            const clickedIndex = Array.from(container.querySelectorAll('.fileThumb')).indexOf(link);
            
            if (clickedIndex !== -1) {
                openLightbox(images, clickedIndex);
            }
        };
        
        container.addEventListener('click', handleClick);
        
        return () => {
            container.removeEventListener('click', handleClick);
        };
    }, [openLightbox]);
    
    return containerRef;
}