const db = require('../config/db'); 
const fs = require('fs'); 

// Utility function to safely delete a file (prevents sync errors)
const deleteFile = (path) => {
    try {
        if (path && fs.existsSync(path)) {
            fs.unlinkSync(path);
        }
    } catch (err) {
        console.error("Error cleaning up file:", err);
    }
};

exports.uploadFoundItem = async (req, res) => {
    const imagePath = req.file ? req.file.path : null; 

    try {
        const { 
            description, 
            location_desc, 
            contact_no, 
            city, 
            category, 
            latitude, 
            longitude 
           
        } = req.body;
        
        if (!imagePath || !description || !contact_no || !category) {
            if (imagePath) deleteFile(imagePath); 
            return res.status(400).json({ message: 'Missing required item details or image.' });
        }
        const query = `
            INSERT INTO found_items 
            (description, location_desc, contact_no, city, category, latitude, longitude, image_path, finder_contact) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        const values = [
            description,
            location_desc,
            contact_no,
            city,
            category,
            latitude || null, 
            longitude || null,
            imagePath, 
            contact_no 
        ];
        
        await db.execute(query, values); 
        res.status(201).json({ 
            message: 'Found item successfully posted!', 
            image_path: imagePath 
        });

    } catch (error) {

        deleteFile(imagePath); 
        
        console.error('Error posting found item:', error);
        res.status(500).json({ 
            message: 'Server error during upload.', 
            error: error.message 
        });
    }
};