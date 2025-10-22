// cloudinary.js

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// 🔐 Cloudinary Configuration using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,     // from .env file
  api_key: process.env.CLOUDINARY_API_KEY,           // from .env file
  api_secret: process.env.CLOUDINARY_API_SECRET      // from .env file
});

// 🗂️ Define storage strategy for Multer using Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'Wanderlust',                             // uploads will go into 'CrickZone' folder
    allowed_formats: ['jpeg', 'png', 'jpg']          // allowed image formats
  }
});

// 🌐 Export both cloudinary instance and storage for use in other files
module.exports = { cloudinary, storage };