const express = require("express");
const router = express.Router();
const {
  getGuard,
  getGuardDashboardData,
  createGuard,
  manageShift,
  manageLocation,
  getGuardLiveTrackingData,
  addGuardLiveTrackingData,
} = require("../Controller/guardController");
const {
    createAlert,
    getAlert,
    resolveAlert
} = require("../Controller/alertController");
const {
    manageCheckpoint,
    recordScan,
    getCheckpoint
} = require("../Controller/checkpointController");
const {
    manageIncident,
    getIncident
} = require("../Controller/incidentController");
const {
    generateOTP,
    verifyOTP
} = require("../Controller/loginController");
const {
    manageRoute
} = require("../Controller/routeController");
const{
    manageDevice
} = require("../Controller/deviceController");
// Login
router.post("/send-otp", generateOTP);
router.post("/verify-otp", verifyOTP);

// Guard
router.get("/guards", getGuard);
router.get("/guarddashboarddata", getGuardDashboardData);
router.post("/guards", createGuard);
router.post("/shifts", manageShift);
router.post("/locations", manageLocation);

// Route
router.post("/routes", manageRoute);

// Alert
router.post("/alerts", createAlert);
router.get("/alerts", getAlert);
router.post("/alerts/resolve", resolveAlert);

// Checkpoint
router.post("/checkpoints", manageCheckpoint);
router.post("/checkpoints/scan", recordScan);

// Incident
router.post("/incidents", manageIncident);
router.get("/incidents", getIncident);
  

// Live Tracking
router.post("/guard-live-tracking", addGuardLiveTrackingData);
router.get("/guard-live-tracking", getGuardLiveTrackingData);

router.post("/devices",manageDevice);

module.exports = router;
