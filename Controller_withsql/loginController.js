const sql = require("mssql");
const fs = require("fs");
const sqlConfig = require("../DbConfig/dbconfig");

const generateOTP = async (req, res) => {
    let pool;
    try {
        const { MobileNumber } = req.body;

        if (!MobileNumber) {
            return res.status(400).json({ 
                success: false,
                message: 'Mobile number is required' 
            });
        }

        pool = await sql.connect(sqlConfig);
        
        const otpResult = await pool
            .request()
            .input("MobileNumber", sql.NVarChar(15), MobileNumber)
            .execute("sp_GenerateOTP");

        const generatedOTP = otpResult.recordset[0];

        return res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            otp: generatedOTP
        });
    } catch (error) {
        console.error('GenerateOTP Error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Error generating OTP'
        });
    } finally {
        pool?.close();
    }
};

const verifyOTP = async (req, res) => {
    let pool;
    try {
        const { MobileNumber, OTP } = req.body;

        if (!MobileNumber || !OTP) {
            return res.status(400).json({
                success: false,
                message: 'Mobile number and OTP are required'
            });
        }

        pool = await sql.connect(sqlConfig);

        // Validate OTP
        const otpResult = await pool
            .request()
            .input("MobileNumber", sql.NVarChar(15), MobileNumber)
            .input("OTP", sql.NVarChar(10), OTP)
            .execute("sp_ValidateOTP");

        const otpRecord = otpResult.recordset[0];

        if (!otpRecord) {
            return res.status(404).json({
                success: false,
                message: 'Invalid OTP. Please request OTP again.'
            });
        }

        // // Mark OTP as used
        // await pool
        //     .request()
        //     .input("OtpId", sql.Int, otpRecord.OtpId)
        //     .execute("sp_MarkOtpAsUsed");

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            guardid: otpRecord.GuardId,
            shiftid: otpRecord.ShiftId
        });
    } catch (error) {
        console.error('Login Error:', error);
        return res.status(400).json({
            success: false,
            message: error.message || 'OTP validation failed'
        });
    } finally {
        pool?.close();
    }
}
    
module.exports = {
    generateOTP,
    verifyOTP,
}