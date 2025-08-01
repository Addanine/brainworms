// src/components/AutoLinkText.jsx
import { Link } from 'react-router-dom';
import React, { Fragment } from 'react';
import { useState, useEffect } from 'react';
import { glossaryService } from '../services/glossaryService';
import Tooltip from './Tooltip';

export default function AutoLinkText({ 
    text, 
    currentTermName = null, 
    currentCategoryId = null, 
    isTermDetailView = false 
}) {
    const [termMap, setTermMap] = useState(new Map());
    const [termVariations, setTermVariations] = useState(new Map());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadMaps() {
            const [map, variations] = await Promise.all([
                glossaryService.getTermMap(),
                glossaryService.getTermVariations()
            ]);
            setTermMap(map);
            setTermVariations(variations);
            setIsLoading(false);
        }
        loadMaps();
    }, []);

    if (isLoading || !text) {
        return text;
    }

    // Create array of all terms sorted by length (longest first to match more specific terms first)
    const allTerms = [];
    
    // Add main terms
    termMap.forEach((value, key) => {
        allTerms.push({
            searchTerm: key,
            originalTerm: value.originalTerm,
            linkPath: value.linkPath,
            categoryId: value.categoryId
        });
    });
    
    // Add variations
    termVariations.forEach((value, key) => {
        allTerms.push({
            searchTerm: key,
            originalTerm: value.originalTerm,
            linkPath: value.linkPath,
            categoryId: value.categoryId
        });
    });
    
    // Sort by length (longest first)
    allTerms.sort((a, b) => b.searchTerm.length - a.searchTerm.length);
    
    // Keep track of replacements to avoid overlapping
    const replacements = [];
    
    // Keep track of which terms have already been linked (by originalTerm)
    const linkedTerms = new Set();
    
    // Find all matches
    allTerms.forEach(termData => {
        const { searchTerm, originalTerm, linkPath, categoryId } = termData;
        
        // Skip if we've already linked this term (by original name)
        if (linkedTerms.has(originalTerm.toLowerCase())) {
            return;
        }
        
        // Don't link a term to itself on its own detail page
        if (isTermDetailView && currentTermName && 
            originalTerm.toLowerCase() === currentTermName.toLowerCase()) {
            return;
        }
        
        // Skip if it's in the same category on category view (not detail view)
        if (!isTermDetailView && currentCategoryId && categoryId === currentCategoryId) {
            return;
        }
        
        // Create regex for whole word matching
        const regex = new RegExp(`\\b${escapeRegex(searchTerm)}\\b`, 'gi');
        
        let match;
        while ((match = regex.exec(text)) !== null) {
            const start = match.index;
            const end = match.index + match[0].length;
            
            // Check if this position overlaps with any existing replacement
            let overlaps = false;
            for (const rep of replacements) {
                if ((start >= rep.start && start < rep.end) || 
                    (end > rep.start && end <= rep.end)) {
                    overlaps = true;
                    break;
                }
            }
            
            if (!overlaps) {
                replacements.push({
                    start,
                    end,
                    originalText: match[0],
                    linkPath,
                    originalTerm,
                    categoryId
                });
                linkedTerms.add(originalTerm.toLowerCase());
            }
        }
    });
    
    // Sort replacements by position
    replacements.sort((a, b) => a.start - b.start);
    
    // Build the result
    const result = [];
    let lastIndex = 0;
    
    replacements.forEach((replacement, index) => {
        // Add text before this replacement
        if (replacement.start > lastIndex) {
            result.push(
                <Fragment key={`text-${index}`}>
                    {text.substring(lastIndex, replacement.start)}
                </Fragment>
            );
        }
        
        // Add the link with tooltip
        result.push(
            <Tooltip 
                key={`tooltip-${index}`}
                termPath={replacement.linkPath}
                categoryId={replacement.categoryId}
            >
                <Link 
                    to={`/${replacement.linkPath}`}
                    className="term-link"
                >
                    {replacement.originalText}
                </Link>
            </Tooltip>
        );
        
        lastIndex = replacement.end;
    });
    
    // Add any remaining text
    if (lastIndex < text.length) {
        result.push(
            <Fragment key="text-final">
                {text.substring(lastIndex)}
            </Fragment>
        );
    }
    
    return <>{result}</>;
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}