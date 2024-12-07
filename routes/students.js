const { Router } = require("express");
const studentRouter = Router();
// imported middleware
// studentRouter.use(adminMiddleware);

const {
  DeptModel,
  BatchModel,
  SubjectsModel,
  SemesterModel,
  StudentModel,
} = require("../db");
const { default: mongoose } = require("mongoose");

//function to calculate the subjects amount
const calculateCost = (subjectCode) => {
  if (subjectCode.toUpperCase().includes("T+L")) {
    return "500";
  } else {
    return "300";
  }
};

//function to create the semester
const createSemester = async (semesters, batch_id) => {
  // console.log(batch_id);
  const semArray = [];
  for (const semester of semesters) {
    const createdSemester = await SemesterModel.create({
      sem_no: semester.sem_no,
      batch: batch_id,
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
          paper_cost: cost,
        });
      }

      createdSemester.subjects.push(
        new mongoose.Types.ObjectId(createdSubject._id)
      );
    }

    await createdSemester.save();
    semArray.push(new mongoose.Types.ObjectId(createdSemester._id));
  }
  // console.log(semArray);
  return semArray;
};

// function to create the student data
const createStudent = async (studentData) => {
  const studentsRef = [];
  for (student of studentData) {
    // console.log(student)
    const { reg_no, name, dob, papers } = student;
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
        type: type,
      });
      // console.log("paperReferences", paperReferences)
    }

    // Create the student with their papers
    let createdStudent = await StudentModel.findOne({ reg_no: reg_no });
    if (!createdStudent) {
      createdStudent = await StudentModel.create({
        reg_no: reg_no,
        name: name,
        dob: dob,
        papers: paperReferences,
      });
    }

    studentsRef.push(new mongoose.Types.ObjectId(createdStudent._id));
  }
  return studentsRef;
};

