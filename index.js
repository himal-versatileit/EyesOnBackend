const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const serveIndex = require("serve-index");
const masterRoutes = require("./Apis/master");

const app = express();

// Enable CORS
app.use(cors({
  origin: '*'
}));

// Enable JSON parsing
//app.use(bodyParser.json());
app.use(bodyParser.json({ limit: "50mb" }));
// API routes
app.use("/api", masterRoutes);

// Static files + directory listing
app.use(
  "/public/uploads",
  express.static("public/uploads"),
  serveIndex("public/uploads", { icons: true })
);

// Simple test route
app.get("/", (req, res) => {
  res.send("Hello World");
});

// ✅ Start the server
const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
