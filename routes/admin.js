const { Router } = require('express');
const adminRouter = Router();
const jwt = require('jsonwebtoken');
// const { adminMiddleware } = require('../../middleware/adminAuth');
require('dotenv').config();
const SECRET = process.env.ADMIN_JWT_SECRET;
//exported
const { AdminModel } = require('../db');


adminRouter.post("/login", async(req, res) => {
    const { username, password } = req.body;
    // console.log( username, password)
    try{
        const matchedAdmin = await AdminModel.findOne({
            username : username,
            password : password
        })
        // console.log(matchedAdmin)
        const token = jwt.sign({
            id : matchedAdmin._id
        },SECRET)
        // console.log(token)
        
        res.status(201).json({
            message : `Admin sign in success -> ${matchedAdmin.name}`,
            token: token
        })
    }catch(err){
        res.status(404).json({
            message : `Error in Admin SignIn `,
            errData : err
        })
    }
});

// adminRouter.use(adminMiddleware);



module.exports = {
    adminRouter : adminRouter
}