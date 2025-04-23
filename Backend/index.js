  require("dotenv").config();

  const config = require("./config.json");
  const mongoose = require("mongoose");
  const bcrypt = require("bcrypt");
  const express = require("express");
  const cors = require("cors");
  const jwt = require("jsonwebtoken");
  const path = require("path");
  const fs = require("fs");
  const multer = require("multer");
  const cloudinary = require("cloudinary").v2;
  const { CloudinaryStorage } = require("multer-storage-cloudinary");

  const authenticateToken = require("./utilities");

  const User = require("./models/userModels.js");
  const TravelStory = require("./models/travelstorymodel.js");

  mongoose.connect(config.connectionString);

  // Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  const app = express();

  // For parsing JSON bodies
  app.use(express.json());
  // Allow all origins
  app.use(cors({ origin: "*" }));

  // Configure Cloudinary storage
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "travel_stories",
      allowed_formats: ["jpg", "jpeg", "png"],
      transformation: [{ width: 1000, height: 1000, crop: "limit" }]
    }
  });

  // File filter - only allow image files
  const fileFilter = (req, file, cb) => {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, JPG and PNG files are allowed"), false);
    }
  };

  // Initialize upload with Cloudinary
  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB file size limit
    },
    fileFilter: fileFilter,
  });

  // Make sure the assets directory exists
  const assetsDir = path.resolve(__dirname, "assets");
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  // Log the path for debugging
  console.log("Assets directory:", assetsDir);

  // Serve Static Files - use absolute paths with path.resolve
  app.use("/assets", express.static(assetsDir));

  // Registration
  app.post("/create-account", async (req, res) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    try {
      const isUser = await User.findOne({ email });
      if (isUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        fullName,
        email,
        password: hashedPassword,
      });

      const accesstoken = jwt.sign(
        { id: user._id },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "72h",
        }
      );

      return res.status(201).json({
        error: false,
        user: {
          fullName: user.fullName,
          email: user.email,
        },
        accesstoken,
        message: "Registration successful",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: true, message: "Server Error" });
    }
  });

  // Login
  app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "User does not exist" });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid Password" });
      }
      const accesstoken = jwt.sign(
        { id: user._id },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "72h",
        }
      );
      return res.status(200).json({
        error: false,
        user: {
          fullName: user.fullName,
          email: user.email,
        },
        accesstoken,
        message: "Login successful",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: true, message: "Server Error" });
    }
  });

  // Get user
  app.get("/get-user", authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
      const isUser = await User.findOne({ _id: userId });

      if (!isUser) {
        return res.status(400).json({ message: "User does not exist" });
      }

      return res.status(200).json({
        user: {
          fullName: isUser.fullName,
          email: isUser.email,
        },
        message: "User fetched successfully",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: true, message: "Server Error" });
    }
  });

  // Add travel Story
  app.post("/add-travel-story", authenticateToken, async (req, res) => {
    try {
      // Check if request body exists
      if (!req.body) {
        return res.status(400).json({ message: "Request body is missing" });
      }

      const {
        title,
        story,
        visitedLocation,
        isFavourite,
        visitedDate,
        imageUrl,
      } = req.body;

      // Access the correct property from the token
      const userId = req.user.id;

      // Check if all fields are present
      if (
        !title ||
        !story ||
        !visitedLocation ||
        imageUrl === undefined ||
        visitedDate === undefined
      ) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const travelStory = await TravelStory.create({
        title,
        story,
        visitedLocation,
        isFavourite: isFavourite || false,
        visitedDate,
        imageUrl,
        userId,
      });

      return res.status(201).json({
        error: false,
        travelStory,
        message: "Travel story added successfully",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: true, message: "Server Error" });
    }
  });

  // Get all stories
  app.get("/get-all-stories", authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
      const travelStories = await TravelStory.find({ userId: userId }).sort({
        isFavourite: -1,
      });
      return res.status(200).json({ error: false, travelStories });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: true, message: "Server Error" });
    }
  });

  // Edit Travel Stories
  app.post("/edit-story/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { title, story, visitedLocation, isFavourite, visitedDate, imageUrl } =
      req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!title || !story || !visitedLocation || !visitedDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Parse date - handle string date format
    let parsedVisitedDate;
    try {
      parsedVisitedDate = new Date(visitedDate);
      if (isNaN(parsedVisitedDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
    } catch (err) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    try {
      // Correct MongoDB query syntax
      const updatedStory = await TravelStory.findOne({
        _id: id,
        userId: userId,
      });

      if (!updatedStory) {
        return res.status(404).json({
          message:
            "Travel Story not found or you don't have permission to edit it",
        });
      }

      const placeholderImage = "assets/Run It Up.png"; // Replace with your placeholder image

      updatedStory.title = title;
      updatedStory.story = story;
      updatedStory.visitedLocation = visitedLocation;
      updatedStory.isFavourite = isFavourite;
      updatedStory.visitedDate = parsedVisitedDate;
      updatedStory.imageUrl = imageUrl || placeholderImage;

      await updatedStory.save();

      return res.status(200).json({
        error: false,
        updatedStory,
        message: "Story updated successfully",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: true, message: "Server Error" });
    }
  });

  // Upload image to Cloudinary
  app.post("/image-upload", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // With Cloudinary, the file object now contains the result from Cloudinary
      const imageUrl = req.file.path;
      
      res.status(201).json({ 
        imageUrl,
        secure_url: req.file.secure_url,
        public_id: req.file.public_id
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: true, message: "Server Error" });
    }
  });

  app.get("/search", authenticateToken, async (req, res) => {
    const { query } = req.query;
    const userId = req.user.id;

    console.log("Search request - UserID:", userId, "Query:", query);

    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    try {
      const searchResults = await TravelStory.find({
        userId: userId,
        $or: [
          { title: { $regex: query, $options: "i" } },
          { story: { $regex: query, $options: "i" } },
          { visitedLocation: { $regex: query, $options: "i" } },
        ],
      }).sort({
        isFavourite: -1,
      });

      console.log(`Found ${searchResults.length} results for query "${query}"`);

      res.status(200).json({
        error: false,
        searchResults,
      });
    } catch (err) {
      console.error("Error performing search:", err);
      return res.status(500).json({ error: true, message: "Server Error" });
    }
  });

  // Delete image from Cloudinary
  app.delete("/delete-image/:public_id", authenticateToken, async (req, res) => {
    try {
      const publicId = req.params.public_id;
      
      // Delete the image from Cloudinary
      const result = await cloudinary.uploader.destroy(publicId);
      
      if (result.result === 'ok') {
        return res.status(200).json({
          error: false,
          message: "Image deleted successfully from Cloudinary",
        });
      } else {
        return res.status(404).json({
          error: true,
          message: "Image not found or could not be deleted",
        });
      }
    } catch (err) {
      console.error("Error deleting image from Cloudinary:", err);
      return res.status(500).json({
        error: true,
        message: "Server Error",
      });
    }
  });

  // Delete story and associated image
  app.delete("/delete-story/:id", authenticateToken, async (req, res) => {
    try {
      const storyId = req.params.id;
      const userId = req.user.id;

      // Find the story first to get its image URL
      const story = await TravelStory.findOne({ _id: storyId, userId: userId });

      if (!story) {
        return res.status(404).json({
          error: true,
          message: "Story not found or you don't have permission to delete it",
        });
      }

      // Get the image URL from the story
      const imageUrl = story.imageUrl;

      // Delete the story from the database
      await TravelStory.deleteOne({ _id: storyId, userId: userId });

      // If the image URL exists and is hosted on Cloudinary, delete it
      if (imageUrl && imageUrl.includes("cloudinary.com")) {
        try {
          // Extract the public_id from the Cloudinary URL
          const urlParts = imageUrl.split('/');
          const filenameWithExtension = urlParts[urlParts.length - 1];
          const filename = filenameWithExtension.split('.')[0];
          const folderPath = urlParts[urlParts.length - 2];
          const publicId = `${folderPath}/${filename}`;
          
          // Delete from Cloudinary
          const result = await cloudinary.uploader.destroy(publicId);
          console.log(`Deleted image from Cloudinary: ${publicId}, result: ${result.result}`);
        } catch (err) {
          console.error("Error deleting image from Cloudinary:", err);
          // Continue execution even if image deletion fails
        }
      }

      return res.status(200).json({
        error: false,
        message: "Story deleted successfully",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: true, message: "Server Error" });
    }
  });

  app.listen(8080, () => {
    console.log("Server is running on port 8080");
  });

  module.exports = app;