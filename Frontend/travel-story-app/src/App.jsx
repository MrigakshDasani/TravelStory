import React from "react";
import "./index.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import Home from "./pages/Home/Home";
import AddStory from "./pages/Story/AddStory";
import ViewStory from "./pages/Story/ViewStory";
import EditStory from "./pages/Story/EditStory";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("token");
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/login" exact element={<Login />} />
          <Route path="/create-account" exact element={<Signup />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/add-story"
            element={
              <ProtectedRoute>
                <AddStory />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/view-story/:id"
            element={
              <ProtectedRoute>
                <ViewStory />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/edit-story/:id"
            element={
              <ProtectedRoute>
                <EditStory />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </div>
  );
};

export default App;