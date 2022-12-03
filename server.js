const express = require("express");
const cors = require("cors");
const { readdirSync } = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

app.use(express.json());

var allowlist = ["http://localhost:3000", "http://example2.com"];
var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (allowlist.indexOf(req.header("Origin")) !== -1) {
    corsOptions = { origin: true, optionsSuccessStatus: 200 }; // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false }; // disable CORS for this request
  }
  callback(null, corsOptions); // callback expects two parameters: error and options
};
app.use(cors(corsOptionsDelegate));
readdirSync("./routes").map((r) => app.use("/", require("./routes/" + r)));

app.get("/", (req, res) => {
  res.send("server.js");
});

mongoose
  .connect(process.env.DATABASE_URL, { useNewUrlParser: true })
  .then(() => console.log("database connected"))
  .catch(() => console.log("database connection failed"));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`server is listening on port ${PORT}...`);
});
