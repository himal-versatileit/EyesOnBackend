const sql = require("mssql");
const fs = require("fs");
const sqlConfig = require("../DbConfig/dbconfig");


const createAlert = async (req, res) => {
    let pool;
    try {
      const { alertId =0,
            type,
            message,
            guardId,
            shiftId,
            location,
            latitude,
            longitude,
            severity = 'Medium' } = req.body;
      pool = await sql.connect(sqlConfig);
      const result = await pool
        .request()
        .input("AlertId", sql.Int, alertId)
        .input("Type", sql.NVarChar(50), type)
        .input("Message", sql.NVarChar(500), message)
        .input("GuardId", sql.Int, guardId)
        .input("ShiftId", sql.Int, shiftId)
        .input("Location", sql.NVarChar(200), location)
        .input("Latitude", sql.Float, latitude)
        .input("Longitude", sql.Float, longitude)
        .input("Severity", sql.NVarChar(20), severity)
        .input("Status", sql.NVarChar(50), 'Active')
        .output("ResultId", sql.Int)
        .output("ReturnStatus", sql.NVarChar(50))
        .execute("sp_Alert_CRUD");
        res.status(200).json({
          success: true,
          message: result.output.ReturnStatus,
          data: { alertId: result.output.ResultId }
        });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    } finally {
      pool?.close();
    }
}

const getAlert = async (req, res) => {
    let pool;
    try {
        const { guardId, isAll = 0 } = req.query;
      pool = await sql.connect(sqlConfig);
      const result = await pool
        .request()
        .input("GuardId", sql.Int, guardId)
        .input("IsAll", sql.Bit, isAll)
        .execute("sp_Alert_GetActive");
        const Result = result.recordsets[0] || [];
        res.status(200).json(Result);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    } finally {
      pool?.close();
    }
}
    
const resolveAlert = async (req, res) => {
    let pool;
    try {
        const { alertId,resolvedBy, resolutionNotes } = req.body;
        pool = await sql.connect(sqlConfig);
        const result = await pool.request()
        .input("AlertId", sql.Int, alertId)
        .input("Status", sql.NVarChar(50), 'Resolved')
        .input("ResolvedBy", sql.Int, resolvedBy)
        .input("ResolutionNotes", sql.NVarChar(500), resolutionNotes)
        .output("ResultId", sql.Int)
        .output("ReturnStatus", sql.NVarChar(50))
        .execute('sp_Alert_CRUD');  
        
        if (result.returnValue === -1) {
            return res.status(404).json({
                success: false,
                message: 'Alert not found'
            });
        }

        if (result.returnValue === -2) {
            return res.status(400).json({
                success: false,
                message: 'Alert already resolved'
            });
        }

        return res.status(200).json({
            success: true,
            message: result.output.ReturnStatus,
            data: {
                alertId: result.output.ResultId
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    } finally {
        pool?.close();
    }
}

module.exports = {
    createAlert,
    getAlert,
    resolveAlert
}
    