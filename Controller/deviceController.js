const db = require("../DbConfig/dbconfig");
const { Result } = require("pg");

const manageDevice = async (req, res) => {
        try {
            const {deviceId = 0, guardId,  deviceUUID, platform  } = req.body;
            const queryText = 'CALL sp_device_crud($1, $2, $3, $4, $5)';
            const queryParams = [deviceId , guardId,  deviceUUID, platform ,null];

            const result = await db.query(queryText, queryParams); 
            return res.status(200).json({
                success: true,
                message: result.rows[0]._returnstatus,
                data: { deviceId: result.rows }
            });
        } catch (error) {
            res.status(500).json({
              message: error.message,
            });
          }
    }

module.exports = {
    manageDevice
}
