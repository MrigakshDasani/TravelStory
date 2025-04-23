import React from 'react';
import './TravelStoryCard.css';

const TravelStoryCard = ({
  imgUrl,
  title,
  date,
  story,
  visitedLocation,
  isFavourite,
  onFavoriteClick,
  onEdit,
  onClick
}) => {
  // Truncate story text if it's too long
  const truncateStory = (text, maxLength = 100) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  return (
    <div className="story-card" onClick={onClick}>
      <div className="story-image-container">
        <img 
          src={imgUrl || 'https://via.placeholder.com/400x200?text=No+Image'} 
          alt={title} 
          className="story-image"
        />
        <button 
          className={`favorite-button ${isFavourite ? 'is-favorite' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteClick();
          }}
        >
          {isFavourite ? '❤️' : '🤍'}
        </button>
      </div>

      <div className="story-content">
        <div className="story-header">
          <h3 className="story-title">{title}</h3>
          <button 
            className="edit-button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            ✏️
          </button>
        </div>
        
        <p className="story-date">{date}</p>
        <p className="story-text">{truncateStory(story)}</p>
        
        <div className="story-location">
          <span>Location: {visitedLocation}</span>
        </div>
      </div>
    </div>
  );
};

export default TravelStoryCard;