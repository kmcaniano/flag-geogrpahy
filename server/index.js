const express = require("express");
const path = require("path");

const PORT = process.env.PORT || 3000;

const app = express();

const publicPath = path.join(__dirname, '../public');

app.use(express.static(path.join(__dirname, '..', publicPath)));
app.use('/flags', express.static(path.join(__dirname, '..', publicPath, 'flags')));

app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});