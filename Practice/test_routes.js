const express = require("express");
const jwt = require("jsonwebtoken");
const test_controller = require("./test_controller")
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { file, confluence } = require("fontawesome");
const { log } = require("console");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extract Bearer token

  if (!token) return res.status(401).json({ error: "Access token required" });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ error: "Invalid or expired token" });

      req.user = decoded;
      next(); 
  });
};

const storageImg = multer.diskStorage({
    destination: 'uploads/images', 
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });

const uploadImg= multer({ storage: storageImg });

router.post("/create",authenticateToken,uploadImg.array('files',5), async (req,res)=>{
    const {first_name,last_name,email,phone,gender,dob} = JSON.parse(req.body.jsondata)
    if (!req.files) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
    const files = req.files;
    let filepaths = []
    files.forEach(element => {
        filepaths.push(element.path)
    });

    try{
        await test_controller.createRecord(first_name,last_name,email,phone,gender,dob,JSON.stringify(filepaths))
        res.status(201).json({result:true,message:"Profile Registered Successfully"})
    }catch(error){
        res.status(error.status||500).json({error: error.message})
    }
})

router.patch("/update/:rid",authenticateToken, uploadImg.single('file'),async(req,res)=>{
    const rid = req.params.rid;
    const updates = JSON.parse(req.body.jsondata);
    if (req.file){
        updates["image_path"] = req.file.path
    }
    if (!Object.keys(updates).length) {
        return res.status(400).json({ error: 'No fields provided for update' });
      }
    try{
        await test_controller.updateRecord(rid,updates)
        res.status(201).json({message:"Record updated successfully"})
    }catch(error){
        res.status(error.status||500).json({error: error.message})
    }
})

router.post("/delete",authenticateToken,async(req,res)=>{
    const {rids} = req.body;
    try{
        await test_controller.updateVisibility(rids);
        res.status(201).json({message:"Record deleted successfully"})
    }catch(error){
        res.status(error.status||500).json({error: error.message})
    }
})


router.get("/all",authenticateToken, async (req,res)=>{
    try{
        const result = await test_controller.getVisibleRecords();
        return res.json(result);
    }catch(error){
        res.status(error.status||500).json({error: error.message})
    }
});
router.get("/one/:id",authenticateToken,async (req,res)=>{
    const id = req.params.id
    try{
        const result = await test_controller.getProfileByID(id);
        return res.json(result);
    }catch(error){
        res.status(error.status||500).json({error: error.message})
    }
})

const storageCSV = multer.diskStorage({
    destination: './uploads/csv_files', // Folder to save files
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });

const uploadCSV = multer({ storage: storageCSV });

router.post('/upload',authenticateToken,uploadCSV.single('file'),async (req,res)=>{
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
    try{
        await test_controller.importRecordsFromFile(req.file.path)
        res.json({ message: 'File uploaded successfully', file: req.file.filename });

    }catch(error){
        res.status(error.status||500).json({error: error.message})
    }
})



module.exports = router