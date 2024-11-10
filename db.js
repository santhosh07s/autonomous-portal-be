const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const Admin = new Schema({
    username : { type : String, unique : true},
    password : String
})

const Dept = new Schema({   
    department: String,
    
})

const batch = new Schema({
    batch: String, 
    department: { type:  Schema.Types.ObjectId, ref: 'Dept' }, 
    semesters: [{ type: Schema.Types.ObjectId, ref: 'semester' }],
    students: [{ type: Schema.Types.ObjectId, ref: 'Student' }]
})

const subjects = new Schema({
    code : { type : String, unique : true },
    name : String,
    paper_cost: String
})

const semester = new Schema({
    sem_no: { type: Number, unique: true },
    subjects : [{ type: Schema.Types.ObjectId, ref: 'subjects' }] 
})

const Students= new Schema({
    reg_no: Number, 
    name: String,
    // batch: { type: Schema.Types.ObjectId, ref: 'Batch' },
    // department: { type: Schema.Types.ObjectId, ref: 'Dept' }, 
    papers : [{ type: Schema.Types.ObjectId, ref: 'Subject' }], 
    // papers: [{subjects: { type: Schema.Types.ObjectId, ref: 'Subject'}, }]

});


const AdminModel = mongoose.model('Admins', Admin);
const DeptModel = mongoose.model('Departments', Dept);
const BatchModel = mongoose.model('Batches', batch);
const SubjectsModel = mongoose.model('Subjects', subjects)
const SemesterModel = mongoose.model('semester', semester)
const StudentModel = mongoose.model('Students', Students)


module.exports = {
    AdminModel : AdminModel,
    DeptModel : DeptModel,
    BatchModel : BatchModel,
    SubjectsModel : SubjectsModel,
    SemesterModel : SemesterModel,
    StudentModel :StudentModel
}