// src/pages/BrainwormsTracker.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { trackerDataService } from '../services/trackerDataService';
import TermFrequencyChart from '../components/TermFrequencyChart';
import TermSelector from '../components/TermSelector';

export default function BrainwormsTracker() {
    const [isLoading, setIsLoading] = useState(true);
    const [analysisData, setAnalysisData] = useState(null);
    const [frequencyData, setFrequencyData] = useState(null);
    const [selectedTerms, setSelectedTerms] = useState(['hon', 'pooner', 'boymoder', 'gigahon']);
    const [selectedPlatforms, setSelectedPlatforms] = useState(['lgbt', 'r4tran']);

    useEffect(() => {
        document.title = 'Brainworms Tracker - Data Analysis';
        
        async function loadAnalysisData() {
            try {
                const [stats, freqData] = await Promise.all([
                    trackerDataService.getBasicStats(),
                    trackerDataService.getTermFrequencyOverTime(selectedTerms, selectedPlatforms)
                ]);
                setAnalysisData(stats);
                setFrequencyData(freqData);
            } catch (error) {
                console.error('Error loading analysis data:', error);
                setAnalysisData({
                    totalPosts: 'Error',
                    totalComments: 'Error', 
                    dateRange: 'Error loading data'
                });
            } finally {
                setIsLoading(false);
            }
        }
        
        loadAnalysisData();
    }, [selectedTerms, selectedPlatforms]);

    // Update frequency data when selected terms or platforms change
    useEffect(() => {
        if (selectedTerms.length > 0 && selectedPlatforms.length > 0) {
            async function updateFrequencyData() {
                try {
                    const newFreqData = await trackerDataService.getTermFrequencyOverTime(selectedTerms, selectedPlatforms);
                    console.log('Chart data:', newFreqData);
                    console.log('Selected terms:', selectedTerms);
                    console.log('Selected platforms:', selectedPlatforms);
                    setFrequencyData(newFreqData);
                } catch (error) {
                    console.error('Error updating frequency data:', error);
                }
            }
            updateFrequencyData();
        }
    }, [selectedTerms, selectedPlatforms]);

    const handleTermsChange = (newTerms) => {
        setSelectedTerms(newTerms);
    };

    const handlePlatformsChange = (newPlatforms) => {
        setSelectedPlatforms(newPlatforms);
    };

    if (isLoading) {
        return (
            <div className="loading-indicator">
                <div className="loading-spinner"></div>
                <div className="loading-text">Loading brainworms data...</div>
            </div>
        );
    }

    return (
        <div id="dynamicContent" className="loaded">
            {/* Header post */}
            <div className="postContainer opContainer" data-full-i-d="tracker.1" id="tracker.1">
                <div id="p-tracker-1" className="post op">
                    <div className="postInfo postInfo-with-icon" id="pi-tracker-1">
                        <div className="postInfo-left">
                            <span className="subject">Brainworms Tracker - Data Analysis</span>
                        </div>
                        <div className="postInfo-icon">
                            <img 
                                src="./Brainworms Glossary_files/svg-icons/brainworms.svg" 
                                alt="Brainworms icon"
                                className="category-icon brainworms-icon"
                                style={{ 
                                    height: '2.7em', 
                                    width: 'auto', 
                                    verticalAlign: 'middle',
                                    filter: 'drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.2))'
                                }}
                            />
                        </div>
                    </div>
                    <blockquote className="postMessage" id="m-tracker-1">
                        Analysis of term usage patterns from <strong>/lgbt/</strong> and <strong>r/4tran4</strong> datasets. 
                        Track how terminology evolved, spread, and influenced the community over time.
                        <br /><br />
                        <br />
                        <div className="dataset-stats-box">
                            <div className="stats-header">📊 <strong>DATASET STATISTICS</strong></div>
                            <div className="stats-grid">
                                <div className="stat-item">
                                    <span className="stat-label">/lgbt/ posts:</span>
                                    <span className="stat-value">{typeof analysisData?.totalPosts === 'number' ? analysisData.totalPosts.toLocaleString() : (analysisData?.totalPosts || 'Loading...')}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">r/4tran4 comments:</span>
                                    <span className="stat-value">{typeof analysisData?.totalComments === 'number' ? analysisData.totalComments.toLocaleString() : (analysisData?.totalComments || 'Loading...')}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Date range:</span>
                                    <span className="stat-value">{analysisData?.dateRange || 'Loading...'}</span>
                                </div>
                            </div>
                            <div className="attribution-container">
                                <span className="attribution-text">Graphs and data done by: </span>
                                <a href="https://x.com/endocrinemoder" target="_blank" rel="noopener noreferrer" className="attribution-link">@endocrinemoder</a>
                            </div>
                        </div>
                    </blockquote>
                </div>
            </div>

            {/* Navigation post */}
            <div data-full-i-d="tracker.2" id="tracker.2" className="postContainer replyContainer">
                <div className="replacedSideArrows" id="sa-tracker-2">
                    <a className="hide-reply-button" href="javascript:;"></a>
                </div>
                <div id="p-tracker-2" className="post reply">
                    <div className="postInfo" id="pi-tracker-2">
                        <input type="checkbox" name="tracker-2" value="delete" />
                        <span className="nameBlock">
                            <span className="name post-name-regular">Analysis Menu</span>
                        </span>
                    </div>
                    <blockquote className="postMessage index-links" id="m-tracker-2">
                        <a className="quotelink" href="#term-frequency">&gt;&gt;Term Frequency Timeline</a><br />
                        <br />
                        <Link to="/" className="quotelink">&gt;&gt;Back to Glossary</Link>
                    </blockquote>
                </div>
            </div>

            {/* Term Frequency Timeline */}
            <div className="postContainer replyContainer" id="term-frequency">
                <div className="replacedSideArrows">
                    <a className="hide-reply-button" href="javascript:;"></a>
                </div>
                <div className="post reply">
                    <div className="postInfo">
                        <input type="checkbox" value="delete" />
                        <span className="nameBlock">
                            <span className="name post-name-regular">Term Frequency Timeline</span>
                        </span>
                    </div>
                    <blockquote className="postMessage">
                        Track the rise and fall of brainworms terminology across both platforms.
                        Interactive timeline showing monthly usage patterns.
                        <br /><br />
                        <TermSelector 
                            selectedTerms={selectedTerms}
                            onTermsChange={handleTermsChange}
                            selectedPlatforms={selectedPlatforms}
                            onPlatformsChange={handlePlatformsChange}
                        />
                        <br />
                        {selectedTerms.length > 0 && selectedPlatforms.length > 0 ? (
                            <div className="chart-wrapper">
                                <TermFrequencyChart 
                                    data={frequencyData} 
                                    selectedTerms={selectedTerms}
                                    selectedPlatforms={selectedPlatforms}
                                />
                            </div>
                        ) : (
                            <div className="no-terms-message">
                                <span className="quote">
                                    &gt;{selectedTerms.length === 0 ? 'Select some terms above to see the timeline' : 'Select at least one platform to see the timeline'}
                                </span>
                            </div>
                        )}
                    </blockquote>
                </div>
            </div>

        </div>
    );
}