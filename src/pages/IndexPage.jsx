// src/pages/IndexPage.jsx
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { glossaryService } from '../services/glossaryService';
import AutoLinkText from '../components/AutoLinkText';
import IndexPostCard from '../components/IndexPostCard';
import { TrendingUp, ChartNetwork, Images } from 'lucide-react';

export default function IndexPage() {
    const [categories, setCategories] = useState([]);
    const [dataCache, setDataCache] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        document.title = 'Brainworms Glossary';
        
        async function loadData() {
            const [cats, cache] = await Promise.all([
                glossaryService.getCategories(),
                glossaryService.getDataCache()
            ]);
            setCategories(cats);
            setDataCache(cache);
            setIsLoading(false);
        }
        loadData();
    }, []);

    if (isLoading) {
        return (
            <div className="loading-indicator">
                <div className="loading-spinner"></div>
                <div className="loading-text">Loading glossary...</div>
            </div>
        );
    }

    // Sort categories by postNum to maintain original order
    const sortedCategories = [...categories].sort((a, b) => a.postNum - b.postNum);

    return (
        <div id="dynamicContent" className="loaded">
            {/* Original post - Brainworms Primer */}
            <div className="postContainer opContainer" data-full-i-d="lgbt.1" id="lgbt.1">
                <div id="p26255548" className="post op">
                    <div className="postInfo postInfo-with-icon" id="pi26255548">
                        <div className="postInfo-left">
                            <span className="subject">Brainworms Primer</span>
                        </div>
                        <div className="postInfo-icon">
                            <img 
                                src="./Brainworms Glossary_files/svg-icons/worms.svg" 
                                alt="Brainworms icon"
                                className="category-icon worms-icon"
                                style={{ 
                                    height: '2.7em', 
                                    width: 'auto', 
                                    verticalAlign: 'middle',
                                    filter: 'drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.2))'
                                }}
                            />
                        </div>
                    </div>
                    <div className="file" id="f26255548">
                        <a className="fileThumb" href="./Brainworms Glossary_files/images/OP.webp">
                            <img src="./Brainworms Glossary_files/images/OP.webp" alt="menhera and sylveon" />
                        </a>
                        <div className="fileText" id="fT26255548">
                            <span className="file-info">
                                <a href="./Brainworms Glossary_files/images/OP.webp">
                                    <span className="fnswitch">
                                        <span className="fntrunc">OP.webp</span>
                                        <span className="fnfull">OP.webp</span>
                                    </span>
                                </a>
                                (82.9 KB, 680x486)
                            </span>
                        </div>
                    </div>
                    <blockquote className="postMessage" id="m26255548">
                        <span className="warning" spellCheck="false">
                            WARNING: IF YOU ARE TRANSGENDER, THIS DOCUMENT MAY CAUSE YOU
                            IRREVERSIBLE PSYCHIC DAMAGE
                        </span>
                        
                        Brainworms are trans related concepts and terminology that originate from 4chan's /lgbt/ board and adjacent communities, memetically propagated between trans people. These terms reflect the unique anxieties, internalized transphobia, experiences, and cultural dynamics within these spaces. 

                        <br /><br />
                        While some terms can be genuinely useful for articulating specific concepts, others may reinforce negative thought patterns or unrealistic standards. As a result of this, the terms themselves are often treated as "cognitohazards" or "brainworms", implying that simply learning of them causes a person some amount of underlying psychological harm.

                        <br /><br />
                        Brainworms based upon insecurities and internalized transphobia are phrased such that they can seem intuitively true in a way that's not easily or rationally debunked, even if you intellectually know they're false. These types of brainworms can increase dysphoria, body dysmorphia, and generalized insanity as typically occurs when you start using and understanding absurd terms such as "Gorillamoding AGP Giga-rapehons". This entire webpage will likely give you some amount of brain worms. If you are early into your transition, or haven't started yet, or aren't completely sure of yourself, it's probably best if you don't read this page.<br /><br />

                        While many of the terms on this page have genuine utility, most of them are absurd, stupid, harmful, and toxic. However, we believe that the toxic terms within this encyclopedia hold significantly less power when they are more easily understood for what they actually mean and their absurdity is thus plain to see for everybody involved, as opposed to remaining mysterious and esoteric. This was the primary motivation behind compiling this document, as well as both a compulsion to shitpost and a general morbid fascination with this terrible culture.
                    </blockquote>
                </div>
            </div>

            {/* Index post */}
            <div data-full-i-d="lgbt.2" id="lgbt.2" className="postContainer replyContainer">
                <div className="replacedSideArrows" id="sa26255559">
                    <a className="hide-reply-button" href="javascript:;"></a>
                </div>
                <div id="p26255559" className="post reply">
                    <div className="postInfo" id="pi26255559">
                        <input type="checkbox" name="26255671" value="delete" />
                        <span className="nameBlock">
                            <span className="name post-name-regular">Index</span>
                        </span>
                    </div>
                    <blockquote className="postMessage index-links" id="m26255559">
                        {sortedCategories.map((category, index) => (
                            <span key={category.id}>
                                <a 
                                    className="quotelink" 
                                    href={`#${category.id}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        const element = document.getElementById(category.id);
                                        if (element) {
                                            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                                            const offsetPosition = elementPosition - 71; // 26px header + 45px extra
                                            window.scrollTo({
                                                top: offsetPosition,
                                                behavior: 'smooth'
                                            });
                                        }
                                    }}
                                >
                                    &gt;&gt;{category.displayName}
                                </a>
                                {index < sortedCategories.length - 1 && <br />}
                            </span>
                        ))}
                        <br /><br />
                        <hr />
                        <div style={{marginBottom: '5px'}}>
                            <Link to="/gallery" className="quotelink" style={{fontWeight: 'bold'}}>
                                <Images size={16} style={{verticalAlign: 'middle', display: 'inline-block'}} /> - Gallery
                            </Link>
                        </div>
                        <div style={{marginBottom: '5px'}}>
                            <Link to="/tracker" className="quotelink tracker-link" style={{fontWeight: 'bold'}}>
                                <TrendingUp size={16} style={{verticalAlign: 'middle', display: 'inline-block'}} /> - Brainworms Tracker
                            </Link>
                        </div>
                        <div>
                            <Link to="/graph" className="quotelink" style={{fontWeight: 'bold'}}>
                                <ChartNetwork size={16} style={{verticalAlign: 'middle', display: 'inline-block'}} /> - Node Graph
                            </Link>
                        </div>
                    </blockquote>
                </div>
            </div>

            {/* Category posts with terms - using new IndexPostCard component */}
            {sortedCategories.map(category => {
                const categoryData = dataCache[category.id];
                if (!categoryData) return null;
                
                return (
                    <IndexPostCard 
                        key={category.id}
                        category={category}
                        categoryData={categoryData}
                    />
                );
            })}
        </div>
    );
}