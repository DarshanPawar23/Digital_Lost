const express = require("express");
const dotenv = require("dotenv");
const path = require('path'); 
dotenv.config();
const db = require("./config/db");

const app = express();

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(process.env.PORT, () => {
    console.log(` Server running on port ${process.env.PORT}`);
});
