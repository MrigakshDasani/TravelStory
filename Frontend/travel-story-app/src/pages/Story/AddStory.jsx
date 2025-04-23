import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Input/Navbar';
import axiosinstance from '../../utils/axiosinstance';
import './AddStory.css';

const AddStory = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    story: '',
    visitedLocation: '',
    visitedDate: '',
    isFavourite: false,
    image: null,
    imageUrl: ''
  });
  const [preview, setPreview] = useState('');

  // Get user info
  const getUserInfo = async () => {
    try {
      const response = await axiosinstance.get("/get-user");
      setUserInfo(response.data.user);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file' && files[0]) {
      setFormData({
        ...formData,
        image: files[0]
      });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let imageUrl = '';
      
      // Upload image if exists
      if (formData.image) {
        const formDataImage = new FormData();
        formDataImage.append('image', formData.image);
        
        const imageResponse = await axiosinstance.post('/image-upload', formDataImage, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        imageUrl = imageResponse.data.imageUrl;
      }
      
      // Create travel story
      await axiosinstance.post('/add-travel-story', {
        title: formData.title,
        story: formData.story,
        visitedLocation: formData.visitedLocation,
        visitedDate: formData.visitedDate,
        isFavourite: formData.isFavourite,
        imageUrl
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error creating travel story:', error);
      alert('Failed to create travel story');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-story-container">
      <Navbar userInfo={userInfo} />
      
      <div className="form-container">
        <div className="story-form">
          <h2 className="form-title">Add New Travel Story</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label className="field-label" htmlFor="title">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="text-input"
                required
              />
            </div>
            
            <div className="form-field">
              <label className="field-label" htmlFor="visitedLocation">
                Location
              </label>
              <input
                type="text"
                id="visitedLocation"
                name="visitedLocation"
                value={formData.visitedLocation}
                onChange={handleChange}
                className="text-input"
                required
              />
            </div>
            
            <div className="form-field">
              <label className="field-label" htmlFor="visitedDate">
                Visit Date
              </label>
              <input
                type="date"
                id="visitedDate"
                name="visitedDate"
                value={formData.visitedDate}
                onChange={handleChange}
                className="text-input"
                required
              />
            </div>
            
            <div className="form-field">
              <label className="field-label" htmlFor="story">
                Your Story
              </label>
              <textarea
                id="story"
                name="story"
                rows="6"
                value={formData.story}
                onChange={handleChange}
                className="text-area"
                required
              ></textarea>
            </div>
            
            <div className="form-field">
              <label className="field-label" htmlFor="image">
                Upload Image
              </label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="file-input"
              />
              {preview && (
                <div className="image-preview">
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="preview-image"
                  />
                </div>
              )}
            </div>
            
            <div className="form-field checkbox-field">
              <input
                type="checkbox"
                id="isFavourite"
                name="isFavourite"
                checked={formData.isFavourite}
                onChange={handleChange}
                className="checkbox-input"
              />
              <label className="checkbox-label" htmlFor="isFavourite">
                Add to favorites
              </label>
            </div>
            
            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="cancel-button"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="save-button"
              >
                {loading ? 'Saving...' : 'Save Story'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStory;