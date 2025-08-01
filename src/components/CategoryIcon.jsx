// src/components/CategoryIcon.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Tooltip from './Tooltip';

export default function CategoryIcon({ icon, displayName, size = '2.7em', categoryUrlSlug, currentCategoryId, categoryId }) {
    if (!icon) return null;
    
    // Generate class name from icon filename
    const className = icon.replace('.svg', '').toLowerCase() + '-icon';
    
    // Determine if we're on a nested page (category/term page) by checking URL
    const isNestedPage = window.location.pathname.includes('/category/') || 
                        window.location.pathname.includes('/term/');
    const iconPath = isNestedPage 
        ? `../Brainworms Glossary_files/svg-icons/${icon}`
        : `./Brainworms Glossary_files/svg-icons/${icon}`;
    
    const iconImage = (
        <img 
            src={iconPath}
            alt={`${displayName} icon`}
            className={`category-icon ${className}`}
            style={{ 
                height: size, 
                width: 'auto', 
                verticalAlign: 'middle',
                filter: 'drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.2))'
            }}
        />
    );
    
    // Always wrap in Tooltip
    const iconWithTooltip = (
        <Tooltip 
            termPath={`/category/${categoryUrlSlug}`}
            categoryId={categoryId}
            isCategory={true}
        >
            {iconImage}
        </Tooltip>
    );
    
    // If we have a category URL slug and we're not on the same category page, make it a link
    if (categoryUrlSlug && currentCategoryId !== categoryId) {
        return (
            <Link 
                to={`/category/${categoryUrlSlug}`} 
                className="category-icon-link"
            >
                {iconWithTooltip}
            </Link>
        );
    }
    
    return iconWithTooltip;
}