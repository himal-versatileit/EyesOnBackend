const sql = require("mssql");
const fs = require("fs");
const sqlConfig = require("../DbConfig/dbconfig");

const manageCheckpoint = async (req, res) => {
        let pool;
    try {
      const { checkpointId = 0, routeId, name, latitude, longitude, sequenceOrder } = req.body;
      pool = await sql.connect(sqlConfig);
      const result = await pool
        .request()
        .input("CheckpointId", sql.Int, checkpointId)
        .input("RouteId", sql.Int, routeId)
        .input("Name", sql.NVarChar(100), name)
        .input("Latitude", sql.NVarChar(15), latitude)
        .input("Longitude", sql.NVarChar(100), longitude)
        .input("SequenceOrder", sql.NVarChar(256), sequenceOrder)
        .output("ResultId", sql.Int)
        .output("ReturnStatus", sql.NVarChar(50))
        .execute("sp_Checkpoint_CRUD");
        res.status(200).json({
          success: true,
          message: result.output.ReturnStatus,
          data: { checkpointId: result.output.ResultId }
        });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    } finally {
      pool?.close();
    }
}

const recordScan = async (req, res) => {
    let pool;
    try {
        const { guardId, checkpointId, shiftId, scanTime = null } = req.body;
        pool = await sql.connect(sqlConfig);
        const result = await pool
            .request()
            .input("GuardId", sql.Int, guardId)
            .input("CheckpointId", sql.Int, checkpointId)
            .input("ShiftId", sql.Int, shiftId)
            .input("ScanTime", sql.DateTime, scanTime)
            .output("IsLate", sql.Bit)
            .output("IsMissed", sql.Bit)
            .execute("sp_Checkpoint_RecordScan");
        res.status(200).json({
            success: true,
            message: 'Checkpoint scan recorded',
            data: {
                isLate: result.output.IsLate,
                isMissed: result.output.IsMissed
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    } finally {
        pool?.close();
    }
}

const getCheckpoint = async (req, res) => {
    let pool;
    try {
        const { routeId } = req.query;
        pool = await sql.connect(sqlConfig);
        const result = await pool
            .request()
            .input("RouteId", sql.Int, routeId)
            .execute("sp_Checkpoint_Get");
        const Result = result.recordsets[0] || [];
        res.status(200).json({
            success: true,
            data: Result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    } finally {
        pool?.close();
    }
}

module.exports = {
    manageCheckpoint,
    recordScan,
    getCheckpoint
}
