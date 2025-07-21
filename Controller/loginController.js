const sql = require("mssql");
const fs = require("fs");
const db = require("../DbConfig/dbconfig");

const generateOTP = async (req, res) => {
    try {
        const { MobileNumber } = req.body;

        if (!MobileNumber) {
            return res.status(400).json({ 
                success: false,
                message: 'Mobile number is required' 
            });
        }

        const query = 'SELECT * FROM fn_generateotp($1)';
        const values = [MobileNumber];
        const result = await db.query(query, values);        
        
       
        //const results =  res.status(200).json(result.rows);
        return res.status(200).json({
        success: true,
        message: 'OTP generated successfully',
        otp: result.rows[0]
    })
    } catch (error) {
        console.error('GenerateOTP Error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Error generating OTP'
        });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { MobileNumber, OTP } = req.body;

        if (!MobileNumber || !OTP) {
            return res.status(400).json({
                success: false,
                message: 'Mobile number and OTP are required'
            });
        }

        const query = 'SELECT * FROM fn_validateotp($1, $2)';
        const values = [MobileNumber,OTP];
        const result = await db.query(query, values);  
        const otpRecord = result.rows[0];

        if (!otpRecord) {
            return res.status(404).json({
                success: false,
                message: 'Invalid OTP. Please request OTP again.'
            });
        }

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
    }
}
    
module.exports = {
    generateOTP,
    verifyOTP,
}