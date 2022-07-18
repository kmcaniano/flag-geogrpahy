const express = require("express");
const path = require("path");

const PORT = process.env.PORT || 3000;

const app = express();

app.use('/flags',express.static(path.join(__dirname, 'public/flags')));
app.use('/topoJson',express.static(path.join(__dirname, 'public/topoJson')));

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});