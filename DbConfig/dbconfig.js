const { Pool } = require('pg');

// Create a new pool instance. A pool is recommended for managing connections.
const pool = new Pool({
  user: 'himalpatel',      // your PostgreSQL username
  host: 'dpg-d1sd73je5dus739iq72g-a.oregon-postgres.render.com',                    // or your PostgreSQL server IP/hostname
  database: 'eyeson_9agz',       // your PostgreSQL database name
  password: 'UAbeUtPg2mE5TtNAMsSchlN20ZOCkL6j',   // your PostgreSQL password
  port: 5432,                           // default PostgreSQL port
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