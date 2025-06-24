import BaseController from './baseController.js';
import { sql } from '../config/db.js';

class DeviceController extends BaseController {
    // Register or update a device
    static async manageDevice(req, res) {
        try {
            const { 
                deviceId = 0, 
                guardId, 
                deviceUUID, 
                platform 
            } = req.body;

            const result = await this.executeProcedure('sp_Device_CRUD', {
                inputs: {
                    DeviceId: { type: sql.Int, value: deviceId },
                    GuardId: { type: sql.Int, value: guardId },
                    DeviceUUID: { type: sql.NVarChar(100), value: deviceUUID },
                    Platform: { type: sql.NVarChar(20), value: platform }
                },
                outputs: { ResultId: sql.Int , ReturnStatus: sql.NVarChar(50) }
            });

            if (result.returnValue === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Device not found for update'
                });
            }

            if (result.returnValue === -2) {
                return res.status(404).json({
                    success: false,
                    message: 'Guard not found'
                });
            }

            if (result.returnValue === -3) {
                return res.status(400).json({
                    success: false,
                    message: 'Device already registered to another guard'
                });
            }
 
            return res.status(200).json({
                success: true,
                message: result.output.ReturnStatus,
                data: { deviceId: result.output.ResultId }
            });
        } catch (error) {
            return this.handleError(res, error, 'Error managing device');
        }
    }
}

export default DeviceController;
