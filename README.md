# 🌍 TravelStory App

TravelStory is a full-stack MERN (MongoDB, Express, React, Node.js) web application that allows users to document and explore travel memories in the form of interactive image-based stories.

📌 Overview
A MERN stack web application to create, view, edit, delete, and search travel stories.
Users can log in, upload images, and maintain a personal collection of travel memories.
Stories can be filtered by date and location.
Integrated with Cloudinary for optimized image uploads and storage.

🛠️ Tech Stack
Frontend: React.js
Backend: Node.js + Express.js
Database: MongoDB (with Mongoose)
Authentication: JWT (JSON Web Token)
Image Upload: Cloudinary
Styling: CSS 
🔐 Features – User Authentication
✅ User registration and login with JWT-based session handling.
✅ Passwords hashed securely using bcrypt.
✅ Protected routes for authenticated users only.
📝 Features – Travel Stories Management
➕ Add a new travel story with:
Title
Description
Date of travel
Location
Image (uploaded to Cloudinary)
🔁 Edit an existing story (title, description, image, etc.)
❌ Delete any story from your collection
🔍 Search stories by:
Date
Location
👁️ View all stories in a timeline or card layout
📦 Stories are saved as a collection under the logged-in user
☁️ Image Handling with Cloudinary
✔️ Users can upload travel photos
✔️ Images are stored on Cloudinary and linked via URL

