const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const Admin = new Schema({
    username : { type : String, unique : true},
    password : String
})

const Dept = new Schema({
    department: { type: String, required: true },
    batches: [{ type: Schema.Types.ObjectId, ref: 'batch' }],
    degree: {
        type: String,
        enum: ["B.E", "M.E", "B.Tech", "M.Tech"],  
        message: 'DEGREE must be "BE", "ME", "BTECH", "MTECH" '
    }
})

const batch = new Schema({
    batch: { type: String, required: true }, 
    department: { type:  Schema.Types.ObjectId, ref: 'Dept', required: true}, 
    semesters: [{ type: Schema.Types.ObjectId, ref: 'semester' }],
    students: [{ type: Schema.Types.ObjectId, ref: 'Students' }]
})
batch.index({ batch: 1, department: 1 }, { unique: true });


const semester = new Schema({
    sem_no: { type: Number, required: true },
    batch: { type: Schema.Types.ObjectId, ref: 'batch', required: true },
    subjects : [{ type: Schema.Types.ObjectId, ref: 'subject' }] 
})
semester.index({ batch: 1, sem_no: 1 }, { unique: true });

const subject = new Schema({
    code : { type : String, unique : true },
    name : { type: String, required: true }, 
    paper_cost: String,
    sem_no: { type: Number},
})

const Students= new Schema({
    reg_no: Number, 
    name: String,
    dob: String,
    papers: [
        {
            paper: { type: Schema.Types.ObjectId, ref: 'subject' }, 
            type: {
                type: String,
                required: true,
                enum: ['UA', 'U', 'Y'],  
                message: 'Type must be either "UA", "U", or "Y"'
            }
        }
    ]
    // batch: { type: Schema.Types.ObjectId, ref: 'Batch' },
    // department: { type: Schema.Types.ObjectId, ref: 'Dept' }, 

});


const AdminModel = mongoose.model('Admins', Admin);
const DeptModel = mongoose.model('Departments', Dept);
const BatchModel = mongoose.model('Batches', batch);
const SubjectsModel = mongoose.model('Subjects', subject)
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