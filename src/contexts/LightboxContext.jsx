// src/contexts/LightboxContext.jsx
import { useState } from 'react';
import { LightboxContext } from './LightboxContextValue';

export function LightboxProvider({ children }) {
    const [lightboxState, setLightboxState] = useState({
        isOpen: false,
        currentIndex: 0,
        images: []
    });

    const openLightbox = (images, startIndex = 0) => {
        setLightboxState({
            isOpen: true,
            currentIndex: startIndex,
            images: images
        });
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    };

    const closeLightbox = () => {
        setLightboxState({
            isOpen: false,
            currentIndex: 0,
            images: []
        });
        document.body.style.overflow = ''; // Restore scrolling
    };

    const navigateLightbox = (direction) => {
        setLightboxState(prev => {
            let newIndex = prev.currentIndex + direction;
            
            // Wrap around
            if (newIndex < 0) {
                newIndex = prev.images.length - 1;
            } else if (newIndex >= prev.images.length) {
                newIndex = 0;
            }
            
            return {
                ...prev,
                currentIndex: newIndex
            };
        });
    };

    const value = {
        lightboxState,
        openLightbox,
        closeLightbox,
        navigateLightbox
    };

    return (
        <LightboxContext.Provider value={value}>
            {children}
        </LightboxContext.Provider>
    );
}