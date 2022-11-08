const express = require("express");
const cors = require("cors");
const { Console } = require("console");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

app.get("/", (req, res) => {
  res.send("review server running");
});

app.listen(port, () => {
  console.log(`review server running on: ${port}`);
});
