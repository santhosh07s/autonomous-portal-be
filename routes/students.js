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
    const batchID = req.body.batch;
    // console.log(deptId, batchID, rawData)
    if(!rawData){
        return res.status(400).json({
            message: "No Data to add"
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