const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET = process.env.ADMIN_JWT_SECRET;


const adminMiddleware = (req, res, next) =>{

    const token = req.headers.token;
    if(token){
        try{
            const jwtDecoded = jwt.verify( token , SECRET);
            req.adminId = jwtDecoded.id;
            next();
        }catch(err){
            res.status(403).json({
            message : "Authentication Failed",
            data : err
        })
        }
    }else{
        res.status(403).json({
            message : "Invalid admin - not authenticated"
        })
    }
    
}

module.exports = {
    adminMiddleware : adminMiddleware
}