const express = require('express');
const mongoose = require('mongoose');
const app = express();
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI)

//routes - files
const { adminRouter } = require('./routes/admin');
app.use(express.json()) //json middleware

app.use('/admin', adminRouter);

app.listen(3000, ()=>{
    console.log("Server is Running !")
})

