const sql = require("mssql");
const fs = require("fs");
const sqlConfig = require("../DbConfig/dbconfig");

const getGuard = async (req, res, next) => {
    let pool;
    try {
      const { guardId } = req.query;
      pool = await sql.connect(sqlConfig);
      const result = await pool
        .request()
        .input("GuardId", sql.Int, guardId)
        .execute("sp_Guard_Get");
        const Result = result.recordsets || [];
        res.status(200).json(Result);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    } finally {
      pool?.close();
    }
  };

  const createGuard = async (req, res, next) => {
    let pool;
    try {
      const { guardId, fullName, phoneNumber, email, password, isActive } = req.body;
      pool = await sql.connect(sqlConfig);
      const result = await pool
        .request()
        .input("GuardId", sql.Int, guardId)
        .input("FullName", sql.NVarChar(100), fullName)
        .input("PhoneNumber", sql.NVarChar(15), phoneNumber)
        .input("Email", sql.NVarChar(100), email)
        .input("Password", sql.NVarChar(256), password)
        .input("IsActive", sql.Bit, isActive)
        .output("ResultId", sql.Int)
        .output("Status", sql.NVarChar(50))
        .execute("sp_Guard_CRUD");
        res.status(200).json({
          success: true,
          message: result.output.Status,
          data: { guardId: result.output.ResultId }
        });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    } finally {
      pool?.close();
    }
  };

  const manageShift = async (req, res) => {
    let pool;
    try {
      const { guardId, shiftId, routeId, startTime, endTime, status, notes } = req.body;
      pool = await sql.connect(sqlConfig);
      const result = await pool
        .request()
        .input("ShiftId", sql.Int, shiftId)
        .input("GuardId", sql.Int, guardId)
        .input("RouteId", sql.Int, routeId)
        .input("StartTime", sql.NVarChar, startTime)
        .input("EndTime", sql.NVarChar, endTime)
        .input("Status", sql.NVarChar(20), status)
        .input("Notes", sql.NVarChar(255), notes)
        .output("NewShiftId", sql.Int)
        .output("ReturnMessage", sql.NVarChar(255))
        .execute("sp_GuardShift_Manage");
        res.status(200).json({
          success: true,
          message: result.output.ReturnMessage,
          data: { shiftId: result.output.NewShiftId }
        });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    } finally {
      pool?.close();
    }
  };

const manageLocation = async (req, res) => {
    let pool;
    try {
      const { locationId, name, latitude, longitude, radiusMeters } = req.body;
      pool = await sql.connect(sqlConfig);
      const result = await pool
        .request()
        .input("LocationId", sql.Int, locationId)
        .input("Name", sql.NVarChar(100), name)
        .input("Latitude", sql.Float, latitude)
        .input("Longitude", sql.Float, longitude)
        .input("RadiusMeters", sql.Int, radiusMeters)
        .output("ResultId", sql.Int)
        .output("Status", sql.NVarChar(50))
        .execute("sp_Location_CURD");
      const Result = result.recordsets[0] || [];
      res.status(200).json({
        success: true,
        message: result.output.Status,
        data: { locationId: result.output.ResultId }
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    } finally {
      pool?.close();
    }
  };


const getGuardDashboardData = async (req, res) => {
  let pool;
  try {
    const { guardId ,DataFor } = req.query;
    pool = await sql.connect(sqlConfig);
    const result = await pool
      .request()
      .input("GuardId", sql.Int, guardId)
      .input("DataFor", sql.Int, DataFor)
      .execute("sp_GetGuardDashboardData");
      const Result = result.recordsets || [];
      res.status(200).json(Result);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  } finally {
    pool?.close();
  }
}

const getGuardLiveTrackingData = async (req, res) => {
  let pool;
  try {
    const { guardId } = req.query;
    pool = await sql.connect(sqlConfig);
    const result = await pool
      .request()
      .input("GuardId", sql.Int, guardId)
      .execute("sp_GetGuardLiveTrackingData");
      const Result = result.recordsets || [];
      res.status(200).json(Result);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  } finally {
    pool?.close();
  }
}

const addGuardLiveTrackingData = async (req, res) => {
  let pool;
  try {
    const { guardId, startTime, endTime, coordinates } = req.body;
    
    // Convert coordinates array to JSON string
    const coordinatesJson = JSON.stringify(coordinates);
    
    pool = await sql.connect(sqlConfig);
    const result = await pool
      .request()
      .input("GuardId", sql.Int, guardId)   
      .input("StartTime", sql.NVarChar, startTime) 
      .input("EndTime", sql.NVarChar, endTime) 
      .input("Coordinates", sql.NVarChar, coordinatesJson)
      .execute("sp_AddGuardLiveTrackingData");
      
    res.status(200).json({
      success: true,
      message: 'Tracking data saved successfully',
      data: result.recordset
    });
  } catch (error) {
    console.error('Error saving tracking data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save tracking data',
      error: error.message
    });
  } finally {
    if (pool) {
      await pool.close();
    }
  } 
}

  module.exports = {
    getGuard,
    createGuard,   
    manageShift,
    manageLocation,
    getGuardDashboardData,
    getGuardLiveTrackingData,
    addGuardLiveTrackingData,
  };
  