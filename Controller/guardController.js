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
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const dateStr = `${day}_${month}_${year}`;

    const randomStr = Math.random().toString(36).substr(2, 7);
    const ext = path.extname(file.originalname);

    // Decide suffix based on field name
    let suffix = '';
    if (file.fieldname === 'guardPhoto') {
      suffix = '_Guard';
    } else if (file.fieldname === 'idProof') {
      suffix = '_GuardID';
    }

    const generatedName = `${dateStr}_${randomStr}${suffix}${ext}`;

    // Save generated name in request for later use
    if (!req.fileNames) req.fileNames = {};
    req.fileNames[file.fieldname] = generatedName;

    cb(null, generatedName);
  }
});
  
  const upload = multer({ storage }).fields([
    { name: 'guardPhoto', maxCount: 1 },
    { name: 'idProof', maxCount: 1 }
  ]);

const getGuard = async (req, res) => {
  try {
      const { guardId } = req.query;
      const guardIdParam = guardId ? parseInt(guardId) : null;

      const query = 'SELECT * FROM fn_Guard_Get($1)';
      const values = [guardIdParam];

      const result = await db.query(query, values);

      // The result rows will be in result.rows
      res.status(200).json(result.rows);

  } catch (error) {
      // The RAISE EXCEPTION message from PostgreSQL will be in error.message
      res.status(500).json({
          message: error.message,
      });
  }
};

