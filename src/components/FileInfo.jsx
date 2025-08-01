// src/components/FileInfo.jsx
import { useState, useEffect } from 'react';

// Cache for image metadata to avoid repeated loading
const metadataCache = new Map();

export default function FileInfo({ imagePath }) {
    const [metadata, setMetadata] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Extract filename from path
    const filename = imagePath.split('/').pop();
    
    useEffect(() => {
        async function loadMetadata() {
            // Check cache first
            if (metadataCache.has(imagePath)) {
                setMetadata(metadataCache.get(imagePath));
                setIsLoading(false);
                return;
            }
            
            try {
                // Load image to get dimensions
                const img = new Image();
                const dimensionsPromise = new Promise((resolve, reject) => {
                    img.onload = () => resolve({ width: img.width, height: img.height });
                    img.onerror = reject;
                    img.src = imagePath;
                });
                
                // Try to get file size via fetch
                let fileSize = null;
                try {
                    const response = await fetch(imagePath, { method: 'HEAD' });
                    const contentLength = response.headers.get('content-length');
                    if (contentLength) {
                        fileSize = (parseInt(contentLength) / 1024).toFixed(1);
                    }
                } catch {
                    // If HEAD fails, try full GET
                    try {
                        const response = await fetch(imagePath);
                        const blob = await response.blob();
                        fileSize = (blob.size / 1024).toFixed(1);
                    } catch {
                        // Fallback estimate based on typical webp compression
                        console.log('Could not determine file size for', imagePath);
                    }
                }
                
                const dimensions = await dimensionsPromise;
                const result = {
                    width: dimensions.width,
                    height: dimensions.height,
                    fileSize: fileSize || '??'
                };
                
                // Cache the result
                metadataCache.set(imagePath, result);
                setMetadata(result);
            } catch (error) {
                console.error('Error loading image metadata:', error);
                setMetadata({ width: '??', height: '??', fileSize: '??' });
            } finally {
                setIsLoading(false);
            }
        }
        
        loadMetadata();
    }, [imagePath]);
    
    if (isLoading) {
        return (
            <span className="file-info">
                <a href={imagePath}>
                    <span className="fnswitch">
                        <span className="fntrunc">{filename}</span>
                        <span className="fnfull">{filename}</span>
                    </span>
                </a>
                <span className="image-info" data-src={imagePath}> (loading...)</span>
            </span>
        );
    }
    
    return (
        <span className="file-info">
            <a href={imagePath}>
                <span className="fnswitch">
                    <span className="fntrunc">{filename}</span>
                    <span className="fnfull">{filename}</span>
                </span>
            </a>
            <span className="image-info" data-src={imagePath}>
                {metadata && ` (${metadata.fileSize} KB, ${metadata.width}x${metadata.height})`}
            </span>
        </span>
    );
}