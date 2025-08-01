// src/components/Layout.jsx
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowUpToLine, ArrowDownToLine, House, Images, ChartNetwork, TrendingUp } from 'lucide-react';
import '../styles/fixes.css';

export default function Layout() {
    const [bannerNum, setBannerNum] = useState(1);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const location = useLocation();
    
    // Add the base classes to the body element, just like the original site.
    useEffect(() => {
        document.body.className = 'is_thread board_lgbt yotsuba_b_new ws';
        // Add fixed class to HTML element for sticky header
        document.documentElement.classList.add('fixed', 'shortcut-icons', 'hide-bottom-board-list', 
            'resurrect-quotes', 'hide-backlinks', 'reply-hide', 'highlight-own', 'highlight-you', 
            'gal-fit-width', 'gal-fit-height', 'show-sauce', 'fit-width', 'fixed-watcher', 
            'sw-yotsuba', 'thread-view', 'yotsuba-b', 'top-header');
        // Random banner selection (1-4)
        setBannerNum(Math.floor(Math.random() * 4) + 1);
    }, []);
    
    // Manage has-hash class based on current route
    useEffect(() => {
        // Add has-hash class on all pages except the index
        if (location.pathname === '/') {
            document.body.classList.remove('has-hash');
        } else {
            document.body.classList.add('has-hash');
        }
    }, [location]);
    
    // Initialize image zoom functionality
    useEffect(() => {
        const initializeImageZoom = () => {
            const fileThumbLinks = document.querySelectorAll('.fileThumb');
            fileThumbLinks.forEach(link => {
                if (!link.classList.contains('zoom-initialized')) {
                    link.classList.add('zoom-initialized');
                    link.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Toggle zoom class on the image
                        const img = this.querySelector('img');
                        if (img) {
                            img.classList.toggle('zoom');
                        }
                    });
                }
            });
        };
        
        // Initialize zoom on mount and after route changes
        const observer = new MutationObserver(() => {
            initializeImageZoom();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        initializeImageZoom();
        
        return () => observer.disconnect();
    }, []);

    const scrollToTop = (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const scrollToBottom = (e) => { e.preventDefault(); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); };
    
    // Handle banner click with fade transition
    const handleBannerClick = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setBannerNum(prev => (prev % 4) + 1);
            setIsTransitioning(false);
        }, 150);
    };

    return (
        <>
            <div id="header-bar" className="dialog">
                <span id="board-list">
                    <span id="custom-board-list">
                        <span className="nav-left">
                            [<Link to="/" title="Main Page"><House size={20} style={{verticalAlign: 'middle'}} /></Link>] [<Link to="/gallery" title="Gallery"><Images size={20} style={{verticalAlign: 'middle'}} /></Link>] [<Link to="/graph" title="Data Graph"><ChartNetwork size={20} style={{verticalAlign: 'middle'}} /></Link>] [<Link to="/tracker" title="Brainworms Tracker" className="tracker-nav-link"><TrendingUp size={20} style={{verticalAlign: 'middle'}} /></Link>]
                        </span>
                        <span className="nav-right">
                            [<a href="#top" onClick={scrollToTop} title="Top"><ArrowUpToLine size={20} style={{verticalAlign: 'middle'}} /></a>] 
                            [<a href="#bottom" onClick={scrollToBottom} title="Bottom"><ArrowDownToLine size={20} style={{verticalAlign: 'middle'}} /></a>]
                        </span>
                    </span>
                </span>
            </div>
            <div id="hoverUI"></div>
            <span id="id_css"></span>
            
            <div className="boardBanner">
                <div id="bannerCnt" alt="brainworms.lgbt" className="title" data-src={`banners/banner-${bannerNum}.webp`}>
                    <img 
                        alt="brainworms.lgbt" 
                        className="brainworm-banner" 
                        src={`./Brainworms Glossary_files/banners/banner-${bannerNum}.webp`} 
                        onClick={handleBannerClick}
                        style={{ 
                            cursor: 'pointer',
                            opacity: isTransitioning ? 0 : 1,
                            transition: 'opacity 0.15s ease-in-out'
                        }}
                    />
                </div>
                <div className="boardTitle" spellCheck="false">
                    /tttt/ - Translating Toxic /tttt/ Terminology
                </div>
            </div>
            
            <div id="mpostform">
                <a href="#" className="mobilePostFormToggle mobile hidden button">Post a Reply</a>
            </div>
            
            <hr className="desktop" id="op" />
            
            <div className="navLinks desktop">
                [<a href="#top" onClick={scrollToTop}>Top</a>] [<Link to="/">Index</Link>] [<a href="#bottom" onClick={scrollToBottom}>Bottom</a>]
            </div>
            
            <hr />

            <div className="board">
                <div className="thread" id="t26255548">
                    {/* The content from our page routes will be rendered here */}
                    <Outlet />
                </div>
                <hr />
                <div className="navLinks navLinksBot desktop">
                    [<a href="#top" onClick={scrollToTop}>Top</a>]
                </div>
                <hr className="desktop" />
                <div className="mobile center"></div>
            </div>
            
            <div id="boardNavDesktopFoot" className="desktop"></div>
            
            <div id="absbot" className="absBotText">
                <span className="absBotDisclaimer">
                    All trademarks and copyrights on this page are owned by their respective parties. 
                    Images uploaded are the responsibility of the Poster. Comments are owned by the Poster.
                </span>
            </div>
            
            <div id="bottom"></div>
        </>
    );
}