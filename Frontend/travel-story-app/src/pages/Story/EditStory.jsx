import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Navbar from '../../components/Input/Navbar';
import axiosinstance from '../../utils/axiosinstance';
import './EditStory.css';

const EditStory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const storyData = location.state?.story || {};
  
  const [formData, setFormData] = useState({
    title: storyData.title || '',
    story: storyData.story || '',
    visitedLocation: storyData.visitedLocation || '',
    visitedDate: '',
    imageUrl: storyData.imageUrl || '',
    isFavourite: storyData.isFavourite || false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(storyData.imageUrl || '');

  useEffect(() => {
    // Format date for the input field
    if (storyData.visitedDate) {
      const date = new Date(storyData.visitedDate);
      const formattedDate = date.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, visitedDate: formattedDate }));
    }
  }, [storyData.visitedDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCheckboxChange = (e) => {
    setFormData({
      ...formData,
      isFavourite: e.target.checked
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let imageUrl = formData.imageUrl;
      
      // Upload image if a new one is selected
      if (selectedFile) {
        const formDataForImage = new FormData();
        formDataForImage.append('image', selectedFile);
        
        const imageResponse = await axiosinstance.post('/image-upload', formDataForImage);
        imageUrl = imageResponse.data.imageUrl;
      }
      
      // Update story data with the new or existing image URL
      const updateData = {
        ...formData,
        imageUrl
      };
      
      await axiosinstance.post(`/edit-story/${id}`, updateData);
      navigate('/');
    } catch (err) {
      console.error('Error updating story:', err);
      setError(err.response?.data?.message || 'Failed to update story. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="edit-story-container">
      <Navbar />
      
      <div className="edit-content">
        <h2>Edit Travel Story</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="visitedLocation">Location</label>
            <input
              type="text"
              id="visitedLocation"
              name="visitedLocation"
              value={formData.visitedLocation}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="visitedDate">Date Visited</label>
            <input
              type="date"
              id="visitedDate"
              name="visitedDate"
              value={formData.visitedDate}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="story">Your Story</label>
            <textarea
              id="story"
              name="story"
              value={formData.story}
              onChange={handleChange}
              rows="8"
              required
            />
          </div>
          
          <div className="form-group image-input">
            <label htmlFor="image">Image</label>
            {previewUrl && (
              <div className="image-preview">
                <img src={previewUrl} alt="Preview" />
              </div>
            )}
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleFileChange}
              accept="image/jpeg, image/png, image/jpg"
            />
            <p className="image-hint">Select a new image to replace the current one (optional)</p>
          </div>
          
          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="isFavourite"
              name="isFavourite"
              checked={formData.isFavourite}
              onChange={handleCheckboxChange}
            />
            <label htmlFor="isFavourite">Mark as favorite</label>
          </div>
          
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={handleCancel}>Cancel</button>
            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStory;