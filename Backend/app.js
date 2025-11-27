const express = require("express");
const dotenv = require("dotenv");
const path = require('path'); 
const cors = require('cors'); 
const fs = require('fs'); 

dotenv.config();
const db = require("./config/db");
const foundRoutes = require('./routes/foundRoutes'); 
const searchRoutes = require('./routes/searchRoute'); 


// Define the full, nested directory path
const uploadsDir = path.join(__dirname, 'uploads', 'found_images'); 

try {
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true }); 
        console.log(`Upload directory created: ${uploadsDir}`);
    }
} catch (err) {
    console.error("Error creating uploads directory:", err);
}

const app = express();

app.use(cors({
    origin: 'http://localhost:5173' 
})); 

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

app.use('/api', foundRoutes); 
app.use('/api', searchRoutes); 

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
});