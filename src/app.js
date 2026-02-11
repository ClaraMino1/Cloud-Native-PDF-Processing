const express = require("express");
const compression = require("compression");
const config = require("./config/config");
const reportRoutes = require("./routes/reports");
const authenticate = require('./middlewares/auth');

const app = express();

// Middlewares
app.use(compression());
app.use(express.json());

app.use('/api/reports', authenticate, reportRoutes);

app.use((err, req, res, next) => {
  console.error(err); 
  res.status(500).json({ error: err.message || "Error interno" });
});

app.listen(config.port, "0.0.0.0", () => {
  console.log(`server running on port ${config.port}`);
});

module.exports = app;