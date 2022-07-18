const express = require("express");
const path = require("path");

const PORT = process.env.PORT || 3000;

const app = express();

app.use('/flags', express.static(__dirname + '/public/flags'));

app.use('/', express.static(__dirname + '/public'));

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});