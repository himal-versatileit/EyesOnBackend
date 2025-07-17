const sql = require("mssql");
const fs = require("fs");
const db = require("../DbConfig/dbconfig");

const manageCheckpoint = async (req, res) => {
      try {
      const { checkpointId = 0, routeId, name, latitude, longitude, sequenceOrder } = req.body;
      const queryText = 'CALL sp_checkpoint_crud($1, $2, $3, $4, $5, $6, $7)';
      const queryParams = [checkpointId, routeId, name, latitude, longitude, sequenceOrder,null];     
      const result = await db.query(queryText, queryParams);

        res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    } finally {
      pool?.close();
    }
}

const recordScan = async (req, res) => {
    try {
        const { guardId, checkpointId, shiftId } = req.body;
        const queryText = 'CALL sp_checkpoint_recordscan($1, $2, $3, $4, $5)';
        const queryParams = [guardId, checkpointId, shiftId,null,null];
        const result = await db.query(queryText, queryParams);
        console.log(result.rows);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

module.exports = {
    manageCheckpoint,
    recordScan
}
