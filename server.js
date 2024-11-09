const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors  = require('cors')
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI)
const allowedOrigins = ['http://localhost:5173'];
app.use(cors({
    origin: allowedOrigins
  }));

//routes - files
const { adminRouter } = require('./routes/admin');
const { mainRouter } = require('./routes/main');
const { studentRouter } = require('./routes/students');


app.use(express.json()) //json middleware

app.use('/admin', adminRouter);
app.use('/main', mainRouter );
app.use('/students',studentRouter)


app.listen(3000, ()=>{
    console.log("Server is Running !")
})