const createGuard = async (req, res) => {
  try {
    upload(req, res, async (err) => {
        if (err) {
          return res.status(500).json({ message: "Error uploading file." });
        }
        const { 
          guardId, 
          fullName, 
          phoneNumber, 
          email, 
          address, 
          city, 
          state, 
          pincode, 
          pAddress, 
          pCity, 
          pState, 
          pPincode, 
          isActive,
          idProofId,       // for sp_Addguard_id_proof
          idno,
          documentNo
        } = req.body;

        const photoUrl = req.fileNames?.guardPhoto ? `public/uploads/${req.fileNames.guardPhoto}` : null;
        const idProofUrl = req.fileNames?.idProof ? `public/uploads/${req.fileNames.idProof}` : null;
  
        const numericGuardId = parseInt(guardId || 0, 10);
        const numericIdProofId = parseInt(idProofId || 0, 10);
        const numericIdno = parseInt(idno || 0, 10);
  
        // First call: create or update guard
        const guardQuery = `CALL sp_guard_crud($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`;
        const guardParams = [
          numericGuardId, fullName, phoneNumber, email, address,
          city, state, pincode, pAddress, pCity, pState, pPincode,
          isActive, photoUrl, null
        ];
  
        const guardResult = await db.query(guardQuery, guardParams);
        const createdGuardId = guardResult.rows[0]._guardid;
        const guardStatus = guardResult.rows[0]._status;
  
        // Second call: insert/update guard ID proof (if file exists)
        let idProofResult = null;
        if (documentNo && idProofUrl) {
          const idProofQuery = `CALL sp_Addguard_id_proof($1, $2, $3, $4, $5, $6, $7)`;
          const idProofParams = [
            numericIdProofId, numericIdno, createdGuardId, documentNo, idProofUrl, null, null
          ];
          idProofResult = await db.query(idProofQuery, idProofParams);
        }
  
        res.status(200).json({
          success: true,
          message: guardStatus,
          data: {
            guardId: createdGuardId,
            idProofStatus: idProofResult ? idProofResult.rows[0].out_status : null
          }
        });
      });
    } catch (error) {
      console.error("API Error:", error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

const manageShift = async (req, res) => {
  try {
  const { guardId, shiftId, shiftName, routeId, startTime, endTime, status, notes } = req.body;

  const queryText = 'CALL sp_GuardShift_Manage($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)';
  const queryParams = [
      shiftId,
      guardId,
      shiftName,
      routeId,
      startTime,
      endTime,
      status,
      notes,
      null, // Placeholder for _NewShiftId (INOUT)
      null  // Placeholder for _ReturnMessage (OUT)
  ];

     
      const result = await db.query(queryText, queryParams);

     const output = result.rows[0];
      const returnMessage = output._returnmessage; // a_returnmessage from procedure
      const newShiftId = output._newshiftid;       // _NewShiftId from procedure

      res.status(200).json({
          success: true,
          message: returnMessage,
          data: { shiftId: newShiftId }
      });

  } catch (error) {
      console.error('Error executing stored procedure:', error);
      res.status(500).json({
          success: false,
          message: error.message,
      });
  } finally {
      // IMPORTANT: Release the client back to the pool
      client?.release();
  }
};

const manageLocation = async (req, res) => {
  try {
      const { locationId, name, latitude, longitude, radiusMeters } = req.body;
      const queryText = 'CALL sp_location_curd($1, $2, $3, $4, $5, $6)';

      const queryParams = [
          locationId,   
          name,         
          latitude,     
          longitude,    
          radiusMeters, 
          null          
      ];
  const result = await db.query(queryText, queryParams);

      const output = result.rows[0];
      const finalLocationId = output._locationid; 
      const statusMessage = output._status;

      res.status(200).json({
          success: true,
          message: statusMessage,
          data: { locationId: finalLocationId }
      });

  } catch (error) {
      console.error('Error executing sp_location_curd:', error);
      res.status(500).json({
          success: false,
          message: error.message,
      });

  } finally {
      if (client) {
          client.release();
      }
  }
};

const getGuardDashboardData = async (req, res) => {
  let pool;
  try {
    const { guardId ,DataFor } = req.query;
    const query = 'SELECT * FROM fn_getguarddashboarddata($1,$2)';
    const values = [guardId ,DataFor];
    const result = await db.query(query, values);
    res.status(200).json(result.rows[0].fn_getguarddashboarddata);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  } finally {
    pool?.close();
  }
}

const getGuardLiveTrackingData = async (req, res) => {
  try {
    const { guardId ,startdate, enddate} = req.query;
    const query = 'SELECT * FROM fn_getguardlivetrackingdata($1,$2,$3)';
    const values = [guardId , startdate, enddate];
    const result = await db.query(query, values);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

const getGuardLiveTrackingDataById = async (req, res) => {
  try {
    const { locationId   } = req.query;
    const query = 'SELECT * FROM fn_get_guard_coordinates_by_guard_id($1)';
    const values = [locationId];
    const result = await db.query(query, values);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

const getDocument = async (req, res) => {
  try {
    const { guardId } = req.query;

    // Optional: Add filter if guardId is provided
    let query = 'SELECT * FROM public."tbl_IdProof"';
    const values = [];

    const result = await db.query(query, values);

    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


const addGuardLiveTrackingData = async (req, res) => {
  try {
      const { guardId, startTime, endTime, coordinates } = req.body;

      const coordinatesJson = JSON.stringify(coordinates);

      const queryText = 'CALL sp_addguardlivetrackingdata($1, $2, $3, $4)';

      const queryParams = [
          guardId,
          startTime,
          endTime,
          coordinatesJson
      ];

      await db.query(queryText, queryParams);

      // Send a success response.
      res.status(200).json({
          success: true,
          message: 'Tracking data saved successfully',
      });

  } catch (error) {
      // Log the error and send a 500 server error response.
      console.error('Error saving tracking data:', error);
      res.status(500).json({
          success: false,
          message: 'Failed to save tracking data',
          error: error.message
      });

  } finally {
      // IMPORTANT: Always release the client back to the pool to prevent
      // connection leaks, regardless of whether the query succeeded or failed.
      if (client) {
          client.release();
      }
  }
};


  module.exports = {
    getGuard,
    createGuard,   
    manageShift,
    manageLocation,
    getGuardDashboardData,
    getGuardLiveTrackingData,
    getGuardLiveTrackingDataById,
    getDocument,
    addGuardLiveTrackingData,
  };
  