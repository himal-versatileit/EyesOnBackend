const sql = require("mssql");
const fs = require("fs");
const db = require("../DbConfig/dbconfig");
const multer = require("multer");
const util = require("util");
const path = require("path");

filename = '';
// Ensure uploads directory exists
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/uploads/");
    },

    filename: (req, file, cb) => {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
        const year = now.getFullYear();
        const dateStr = `${day}_${month}_${year}`;
        
        const randomStr = Math.random().toString(36).substr(2, 7);
        const ext = path.extname(file.originalname);
        const generatedName = `${dateStr}_${randomStr}${ext}`;
        this.filename = generatedName;
        cb(null, generatedName);
    }
  });
  
  const upload = multer({ storage: storage }).single("incidentPhoto");

const manageIncident = async (req, res) => {
    let pool;
   
    try {
        upload(req, res, async (err) => {
            if (err) {
              return res.status(500).json({ message: "Error uploading file." });
            }
        
        const {incidentId = 0,guardId,shiftId,description,latitude,longitude} = req.body;

        if (!guardId || !shiftId || !description) {
            // Throw an error to be caught by the main catch block, which will handle cleanup
            const validationError = new Error("Missing required fields: guardId, shiftId, and description are required.");
            validationError.statusCode = 400;
            throw validationError;
        }

        const photoUrl = `public/uploads/${this.filename}`;

        const queryText = 'CALL sp_incident_crud($1, $2, $3, $4, $5, $6, $7, $8)';
        const queryParams=[incidentId,guardId,shiftId,description,photoUrl,latitude,longitude,null];
        const result = await db.query(queryText, queryParams);

        res.status(200).json(result.rows)
        });
    } catch (error) {
        // Clean up the uploaded file if an error occurred and a file was uploaded
        if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
            try {
                fs.unlinkSync(uploadedFilePath);
            } catch (unlinkError) {
                console.error('Error cleaning up uploaded file during error handling:', unlinkError);
            }
        }

        if (error.message === 'Invalid file type. Only JPEG, PNG, and GIF are allowed.') {
            return res.status(400).json({ success: false, message: error.message });
        }
        if (error instanceof multer.MulterError) {
            return res.status(400).json({ success: false, message: `File upload error: ${error.message}` });
        }
        if (error.statusCode) { // For custom errors with a statusCode property
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }

        console.error('ManageIncident Error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'An unexpected error occurred while managing the incident.',
        });
    }
};

const getIncident = async (req, res) => {
   try {
        const { guardId } = req.query;
        const query = 'SELECT * FROM fn_incident_get($1)';
      const values = [guardId];

      const result = await db.query(query, values);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    } finally {
        if (pool) {
            await pool.close();
        }
    }
}

module.exports = {
    manageIncident,
    getIncident,
};
