const sql = require("mssql");

const config = {
  user: "sa", // your SQL server username
  password: "kismis@2803H",
  server: "localhost", // localhost or your SQL server IP
  database: "EyesOn",
  options: {
    encrypt: false, // set to true if using Azure
    trustServerCertificate: true,
  },
};
// const config = {
//   user: "rs_development", // your SQL server username
//   password: "P8L5fE123456_",
//   server: "192.168.27.3", // localhost or your SQL server IP
//   database: "EyesOn",
//   options: {
//     encrypt: false, // set to true if using Azure
//     trustServerCertificate: true,
//   },
// };

module.exports = config;