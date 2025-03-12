const queries = require("./test_queries")
const pool = require("../database")
const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');
const removeBOM = require('remove-bom-stream');
async function getVisibleRecords(){
    try{
        const image_dir= '/Users/lalitarvind/Downloads/Library_Management'
        const [rows] = await pool.query(queries.getVisibleProfiles);
        for(let record of rows){
            if (record.image_path!=null){
                let sources = []
                for(let imgPath of record.image_path){
                    const imagePath = path.join(image_dir, imgPath);
                    const image = fs.readFileSync(imagePath);
                    const base64Image = Buffer.from(image).toString("base64");
                    sources.push(`data:image/png;base64,${base64Image}`);
                }
                record.imageSrc = sources;
            }
            else{
                record.imageSrc = []
            }
        }
        return rows;
    }catch(error){
        console.error("Database Error:", error.message);
        throw ({ status:500 , message:"Database operation failed"});
    }
}

async function getProfileByID(id) {
    try{
        const [row] = await pool.query(queries.getProfileByID,[id]);
        const image_dir= '/Users/lalitarvind/Downloads/Library_Management/'
        if (row[0].image_path!=null){
            let sources = []
            for(let pth of row[0].image_path){
                const imagePath = path.join(image_dir, pth);
                const image = fs.readFileSync(imagePath);
                const base64Image = Buffer.from(image).toString("base64");
                sources.push(`data:image/png;base64,${base64Image}`);
            }
            row[0].imageSrc = sources;
        }
        else{
            row[0].imageSrc = []
        }
        return row
    }catch(error){ 
        console.error("Database Error:", error.message);
        throw ({ status:500 , message:"Database operation failed"});
    }
}

async function updateVisibility(rids){
    try{
        const rid_str = rids.join(',')
        await pool.query(queries.updateProfileVisibility,[rid_str]);
    }catch(error){
        console.error("Database Error:", error.message);
        throw ({ status:500 , message:"Database operation failed"});
    }
}

async function createRecord(fname,lname,email,phone,gender,dob,filepath){
    try{
        await pool.query(queries.createProfile,[fname,lname,email,phone,gender,dob,filepath])
    }catch(error){
        console.error("Database Error:", error.message);
        throw ({ status:500 , message:"Database operation failed"});
    }
}

async function updateRecord(rid, updates){
    const fields = Object.keys(updates).map((key) => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    try{
        await pool.query(`UPDATE user_profile SET ${fields} WHERE id = ?`, [...values, rid]);
    }catch(error){
        console.error("Database Error:", error.message);
        throw ({ status:500 , message:"Database operation failed"});
    }
}

async function importRecordsFromFile(filePath){
    const results = [];
    const EXPECTED_HEADERS = ['first_name','last_name','email','phone','dob','gender']
    const stream = fs.createReadStream(filePath).pipe(removeBOM('utf-8')).pipe(csvParser());
    // Read and Process CSV
    stream.on('headers', (headers) => {     
        isValidHeaders = EXPECTED_HEADERS.every(header => headers.includes(header));
        if (!isValidHeaders) {
          fs.unlinkSync(filePath); // Delete file
          stream.destroy(); // Stop processing
          throw ({status:400,message:'Invalid CSV headers. Expected: ' + EXPECTED_HEADERS.join(', ') })
        }
      })
    stream.on('data', (data) => {
      results.push(data);
    })
    stream.on('end', async () => {
    //   console.log('CSV File Processed:', results);
      const values = results.map(row => [row.first_name, row.last_name, row.email, row.phone, row.gender, row.dob]);
      try{
        await pool.query(queries.createMulProfiles,[values]);
      }catch(error){
        console.error("Database Error:", error.message);
        throw ({ status:500 , message:"Database operation failed"});
      }
    })
    stream.on('error', (err) => {
      console.error('Error reading CSV:', err);
      throw ({ status:500 , message:"Error processing file"});
    });
}

module.exports = {getVisibleRecords, updateVisibility,createRecord, updateRecord, getProfileByID,importRecordsFromFile}
