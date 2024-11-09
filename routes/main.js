const { Router } = require('express');
const mainRouter = Router();
// imported middleware
const { adminMiddleware } = require('../middleware/adminAuth');

mainRouter.use(adminMiddleware);
// imported db file
const { DeptModel } = require('../db');
const { BatchModel } = require('../db');

// to add the department
mainRouter.post("/add_Dept", async(req,res)=>{
    const Dept = req.body.department;
    try{
        const CreatedDept = await DeptModel.create({
            department : Dept
        })
        console.log(CreatedDept)

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

// to display the department
mainRouter.get("/dept", async(req,res)=>{
    const data = await DeptModel.find();
    if(data){
        res.status(201).json({  
            department : data
        })
    }else{
        res.status(404).json({
            message : "Can't get Data",
        })
    }
})

//to add the batch
mainRouter.post("/add_Batch", async(req,res)=>{
    const Batch = req.body.batch;
    try{
        const CreatedBatch = await BatchModel.create({
            batch : Batch

        })
        if(CreatedBatch){
            res.status(201).json({  
                Message : "Batch Created",
                data: CreatedBatch
            })
        }
    }
    catch(err){
        res.status(404).json({
            message : `Error in adding batch `,
            errData : err
        })
    }
})

//to display the batch
mainRouter.get("/batch", async(req,res)=>{
        const data = await BatchModel.find();
        if(data){
            res.status(201).json({  
                batch : data
            })
        }else{
            res.status(404).json({
                message : "Can't get Data",
            })
        }
})


module.exports = {
    mainRouter : mainRouter
}

