const { Router } = require('express');
const mainRouter = Router();
// imported middleware

// mainRouter.use(adminMiddleware);
// imported db file
const { DeptModel, BatchModel, SubjectsModel, SemesterModel, StudentModel } = require('../db');


// endpoint to add the department
mainRouter.post("/add_Dept", async(req,res)=>{
        const Dept = req.body.department;
    console.log(Dept)
        try{
            const CreatedDept = await DeptModel.create({
                department : Dept
            })
            
            if(CreatedDept){
                res.status(201).json({  
                    Message : "Department Created",
                    data: CreatedDept
                })
            }
        }
        catch(err){
            res.status(404).json({
                message : `Error in adding department `,
                errData : err
            })
        }
    })

// endpoint to display the entire department
mainRouter.get("/dept", async (req, res) => {
    try {
        const departments = await DeptModel.find()
        if(departments){
            res.status(200).json({ departments });
        }
    } catch (err) {
        res.status(500).json({
            message: "Error retrieving departments",
            error: err.message
        });
    }
});


// endpoint to add the batch
mainRouter.post("/add_Batch", async (req, res) => {
    const { batch, departmentId } = req.body;
    try {
        const department = await DeptModel.findById(departmentId);
        if (!department) {
            return res.status(404).json({ message: "Department not found" });
        }
        const createdBatch = await BatchModel.create({ batch, department: departmentId });
        res.status(201).json({
            message: "Batch created successfully and linked to department",
            data: createdBatch
        });
    } catch (err) {
        res.status(500).json({
            message: "Error adding batch",
            error: err.message
        });
    }
});

// endpoint to display the entire Batch
mainRouter.get("/batch", async (req, res) => {
    try {
        const batches = await BatchModel.find();    
        if (batches) {
            res.status(200).json({ batches });
        }
    } catch (err) {
        res.status(500).json({
            message: "Error retrieving batches",
            error: err.message
        });
    }
});

// to fetch sem and subs
mainRouter.post('/subjects', async (req, res) => {
    const { dept_id, batch } = req.body; // Extract dept_id and batch from query parameters

    if (!dept_id || !batch) {
        return res.status(400).json({
            message: "Please provide both dept_id and batch as query parameters."
        });
    }

    try {
        // Getting sem details
        const batchDoc = await BatchModel.findOne({ batch, department: dept_id })
            .populate({
                path: 'semesters',
                model: 'semester', 
                populate: {
                    path: 'subjects',
                    model: 'Subjects', 
                    select: 'code name sem_no'
                }
            });


        if (!batchDoc) {
            return res.status(404).json({ message: "Batch not found in the specified department." });
        }
        res.status(200).json({
            message: "Students data retrieved successfully",
            data: batchDoc.semesters
        });
    } catch (error) {
        console.error("Error fetching students for the specified department and batch:", error);
        res.status(500).json({
            message: "Error retrieving student data",
            error: error.message
        });
    }
});


module.exports = {
    mainRouter : mainRouter
}

