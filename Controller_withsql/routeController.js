const sql = require("mssql");
const fs = require("fs");
const sqlConfig = require("../DbConfig/dbconfig");

const manageRoute = async (req, res) => {
    let pool;
    try {
      const { routeId, name, locationId } = req.body;
      pool = await sql.connect(sqlConfig);
      const result = await pool
        .request()
        .input("RouteId", sql.Int, routeId)
        .input("Name", sql.NVarChar(100), name)
        .input("LocationId", sql.Int, locationId)
        .output("ResultId", sql.Int)
        .output("Status", sql.NVarChar(50))
        .execute("sp_Route_CRUD");
        res.status(200).json({
          success: true,
          message: result.output.Status,
          data: { routeId: result.output.ResultId }
        });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    } finally {
      pool?.close();
    }
}

module.exports = {
    manageRoute
}