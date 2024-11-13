const { Router } = require('express');
const studentRouter = Router();
// imported middleware
// studentRouter.use(adminMiddleware);

const { DeptModel, BatchModel, SubjectsModel, SemesterModel, StudentModel } = require('../db');
const { default: mongoose } = require('mongoose');

//function to calculate the subjects amount
const calculateCost = (subjectCode) => {
    if (subjectCode.toUpperCase().includes("T+L")){
        return "600";
    }else{
        return "300";
    }
}

//function to create the semester
const createSemester = async (semesters, batch_id) => {
    console.log(batch_id)
    const semArray = [];
    for (const semester of semesters) {
        
        const createdSemester = await SemesterModel.create(
            { 
                sem_no: semester.sem_no,
                batch: batch_id
            });

        for (const subject of semester.subjects) {
            const cost = calculateCost(subject.code);
            
            let createdSubject = await SubjectsModel.findOne({ code: subject.code });
            // console.log(createdSubject);

            if (!createdSubject) {
                createdSubject = await SubjectsModel.create({
                    sem_no: semester.sem_no,
                    code: subject.code,
                    name: subject.name,
                    paper_cost: cost
                });
            }

            createdSemester.subjects.push(new mongoose.Types.ObjectId(createdSubject._id));
        }

        await createdSemester.save();
        semArray.push(new mongoose.Types.ObjectId(createdSemester._id));
    }
    console.log(semArray)
    return semArray
};

// function to create the student data 
const createStudent = async (studentData) => {
    const studentsRef = []
    for ( student of studentData){
        // console.log(student)
        const { reg_no, name, papers } = student;
        const paperReferences = [];
        // console.log("-------",
            // reg_no,
            // name,
            // papers)
        for (const paper of papers) {
            const { code, type } = paper;

            // Find the subject by its code
            let subject = await SubjectsModel.findOne({ code: code });
            if (!subject) {
                // Optional: handle cases where the subject code is not found
                // console.log(`Subject with code ${code} not found.`);
                continue;
            }

            // Push the paper with its ObjectId reference and type
            paperReferences.push({
                paper: subject._id,
                type: type
            });
            // console.log("paperReferences", paperReferences)
        }

        // Create the student with their papers
        let createdStudent = await StudentModel.findOne({ reg_no: reg_no });
        if (!createdStudent){
            createdStudent = await StudentModel.create({
                reg_no: reg_no,
                name: name,
                papers: paperReferences
            });         
            
        } 

        
        studentsRef.push(new mongoose.Types.ObjectId(createdStudent._id))
    }
    return studentsRef
};

//route to insert the student data's inm data base
studentRouter.post("/insert", async (req, res) => {
    console.log("Vantaapla..")
    const insertData = req.body.data;
    const deptId = req.body.dept;
    const batch = req.body.batch; //2026
    // console.log(deptId, batch, insertData)
    if(!(insertData && deptId && batch)){
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

        //creating semesters
        const semArray = await createSemester(insertData.semesters, createdBatch._id)
        createdBatch.semesters = semArray
        await createdBatch.save()  
        
        department.batches.push(new mongoose.Types.ObjectId(createdBatch._id))
        await department.save()

        //creating Students
        
        const studentData = insertData.students;  // Assuming student data is directly in the request body
        
        if (!(studentData.length > 0)) {
            return res.status(400).json({ message: "Incomplete student data" });
        }

        const studentsRef = await createStudent(studentData);
        createdBatch.students = studentsRef
        await createdBatch.save()


        res.status(201).json({
            message: "Datas Inserted successfully"
        });
        
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: "Error in Inserting Data",
            error: err.message
        });
    }
})

//route to display all the student by filtering batch and dept.
studentRouter.post('/all', async (req, res) => {
    const { dept_id, batch } = req.body; // Extract dept_id and batch from query parameters

    if (!dept_id || !batch) {
        return res.status(400).json({
            message: "Please provide both dept_id and batch as query parameters."
        });
    }

    try {
        // Find students related to the found batch
        const batchDoc = await BatchModel.findOne({ batch, department: dept_id })
            .populate({
                path: 'students',
                model: 'Students',  // Ensure this matches exactly with the Student model name
                populate: {
                    path: 'papers.paper',
                    model: 'Subjects', // Ensure this matches the Subject model name
                    select: 'code name paper_cost sem_no'
                }
            });


        if (!batchDoc) {
            return res.status(404).json({ message: "Batch not found in the specified department." });
        }
        res.status(200).json({
            message: "Students data retrieved successfully",
            data: batchDoc.students
        });
    } catch (error) {
        console.error("Error fetching students for the specified department and batch:", error);
        res.status(500).json({
            message: "Error retrieving student data",
            error: error.message
        });
    }
});

//--------------------------------------------------------------------------------------------------------------------------------------//

//futuristic routes for adding sub, sem need to update all the routes
// Endpoint to add a subject
//--------------------------------------------------------------------------------------------------------------------------------------//


// studentRouter.post("/add_Subject", async (req, res) => {
//     const { code, name, paper_cost } = req.body;
//     try {
//         const createdSubject = await SubjectsModel.create({ code, name, paper_cost });
//         res.status(201).json({
//             message: "Subject created successfully",
//             data: createdSubject
//         });
//     } catch (err) {
//         res.status(500).json({
//             message: "Error adding subject",
//             error: err.message
//         });
//     }
// });

// // Endpoint to get all subjects
// studentRouter.get("/subjects", async (req, res) => {
//     try {
//         const subjects = await SubjectsModel.find();
//         res.status(200).json({ subjects });
//     } catch (err) {
//         res.status(500).json({
//             message: "Error retrieving subjects",
//             error: err.message
//         });
//     }
// });

// // Endpoint to add a semester
// studentRouter.post("/add_Semester", async (req, res) => {
//     const { sem_no, subjectIds } = req.body;
//     console.log(subjectIds)
//     try {
//         const createdSemester = await SemesterModel.create({ sem_no, subjectIds });
//         res.status(201).json({
//             message: "Semester created successfully",
//             data: createdSemester
//         });
//     } catch (err) {
//         res.status(500).json({
//             message: "Error adding semester",
//             error: err.message
//         });
//     }
// });

// // Endpoint to get all semesters with subjects
// studentRouter.get("/semesters", async (req, res) => {
//     try {
//         const semesters = await SemesterModel.find()
//         res.status(200).json({ semesters });
//     } catch (err) {
//         res.status(500).json({
//             message: "Error retrieving semesters",
//             error: err.message
//         });
//     }
// });

// // Endpoint to add a student
// studentRouter.post("/add_Student", async (req, res) => {
//     const { reg_no, name, papers } = req.body;
//     try {
//         const student = new StudentModel({
//             reg_no,
//             name,
//             papers: papers.map(id => mongoose.Types.ObjectId(id))
//         });
//         const createdStudent = await student.save();
//         res.status(201).json({
//             message: "Student created successfully",
//             data: createdStudent
//         });
//     } catch (err) {
//         res.status(500).json({
//             message: "Error creating student",
//             error: err.message
//         });
//     }
// });

// // Endpoint to get all students
// studentRouter.get("/students", async (req, res) => {
//     try {
//         const students = await StudentModel.find().populate('subjects').populate('batch').populate('department');
//         res.status(200).json({ students });
//     } catch (err) {
//         res.status(500).json({
//             message: "Error retrieving students",
//             error: err.message
//         });
//     }
// });

//--------------------------------------------------------------------------------------------------------------------------------------//


module.exports = {  
    studentRouter: studentRouter
 };