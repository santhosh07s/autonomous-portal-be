const { Router } = require('express');
const studentRouter = Router();
// imported middleware
const { adminMiddleware } = require('../middleware/adminAuth');
// studentRouter.use(adminMiddleware);

const { DeptModel, BatchModel, SubjectsModel, SemesterModel, StudentModel } = require('../db');


// Endpoint to add a subject
studentRouter.post("/insert", async (req, res) => {
    console.log("Vantaapla..")
    const rawData = req.body.data;
    const deptId = req.body.dept;
    const batch = req.body.batch;
    // console.log(deptId, batchID, rawData)
    if(!(rawData && deptId && batch)){
        return res.status(400).json({
            message: "No Data to add"
        });
    }
    
    try {
        // Creating Batch
        const department = await DeptModel.findById(deptId);
        if (!department) {
            return res.status(404).json({ message: "Department not found" });
        }
        const createdBatch = await BatchModel.create({ batch, department: deptId });
        const batchId = createdBatch._id

        // Creating semester
        
        
    } catch (err) {
        res.status(500).json({
            message: "Error adding batch",
            error: err.message
        });
    }





    try {
        console.log(rawData)
        // const createdSubject = await SubjectsModel.create({ code, name, paper_cost });
        res.status(201).json({
            message: "Subject created successfully",
        });
    } catch (err) {
        res.status(500).json({
            message: "Error adding subject",
            error: err.message
        });
    }
})


studentRouter.post("/add_full_data", async (req, res) => {
    const { semesterData, subjectsData, studentsData } = req.body.semesterData.subjectsData.studentsData;

    try {
        // 1. Create or Find Semester
        let semester = await SemesterModel.findOne({ sem_no: semesterData.sem_no });
        if (!semester) {
            semester = await SemesterModel.create({ sem_no: semesterData.sem_no });
        }

        // 2. Add Subjects and Link to Semester
        const subjectIds = await Promise.all(subjectsData.map(async (subject) => {
            let existingSubject = await SubjectsModel.findOne({ code: subject.code });
            if (!existingSubject) {
                existingSubject = await SubjectsModel.create(subject);
            }
            return existingSubject._id;
        }));
        semester.subject = subjectIds;
        await semester.save();

        // 3. Add Student Details
        const studentPromises = studentsData.map(async (student) => {
            const papers = await Promise.all(Object.keys(student).map(async (subjectCode) => {
                const status = student[subjectCode];
                const subject = await SubjectsModel.findOne({ code: subjectCode });
                if (subject) {
                    return { subject: subject._id, status };
                }
            }).filter(paper => paper !== undefined));

            return StudentModel.create({
                reg_no: student.reg_no,
                name: student.name,
                papers,
            });
        });

        const students = await Promise.all(studentPromises);

        // Respond with created data
        res.status(201).json({
            message: "Data added successfully",
            data: { semester, subjects: subjectIds, students }
        });
    } catch (err) {
        res.status(500).json({
            message: "Error adding data",
            error: err.message
        });
    }
});






// Endpoint to add a subject
studentRouter.post("/add_Subject", async (req, res) => {
    const { code, name, paper_cost } = req.body;
    try {
        const createdSubject = await SubjectsModel.create({ code, name, paper_cost });
        res.status(201).json({
            message: "Subject created successfully",
            data: createdSubject
        });
    } catch (err) {
        res.status(500).json({
            message: "Error adding subject",
            error: err.message
        });
    }
});

// Endpoint to get all subjects
studentRouter.get("/subjects", async (req, res) => {
    try {
        const subjects = await SubjectsModel.find();
        res.status(200).json({ subjects });
    } catch (err) {
        res.status(500).json({
            message: "Error retrieving subjects",
            error: err.message
        });
    }
});

// Endpoint to add a semester
studentRouter.post("/add_Semester", async (req, res) => {
    const { sem_no, subjectIds } = req.body;
    console.log(subjectIds)
    try {
        const createdSemester = await SemesterModel.create({ sem_no, subjectIds });
        res.status(201).json({
            message: "Semester created successfully",
            data: createdSemester
        });
    } catch (err) {
        res.status(500).json({
            message: "Error adding semester",
            error: err.message
        });
    }
});

// Endpoint to get all semesters with subjects
studentRouter.get("/semesters", async (req, res) => {
    try {
        const semesters = await SemesterModel.find()
        res.status(200).json({ semesters });
    } catch (err) {
        res.status(500).json({
            message: "Error retrieving semesters",
            error: err.message
        });
    }
});

// Endpoint to add a student
studentRouter.post("/add_Student", async (req, res) => {
    const { reg_no, name, papers } = req.body;
    try {
        const student = new StudentModel({
            reg_no,
            name,
            papers: papers.map(id => mongoose.Types.ObjectId(id))
        });
        const createdStudent = await student.save();
        res.status(201).json({
            message: "Student created successfully",
            data: createdStudent
        });
    } catch (err) {
        res.status(500).json({
            message: "Error creating student",
            error: err.message
        });
    }
});

// Endpoint to get all students
studentRouter.get("/students", async (req, res) => {
    try {
        const students = await StudentModel.find().populate('subjects').populate('batch').populate('department');
        res.status(200).json({ students });
    } catch (err) {
        res.status(500).json({
            message: "Error retrieving students",
            error: err.message
        });
    }
});

module.exports = {  
    studentRouter: studentRouter
 };