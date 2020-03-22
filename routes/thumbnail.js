const express = require("express");
const multer = require("multer");
const path = require("path");
const imageThumbnail = require("image-thumbnail");
const saveBuffer = require("save-buffer");

var router = express.Router();

const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: async (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).single("photo");

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images only");
  }
}

router.get("/", (req, res) => res.render("index"));

router.post("/upload", async (req, res) => {
  upload(req, res, async err => {
    if (err) {
      res.render("index", {
        msg: err
      });
    } else {
      if (req.file == undefined) {
        res.render("index", {
          msg: "Error: No File Selected"
        });
      } else {
        res.render("index", {
          msg: "File uploaded",
          file: `uploads/${req.file.filename}`
        });
        try {
          let options = {
            width: 200,
            height: 200,
            responseType: "base64",
            jpegOptions: { force: true, quality: 100 }
          };

          const thumbnail = await imageThumbnail(
            `public/uploads/${req.file.filename}`
          );
          thumbnailFilename = "thumbnail_" + req.file.filename.split(".")[0];
          console.log(thumbnailFilename);
          console.log(thumbnail);
          const saveThumbnail = await saveBuffer(
            thumbnail,
            `public/thumbnail/${thumbnailFilename}.jpeg`
          );
        } catch (err) {
          console.error(err, "shubham");
        }
      }
    }
  });
});

module.exports = router;
