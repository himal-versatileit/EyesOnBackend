const fs = require("fs");
const db = require("../DbConfig/dbconfig");

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
      const { guardId, fullName, phoneNumber, email, password, isActive } = req.body;

      // Ensure guardId is treated as a number
      const numericGuardId = parseInt(guardId, 10);

      const sqlQuery = 'CALL sp_guard_crud($1::integer, $2::varchar, $3::varchar, $4::varchar, $5::varchar, $6::boolean, $7::varchar)';
      
      const params = [numericGuardId, fullName, phoneNumber, email, password, isActive, null];

      // Execute the procedure
      const { rows } = await db.query(sqlQuery, params);

      // The result handling remains the same
      const resultId = rows[0]._guardid;
      const returnStatus = rows[0]._status;

      res.status(200).json({
          success: true,
          message: returnStatus,
          data: { guardId: resultId }
      });

  } catch (error) {
      // Any "RAISE EXCEPTION" from your procedure will be caught here.
      console.error('API Error:', error);
      res.status(500).json({
          success: false,
          message: error.message,
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
    addGuardLiveTrackingData,
  };
  