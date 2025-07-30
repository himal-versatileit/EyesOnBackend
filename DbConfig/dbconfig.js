const { Pool } = require('pg');

// Create a new pool instance. A pool is recommended for managing connections.
const pool = new Pool({
  user: 'avnadmin',      // your PostgreSQL username
  host: 'pg-eyeson-eyeson.j.aivencloud.com',                    // or your PostgreSQL server IP/hostname
  database: 'EyesOn',       // your PostgreSQL database name
  password: 'AVNS_WAO8uF04fTv_oKsPksI',   // your PostgreSQL password
  port: 25089,                           // default PostgreSQL port
  ssl: { rejectUnauthorized: false }
});

// const pool = new Pool({
//   user: 'postgres',      // your PostgreSQL username
//   host: 'localhost',                    // or your PostgreSQL server IP/hostname
//   database: 'EyesOn',       // your PostgreSQL database name
//   password: 'kismis@2803H',   // your PostgreSQL password
//   port: 5432,                           // default PostgreSQL port
// });
// Export the query function
module.exports = {
  query: (text, params) => pool.query(text, params),
};