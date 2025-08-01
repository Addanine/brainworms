// src/components/IndexPostCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import AutoLinkText from './AutoLinkText';
import FileInfo from './FileInfo';
import CategoryIcon from './CategoryIcon';
import Tooltip from './Tooltip';

export default function IndexPostCard({ category, categoryData }) {
    // Sort terms: defining term first, then alphabetically
    const sortedTerms = [...category.terms].sort((a, b) => {
        if (a.isDefiningTerm) return -1;
        if (b.isDefiningTerm) return 1;
        return a.term.localeCompare(b.term);
    });
    
    
    return (
        <div data-full-i-d="lgbt.2" id={category.id} className="postContainer replyContainer">
            <div className="replacedSideArrows" id="sa26255559">
                <a className="hide-reply-button" href="javascript:;"></a>
            </div>
            <div id="p26255559" className="post reply" style={{ overflow: 'visible', display: 'block' }}>
                <div className={`postInfo ${category.icon ? 'postInfo-with-icon' : ''}`} id="pi26255559">
                    <div className="postInfo-left">
                        <input type="checkbox" name="26255671" value="delete" />
                        <span className="nameBlock">
                            <span className="name post-name-prominent">
                                <Link 
                                    to={`/category/${category.urlSlug}`} 
                                    className="category-link" 
                                    data-category={category.id}
                                >
                                    {category.displayName}
                                </Link>
                            </span>
                        </span>
                    </div>
                    {category.icon && (
                        <div className="postInfo-icon">
                            <CategoryIcon 
                                icon={category.icon} 
                                displayName={category.displayName}
                                categoryUrlSlug={category.urlSlug}
                                categoryId={category.id}
                                size="30px"
                            />
                        </div>
                    )}
                </div>
                
                {/* Image with standard classes */}
                {categoryData.categoryImage && (
                    <div className="file">
                        <a className="fileThumb" href={`./Brainworms Glossary_files/images/${categoryData.categoryImage}`}>
                            <img 
                                src={`./Brainworms Glossary_files/images/${categoryData.categoryImage}`} 
                                alt={category.displayName}
                            />
                        </a>
                        <div className="fileText">
                            <FileInfo imagePath={`./Brainworms Glossary_files/images/${categoryData.categoryImage}`} />
                        </div>
                    </div>
                )}
                
                {/* Text content that wraps around the image */}
                <blockquote className="postMessage">
                    <a 
                        className="quotelink" 
                        href="#lgbt.2"
                        onClick={(e) => {
                            e.preventDefault();
                            const element = document.getElementById('lgbt.2');
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
                        &gt;&gt;Index
                    </a><br /><br />
                    
                    {sortedTerms.map((term, index) => {
                        const termSlug = term.slug;
                        const linkedDefinition = (
                            <AutoLinkText 
                                text={term.definition} 
                                currentTermName={term.term}
                                currentCategoryId={category.id}
                                isTermDetailView={false}
                            />
                        );
                        
                        return (
                            <React.Fragment key={term.slug}>
                                <span className="quote">
                                    &gt;<Tooltip 
                                        termPath={`/term/${termSlug}`}
                                        categoryId={category.id}
                                        isGreentextMainPage={true}
                                        termData={term}
                                    >
                                        <Link 
                                            to={`/term/${termSlug}`} 
                                            className="term-link" 
                                            data-term={termSlug} 
                                            data-category={category.urlSlug}
                                        >
                                            {term.term}
                                        </Link>
                                    </Tooltip>
                                </span>
                                <br />
                                {linkedDefinition}
                                {index < sortedTerms.length - 1 && (
                                    <>
                                        <br />
                                        <hr />
                                    </>
                                )}
                            </React.Fragment>
                        );
                    })}
                    <br /><br />
                </blockquote>
                
                {/* Clear float after content */}
                <div style={{ clear: 'both' }}></div>
            </div>
        </div>
    );
}