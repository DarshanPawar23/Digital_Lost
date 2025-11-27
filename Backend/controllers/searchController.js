const db = require('../config/db'); 

exports.searchFoundItems = async (req, res) => {
    const { product, category, location } = req.query;

    if (!product && !category && !location) {
        return res.status(400).json({ message: "Please provide search criteria (product, category, or location)." });
    }

    try {
        let sql = `
            SELECT 
                item_id, 
                description, 
                location_desc, 
                city, 
                category, 
                latitude, 
                longitude, 
                image_path,
                found_date 
            FROM found_items 
            WHERE 1=1
        `;
        const params = [];

        if (category) {
            sql += ` AND category = ?`;
            params.push(category);
        }

        if (product) {
            sql += ` AND (description LIKE ? OR location_desc LIKE ?)`;
            params.push(`%${product}%`);
            params.push(`%${product}%`);
        }

        if (location) {
            sql += ` AND (city LIKE ? OR location_desc LIKE ?)`;
            params.push(`%${location}%`);
            params.push(`%${location}%`);
        }
        
        sql += ` ORDER BY found_date DESC LIMIT 50;`;

        const [rows] = await db.execute(sql, params);
        
        res.status(200).json({ 
            message: `Found ${rows.length} relevant items.`,
            results: rows 
        });

    } catch (error) {
        console.error('Error during search:', error);
        res.status(500).json({ message: 'Server error during search operation.', error: error.message });
    }
};

exports.getFinderContact = async (req, res) => {
    const { item_id } = req.params; 

    try {
        const sql = `
            SELECT finder_contact
            FROM found_items 
            WHERE item_id = ?;
        `;
        const [rows] = await db.execute(sql, [item_id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Item not found." });
        }
        
        res.status(200).json({ 
            contact: rows[0].finder_contact
        });

    } catch (error) {
        console.error('Error retrieving contact:', error);
        res.status(500).json({ message: 'Server error retrieving contact.', error: error.message });
    }
};