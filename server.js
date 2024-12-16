const express = require("express");
const app = express();
const port = 3000;

const fn = require("./cron");

app.get("/", (req, res) => {
  fn();
  return res.json("Running .....");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
