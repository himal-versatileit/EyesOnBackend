const db = require("../DbConfig/dbconfig");


const createAlert = async (req, res) => {
    try {
      const { alertId =0,type,message,guardId,shiftId,location,latitude,longitude,severity = 'Medium' } = req.body;
      const queryText = 'CALL sp_alert_crud($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)';
      const queryParams = [alertId,type,message,guardId,shiftId,location,latitude,longitude,severity,null,null,null,null];
      const result = await db.query(queryText, queryParams);
        res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
}

const getAlert = async (req, res) => {
   try {
        const { guardId, isAll = 0 } = req.query;
        const query = 'SELECT * FROM fn_alert_getactive($1,$2)';
        const values = [guardId,isAll];
  
        const result = await db.query(query, values);
        res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
}
    
const resolveAlert = async (req, res) => {
    try {
        const { alertId,resolvedBy, resolutionNotes } = req.body;
        const alertstatus='Resolved';
        const queryText = 'CALL sp_alert_crud($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)';
        const queryParams = [alertId,null,null,null,null,null,null,null,null,alertstatus,resolvedBy,resolutionNotes,null];
        const result = await db.query(queryText, queryParams);
        return res.status(200).json(result.rows);
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    } 
}

module.exports = {
    createAlert,
    getAlert,
    resolveAlert
}
    