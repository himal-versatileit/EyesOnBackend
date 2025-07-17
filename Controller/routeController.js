const db = require("../DbConfig/dbconfig");
const { Result } = require("pg");

const manageRoute = async (req, res) => {
    try {
      const { routeId, name, locationId } = req.body;
      const queryText = 'CALL sp_route_crud($1, $2, $3, $4)';
            const queryParams = [routeId, name, locationId ,null];

            const result = await db.query(queryText, queryParams); 
        res.status(200).json({
          success: true,
          message: result.rows[0]._status,
          data: { routeId: result.rows[0]._routeid }
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