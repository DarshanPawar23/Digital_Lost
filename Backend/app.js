const express = require("express");
const dotenv = require("dotenv");
const path = require('path'); 
const cors = require('cors'); 
const fs = require('fs'); // File System module for directory management

dotenv.config();
const db = require("./config/db");
const foundRoutes = require('./routes/foundRoutes');

// Define the full, nested directory path
const uploadsDir = path.join(__dirname, 'uploads', 'found_images'); 

try {
    // Check if the directory exists, and create it recursively if it doesn't
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true }); 
        console.log(`Upload directory created: ${uploadsDir}`);
    }
} catch (err) {
    console.error("Error creating uploads directory:", err);
    // You might choose to exit the process here if directory creation is critical
}


const app = express();

app.use(cors({
    origin: 'http://localhost:5173' 
})); 

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

// Serve static files from the base 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

app.use('/api', foundRoutes); 

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
});