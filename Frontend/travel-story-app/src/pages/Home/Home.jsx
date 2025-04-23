import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Input/Navbar';
import TravelStoryCard from '../../components/Cards/TravelStoryCard';
import { useNavigate } from 'react-router-dom';
import axiosinstance from '../../utils/axiosinstance';
import { format } from 'date-fns';

import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({});
  const [travelStories, setTravelStories] = useState([]);
  const [allStories, setAllStories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isFilteringByDate, setIsFilteringByDate] = useState(false);

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

  // Get all travel stories
  const getAllTravelStories = async () => {
    try {
      const response = await axiosinstance.get("/get-all-stories");
      setTravelStories(response.data.travelStories);
      setAllStories(response.data.travelStories);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    }
  };

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      if (isFilteringByDate) {
        // If date filter is active, just clear the text search
        filterStoriesByDate(dateFilter);
      } else {
        // If no date filter, reset to all stories
        setTravelStories(allStories);
        setIsSearching(false);
      }
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await axiosinstance.get(`/search?query=${encodeURIComponent(searchQuery)}`);
      setTravelStories(response.data.searchResults);
      setIsFilteringByDate(false);
    } catch (error) {
      console.error("Error searching stories:", error);
      if (error.response && error.response.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    }
  };

  // Handle search reset
  const handleSearchReset = () => {
    setSearchQuery('');
    if (isFilteringByDate) {
      // If date filter is active, just clear the text search
      filterStoriesByDate(dateFilter);
    } else {
      // If no date filter, reset to all stories
      setTravelStories(allStories);
      setIsSearching(false);
    }
  };

  // Handle date filter
  const handleDateFilterChange = (e) => {
    const date = e.target.value;
    setDateFilter(date);
    
    if (date) {
      filterStoriesByDate(date);
    } else {
      // If date is cleared, reset to all stories or search results
      if (isSearching) {
        handleSearch({ preventDefault: () => {} });
      } else {
        setTravelStories(allStories);
        setIsFilteringByDate(false);
      }
    }
  };

  // Filter stories by date
  const filterStoriesByDate = (date) => {
    if (!date) return;
    
    const filterDate = new Date(date);
    const year = filterDate.getFullYear();
    const month = filterDate.getMonth();
    const day = filterDate.getDate();
    
    let filteredStories;
    if (isSearching) {
      // If there's already a search query, filter the current results
      filteredStories = travelStories.filter(story => {
        const storyDate = new Date(story.visitedDate);
        return (
          storyDate.getFullYear() === year &&
          storyDate.getMonth() === month &&
          storyDate.getDate() === day
        );
      });
    } else {
      // Otherwise filter all stories
      filteredStories = allStories.filter(story => {
        const storyDate = new Date(story.visitedDate);
        return (
          storyDate.getFullYear() === year &&
          storyDate.getMonth() === month &&
          storyDate.getDate() === day
        );
      });
    }
    
    setTravelStories(filteredStories);
    setIsFilteringByDate(true);
  };

  // Handle date filter reset
  const handleDateFilterReset = () => {
    setDateFilter('');
    if (isSearching) {
      handleSearch({ preventDefault: () => {} });
    } else {
      setTravelStories(allStories);
      setIsFilteringByDate(false);
    }
  };

  // Handle edit story
  const handleEdit = (story) => {
    navigate(`/edit-story/${story._id}`, { state: { story } });
  };

  // Handle view story
  const handleView = (story) => {
    navigate(`/view-story/${story._id}`, { state: { story } });
  };

  // Handle favorite
  const handleFavorite = async (story) => {
    try {
      await axiosinstance.post(`/edit-story/${story._id}`, {
        ...story,
        isFavourite: !story.isFavourite
      });
      
      // Refresh the stories based on current filters
      if (isSearching || isFilteringByDate) {
        // If we're searching or filtering, refresh with current filters
        getAllTravelStories().then(() => {
          if (isSearching) {
            handleSearch({ preventDefault: () => {} });
          }
          if (isFilteringByDate) {
            filterStoriesByDate(dateFilter);
          }
        });
      } else {
        // Otherwise just refresh all stories
        getAllTravelStories();
      }
    } catch (error) {
      console.error("Error updating favorite status:", error);
    }
  };

  // Handle add new story
  const handleAddStory = () => {
    navigate('/add-story');
  };

  useEffect(() => {
    getUserInfo();
    getAllTravelStories();
  }, []);

  return (
    <div className="home-container">
      <Navbar userInfo={userInfo} />
      
      <div className="filters-container">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search stories by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">Search</button>
          {isSearching && (
            <button 
              type="button" 
              className="reset-button" 
              onClick={handleSearchReset}
            >
              Clear
            </button>
          )}
        </form>
        
        {/* Date Filter */}
        <div className="date-filter">
          <div className="date-input-container">
            <span className="calendar-icon">📅</span>
            <input
              type="date"
              value={dateFilter}
              onChange={handleDateFilterChange}
              className="date-input"
              placeholder="Filter by date"
            />
          </div>
          {isFilteringByDate && (
            <button 
              type="button" 
              className="reset-button" 
              onClick={handleDateFilterReset}
            >
              Clear Date
            </button>
          )}
        </div>
      </div>
      
      {/* Filter Results Message */}
      <div className="filter-results-info">
        {isSearching && (
          <p className="search-message">
            {travelStories.length === 0 
              ? `No results found for "${searchQuery}"` 
              : `Found ${travelStories.length} ${travelStories.length === 1 ? 'story' : 'stories'} for "${searchQuery}"`}
          </p>
        )}
        
        {isFilteringByDate && (
          <p className="date-filter-message">
            {travelStories.length === 0 
              ? `No stories found for ${format(new Date(dateFilter), 'MMMM d, yyyy')}` 
              : `Found ${travelStories.length} ${travelStories.length === 1 ? 'story' : 'stories'} for ${format(new Date(dateFilter), 'MMMM d, yyyy')}`}
          </p>
        )}
      </div>

      <div className="stories-container">
        {travelStories.length === 0 && !isSearching && !isFilteringByDate ? (
          <div className="no-stories">
            <p>You haven't added any travel stories yet.</p>
            <button onClick={handleAddStory} className="add-first-story-button">
              Add Your First Story
            </button>
          </div>
        ) : (
          <div className="stories-grid">
            {travelStories.map((story) => (
              <TravelStoryCard 
                key={story._id}
                imgUrl={story.imageUrl}
                title={story.title}
                story={story.story}
                date={format(new Date(story.visitedDate), 'do MMM yyyy')}
                visitedLocation={story.visitedLocation}
                isFavourite={story.isFavourite}
                onEdit={() => handleEdit(story)}
                onClick={() => handleView(story)}
                onFavoriteClick={() => handleFavorite(story)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <div className="floating-add-button" onClick={handleAddStory}>
        <span className="plus-icon">+</span>
      </div>
    </div>
  );
};

export default Home;