// src/components/CategoryHeader.jsx
import FileInfo from './FileInfo';

export default function CategoryHeader({ category, categoryId }) {
    return (
        <div className="postContainer opContainer" data-full-i-d={`${categoryId}.intro`}>
            <div className="post op">
                <div className="postInfo">
                    <input type="checkbox" name={`${categoryId}.intro`} value="delete" />
                    <span className="subject">{category.displayName}</span>
                    {' '}
                    <span className="nameBlock">
                        <span className="name">Anonymous</span>
                    </span>
                </div>
                {category.categoryImage && (
                    <div className="file">
                        <div className="fileText">
                            <FileInfo imagePath={`./${category.categoryImage}`} />
                        </div>
                        <a className="fileThumb" href={`./${category.categoryImage}`}>
                            <img src={`./${category.categoryImage}`} alt={category.displayName} />
                        </a>
                    </div>
                )}
                <blockquote className="postMessage">
                    {category.description}
                </blockquote>
            </div>
        </div>
    );
}