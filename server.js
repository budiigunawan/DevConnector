const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const connectDB = require("./config/db");

/// Connect Database
connectDB();

app.get("/",(req,res) => {
    res.send("API is running");
})

app.listen(PORT,() => console.log(`Server is running on port ${PORT}`))