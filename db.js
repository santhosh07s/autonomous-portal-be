const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const Admin = new Schema({
    username : { type : String, unique : true},
    password : String
})

const AdminModel = mongoose.model('admins', Admin);


module.exports = {
    AdminModel : AdminModel,
} 