const sql = require("mssql");
const fs = require("fs");
const sqlConfig = require("../DbConfig/dbconfig");
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
        
        const {
            incidentId = 0,
            guardId,
            shiftId,
            description,
            latitude,
            longitude
        } = req.body;

        if (!guardId || !shiftId || !description) {
            // Throw an error to be caught by the main catch block, which will handle cleanup
            const validationError = new Error("Missing required fields: guardId, shiftId, and description are required.");
            validationError.statusCode = 400;
            throw validationError;
        }

        const photoUrl = `public/uploads/${this.filename}`;

        pool = await sql.connect(sqlConfig);
        const result = await pool.request()
            .input("IncidentId", sql.Int, incidentId)
            .input("GuardId", sql.Int, guardId)
            .input("ShiftId", sql.Int, shiftId)
            .input("Description", sql.NVarChar(500), description)
            .input("PhotoUrl", sql.NVarChar(255), photoUrl)
            .input("Latitude", sql.NVarChar(255), latitude)
            .input("Longitude", sql.NVarChar(255), longitude)
            .output("ResultId", sql.Int)
            .output("ReturnStatus", sql.NVarChar(50))
            .execute("sp_Incident_CRUD");

        res.status(200).json({
            success: true,
            message: result.output.ReturnStatus,
            data: {
                incidentId: result.output.ResultId,
                photoUrl: photoUrl,
            }
        });
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
    } finally {
        if (pool) {
            try {
                await pool.close();
            } catch (poolError) {
                console.error('Error closing SQL pool:', poolError);
            }
        }
    }
};

const getIncident = async (req, res) => {
    let pool;
    try {
        const { guardId } = req.query;
        pool = await sql.connect(sqlConfig);
        const result = await pool.request()
            .input("GuardId", sql.Int, guardId)
            .execute("sp_Incident_Get");
        const Result = result.recordsets || [];
        res.status(200).json(Result);
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
