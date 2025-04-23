import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axiosinstance from '../../utils/axiosinstance';
import Navbar from '../../components/Input/Navbar';
import './ViewStory.css';

const ViewStory = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [story] = useState(location.state?.story || {});
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle edit navigation
  const handleEdit = () => {
    navigate(`/edit-story/${story._id}`, { state: { story } });
  };

  // Handle delete with confirmation
  const handleDelete = async () => {
    if (!isDeleting) {
      setIsDeleting(true);
      return;
    }

    try {
      await axiosinstance.delete(`/delete-story/${story._id}`);
      navigate('/');
    } catch (error) {
      console.error("Error deleting story:", error);
      setIsDeleting(false);
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setIsDeleting(false);
  };

  // Handle back to home
  const handleBack = () => {
    navigate('/');
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!story._id) {
    return <div className="not-found">Story not found</div>;
  }

  return (
    <div className="view-story-container">
      <Navbar />
      
      <div className="story-content">
        <button className="back-button" onClick={handleBack}>← Back</button>
        
        <div className="story-header">
          <h1>{story.title}</h1>
          <p className="story-meta">
            <span className="location">{story.visitedLocation}</span>
            <span className="date">{formatDate(story.visitedDate)}</span>
          </p>
        </div>

        {story.imageUrl && (
          <div className="story-image-container">
            <img src={story.imageUrl} alt={story.title} className="story-image" />
          </div>
        )}

        <div className="story-text">
          <p>{story.story}</p>
        </div>

        <div className="story-actions">
          {isDeleting ? (
            <div className="delete-confirmation">
              <p>Are you sure you want to delete this story?</p>
              <div className="confirmation-buttons">
                <button className="confirm-delete" onClick={handleDelete}>Yes, Delete</button>
                <button className="cancel-delete" onClick={handleCancelDelete}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <button className="edit-button" onClick={handleEdit}>Edit Story</button>
              <button className="delete-button" onClick={handleDelete}>Delete Story</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewStory;