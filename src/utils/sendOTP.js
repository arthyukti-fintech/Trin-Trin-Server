const axios = require('axios');
const dotenv = require("dotenv")
const path = require("path");

dotenv.config({
    path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`)
});

const sendMobileNumberOTP = async (mobileNumber) => {
    try {
        const response = await axios.post('https://api.msg91.com/api/v5/otp', {
            authkey: process.env.MSG91_AUTHKEY,
            template_id: process.env.MSG91_TEMPLATE_ID,
            mobile: mobileNumber, 
            sender: process.env.MSG91_SENDER_ID
        }, {
            headers: { 'Content-Type': 'application/json' }
        });

        console.log('OTP sent:', response.data);
    } catch (error) {
        console.error('Error:', error?.response?.data || error.message);
    }
};

module.exports = { sendMobileNumberOTP }