//route to insert the student data's inm data base
studentRouter.post("/insert", async (req, res) => {
  console.log("Vantaapla..");
  const insertData = req.body.data;
  const deptId = req.body.dept;
  const batch = req.body.batch; //2026
  // console.log(deptId, batch, insertData)
  if (!(insertData && deptId && batch)) {
    return res.status(400).json({
      message: "No Data to add",
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
    const semArray = await createSemester(
      insertData.semesters,
      createdBatch._id
    );
    createdBatch.semesters = semArray;
    await createdBatch.save();

    department.batches.push(new mongoose.Types.ObjectId(createdBatch._id));
    await department.save();

    //creating Students

    const studentData = insertData.students; // Assuming student data is directly in the request body

    if (!(studentData.length > 0)) {
      return res.status(400).json({ message: "Incomplete student data" });
    }

    const studentsRef = await createStudent(studentData);
    createdBatch.students = studentsRef;
    await createdBatch.save();

    res.status(201).json({
      message: "Datas Inserted successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error in Inserting Data",
      error: err.message,
    });
  }
});

//route to display all the student by filtering batch and dept.
studentRouter.post("/all", async (req, res) => {
  const { dept_id, batch } = req.body; // Extract dept_id and batch from query parameters

  if (!dept_id || !batch) {
    return res.status(400).json({
      message: "Please provide both dept_id and batch as query parameters.",
    });
  }

  try {
    // Find students related to the found batch
    const batchDoc = await BatchModel.findOne({
      batch,
      department: dept_id,
    }).populate({
      path: "students",
      model: "Students", // Ensure this matches exactly with the Student model name
      populate: {
        path: "papers.paper",
        model: "Subjects", // Ensure this matches the Subject model name
        select: "code name paper_cost sem_no",
      },
    });

    if (!batchDoc) {
      return res
        .status(404)
        .json({ message: "Batch not found in the specified department." });
    }
    res.status(200).json({
      message: "Students data retrieved successfully",
      data: batchDoc.students,
    });
  } catch (error) {
    console.error(
      "Error fetching students for the specified department and batch:",
      error
    );
    res.status(500).json({
      message: "Error retrieving student data",
      error: error.message,
    });
  }
});

studentRouter.post("/deleteBatch", async (req, res) => {
  const { batch, department_id } = req.body;
  // console.log(batch, department_id )
  try {
    // Step 1: Find the batch document
    const batchDoc = await BatchModel.findOne({
      department: department_id,
      batch: batch,
    });
    console.log(batchDoc)
    if (!batchDoc) {
      return res.status(404).json({ message: "Batch not found" });
    }

    // Step 2: Get all semester IDs from the batch
    const semesterIds = batchDoc.semesters;

    if (semesterIds.length > 0) {
      // Fetch all subject IDs before deleting the semesters
      // const allSubjectIds = await SemesterModel.find({
      //   _id: { $in: semesterIds },
      // })
      //   .select("subjects")
      //   .lean();

      // const subjectIds = allSubjectIds.flatMap((sem) => sem.subjects);

      // Delete semesters
      await SemesterModel.deleteMany({ _id: { $in: semesterIds } });

      // Delete related subjects
      // if (subjectIds.length > 0) {
      //   await SubjectsModel.deleteMany({ _id: { $in: subjectIds } });
      // }
    }

    // Step 3: Delete related students and their data
    const studentIds = batchDoc.students;
    if (studentIds.length > 0) {
      await StudentModel.deleteMany({ _id: { $in: studentIds } });
    }

    // Step 4: Delete the batch itself
    const deletedBatch = await BatchModel.deleteOne({ _id: batchDoc._id});

    if (deletedBatch.deletedCount === 0) {
      return res.status(404).json({ message: "Failed to delete the batch" });
    }

    // Step 5: Respond with success message
    res.status(200).json({
      message: "Batch and all related data deleted successfully",
    });
  } catch (error) {
    // console.error(error);
    res.status(500).json({ message: "An error occurred", error });
  }
});

// attendance portal
studentRouter.post("/allAttendance", async (req, res) => {
  const { subject_code } = req.body;
  console.log(subject_code);
  try {
    // Step 1: Find the subject by its code
    const subject = await SubjectsModel.findOne({ code: subject_code });
    console.log(subject);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    // Step 2: Find students who have this subject in their papers array
    const studentsWithSubject = await StudentModel.find({
      "papers.paper": subject._id,
    }).select("reg_no name");

    if (studentsWithSubject.length === 0) {
      return res
        .status(404)
        .json({ message: "No students found for this subject" });
    }

    // Step 3: Return the students in a separate array
    res.status(200).json({
      message: "Students found with the given subject",
      students: studentsWithSubject,
    });
  } catch (error) {
    // console.error(error);
    res.status(500).json({ message: "An error occurred", error });
  }
});

studentRouter.post("/deptAttendance", async (req, res) => {
  const { subject_code, department_id, batch } = req.body;

  try {
    // Step 1: Find the subject by its code
    const subject = await SubjectsModel.findOne({ code: subject_code });
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    // Step 2: Find the batch within the department
    const batchDoc = await BatchModel.findOne({
      department: department_id,
      batch: batch,
    }).populate({
      path: "students",
      select: "reg_no name papers",
      populate: {
        path: "papers.paper",
        model: "Subjects", // Correct model name from mongoose.model
        select: "code",
      },
    });

    if (!batchDoc) {
      return res.status(404).json({
        message: "Batch not found in the specified department",
      });
    }

    // Step 3: Filter students with the subject in their papers
    const studentsWithSubject = batchDoc.students.filter((student) =>
      student.papers.some(
        (paper) =>
          paper.paper && paper.paper._id.toString() === subject._id.toString()
      )
    );

    if (studentsWithSubject.length === 0) {
      return res.status(404).json({
        message:
          "No students found with the specified subject in the given batch and department",
      });
    }
    const resData = studentsWithSubject.map((std) => {
      return {
        name: std.name,
        reg_no: std.reg_no,
        id: std._id,
      };
    });
    // Step 4: Return the filtered students
    res.status(200).json({
      message: "Students found",
      students: resData,
    });
  } catch (error) {
    // console.error("Error fetching students: ", error);
    res.status(500).json({ message: "An error occurred", error });
  }
});

module.exports = {
  studentRouter: studentRouter,
};
