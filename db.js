const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const Admin = new Schema({
    username : { type : String, unique : true},
    password : String
})

const Dept = new Schema({   
    department: String,
    batches: [{ type: Schema.Types.ObjectId, ref: 'Batch' }] 
})

const batch = new Schema({
    batch: String, 
    department: { type: Schema.Types.ObjectId, ref: 'Dept' }, 
    semesters: [{ type: Schema.Types.ObjectId, ref: 'Semester' }],
    students: [{ type: Schema.Types.ObjectId, ref: 'Student' }]
})

const subjects = new Schema({
    code: String,
    name: String,
    paper_cost: String
})

const semester = new Schema({
    sem_no: Number,
    subjects: [{ type: Schema.Types.ObjectId, ref: 'Subject' }] 
})

const Students= new Schema({
    reg_no: Number, 
    name: String,
    // batch: { type: Schema.Types.ObjectId, ref: 'Batch' },
    // department: { type: Schema.Types.ObjectId, ref: 'Dept' }, 
    // subjects: [{ type: Schema.Types.ObjectId, ref: 'Subject' }], 
    papers: [{subject: { type: Schema.Types.ObjectId, ref: 'Subject'}, }]
    
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