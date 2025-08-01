// src/components/TermSelector.jsx
import { useState } from 'react';
import { glossaryService } from '../services/glossaryService';

export default function TermSelector({ selectedTerms, onTermsChange, selectedPlatforms, onPlatformsChange }) {
    const [customTerm, setCustomTerm] = useState('');
    const [showingAll, setShowingAll] = useState(false);

    // Common brainworms terms
    const commonTerms = [
        'hon', 'pooner', 'boymoder', 'gigahon', 'passoid', 'repressor', 'youngshit', 'midshit',
        'agp', 'hsts', 'clocky', 'manmoder', 'girlmoder', 'twinkhon', 'boomerhon', 'shadowhon',
        'gorillamoder', 'heighthon', 'shoulderhon', 'ribcagehon', 'voicehon', 'rapehon',
        'cope', 'seethe', 'dilate', 'rope', 'ack', 'ngmi', 'ywnbaw', 'iwnbaw'
    ];

    const displayTerms = showingAll ? commonTerms : commonTerms.slice(0, 12);

    const handleTermToggle = (term) => {
        if (selectedTerms.includes(term)) {
            onTermsChange(selectedTerms.filter(t => t !== term));
        } else {
            if (selectedTerms.length < 8) { // Limit to 8 terms for readability
                onTermsChange([...selectedTerms, term]);
            }
        }
    };

    const handleCustomTermAdd = () => {
        const term = customTerm.trim().toLowerCase();
        if (term && !selectedTerms.includes(term) && selectedTerms.length < 8) {
            onTermsChange([...selectedTerms, term]);
            setCustomTerm('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleCustomTermAdd();
        }
    };

    return (
        <div className="term-selector-container">
            <div className="selector-header">
                <strong>📊 Select Terms to Track</strong>
                <span className="term-count">({selectedTerms.length}/8)</span>
            </div>
            
            {/* Platform selector */}
            <div className="platform-selector">
                <div className="platform-selector-label">Platforms:</div>
                <div className="platform-buttons">
                    <button
                        className={`platform-button lgbt ${selectedPlatforms.includes('lgbt') ? 'selected' : ''}`}
                        onClick={() => {
                            if (selectedPlatforms.includes('lgbt')) {
                                onPlatformsChange(selectedPlatforms.filter(p => p !== 'lgbt'));
                            } else {
                                onPlatformsChange([...selectedPlatforms, 'lgbt']);
                            }
                        }}
                        disabled={selectedPlatforms.length === 1 && selectedPlatforms.includes('lgbt')}
                    >
                        <span className="platform-icon">/lgbt/</span>
                        <span className="platform-description">4chan board</span>
                    </button>
                    <button
                        className={`platform-button r4tran ${selectedPlatforms.includes('r4tran') ? 'selected' : ''}`}
                        onClick={() => {
                            if (selectedPlatforms.includes('r4tran')) {
                                onPlatformsChange(selectedPlatforms.filter(p => p !== 'r4tran'));
                            } else {
                                onPlatformsChange([...selectedPlatforms, 'r4tran']);
                            }
                        }}
                        disabled={selectedPlatforms.length === 1 && selectedPlatforms.includes('r4tran')}
                    >
                        <span className="platform-icon">r/4tran4</span>
                        <span className="platform-description">Reddit community</span>
                    </button>
                </div>
                <div className="platform-info">
                    <span className="platform-legend">
                        <span className="legend-line solid"></span> /lgbt/ (solid lines)
                        <span className="legend-line dashed"></span> r/4tran4 (dashed lines)
                    </span>
                </div>
            </div>
            
            {/* Selected terms display */}
            <div className="selected-terms">
                <div className="selected-terms-label">Currently tracking:</div>
                <div className="selected-terms-list">
                    {selectedTerms.map((term, index) => (
                        <span 
                            key={term} 
                            className="selected-term"
                            style={{ borderLeftColor: getTermColor(index) }}
                            onClick={() => handleTermToggle(term)}
                        >
                            {term} ×
                        </span>
                    ))}
                    {selectedTerms.length === 0 && (
                        <span className="no-terms">No terms selected</span>
                    )}
                </div>
            </div>

            {/* Common terms grid */}
            <div className="common-terms">
                <div className="common-terms-label">Common terms:</div>
                <div className="terms-grid">
                    {displayTerms.map(term => (
                        <button
                            key={term}
                            className={`term-button ${selectedTerms.includes(term) ? 'selected' : ''}`}
                            onClick={() => handleTermToggle(term)}
                            disabled={!selectedTerms.includes(term) && selectedTerms.length >= 8}
                        >
                            {term}
                        </button>
                    ))}
                </div>
                
                <div className="show-more-container">
                    <button 
                        className="show-more-btn"
                        onClick={() => setShowingAll(!showingAll)}
                    >
                        {showingAll ? 'Show Less' : `Show All ${commonTerms.length} Terms`}
                    </button>
                </div>
            </div>

            {/* Custom term input */}
            <div className="custom-term-input">
                <div className="custom-term-label">Add custom term:</div>
                <div className="input-row">
                    <input
                        type="text"
                        value={customTerm}
                        onChange={(e) => setCustomTerm(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter term..."
                        className="custom-term-field"
                        disabled={selectedTerms.length >= 8}
                    />
                    <button 
                        onClick={handleCustomTermAdd}
                        className="add-term-btn"
                        disabled={!customTerm.trim() || selectedTerms.length >= 8}
                    >
                        Add
                    </button>
                </div>
            </div>

            {selectedTerms.length >= 8 && (
                <div className="limit-warning">
                    <span className="quote">&gt;Maximum 8 terms for chart readability</span>
                </div>
            )}
        </div>
    );
}

// Helper function to get consistent term colors
function getTermColor(index) {
    const colors = ['#d00', '#34345c', '#789922', '#117743', '#000080', '#800080', '#ff6600', '#008b8b'];
    return colors[index % colors.length];
}