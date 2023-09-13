import path frm "path";
import express frm "express";
const app = express(); // create express app

// add middlewares
app.use(express.static(path.join(__dirname, "..", "build")));
app.use(express.static("public"));

app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
});

// start express server on port 80
app.listen(80, () => {
  console.log("server started on port 80");
});