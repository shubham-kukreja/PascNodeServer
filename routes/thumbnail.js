const express = require("express");
const multer = require("multer");
const path = require("path");
const imageThumbnail = require("image-thumbnail");
const { File } = require("../models/file");
const saveBuffer = require("save-buffer");

var router = express.Router();

const storage = multer.diskStorage({
  destination: "./public/gallery/uploads/",
  filename: async (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
});
const storageblogs = multer.diskStorage({
  destination: "./public/blogs/uploads/",
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
}).array("photo", 10);

const uploadSingle = multer({
  storage: storageblogs,
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

router.get("/viewgallery", async (req, res) => {
  const photos = await File.find({});
  res.send(photos);
});

router.post("/gallery/upload", async (req, res) => {
  upload(req, res, async err => {
    let category = req.body.category;
    let thumbarray = [];
    let path = [];
    let master;
    for (var i = 0; i < req.files.length; i++) {
      req.file = req.files[i];
      if (err) {
        res.render("index", {
          msg: err
        });
      } else {
        if (req.files == undefined) {
          res.render("index", {
            msg: "Error: No File Selected"
          });
        } else {
          // res.render("index", {
          //   msg: "File uploaded",
          //   file: `uploads/${req.file.filename}`
          // });
          try {
            let options = {
              width: 400,
              height: 400,
              responseType: "base64",
              jpegOptions: { force: true, quality: 100 }
            };

            const thumbnail = await imageThumbnail(
              `public/gallery/uploads/${req.file.filename}`
            );
            thumbnailFilename = "thumbnail_" + req.file.filename.split(".")[0];
            thumbarray.push(`gallery/thumbnail/${thumbnailFilename}.jpeg`);
            path.push(`gallery/uploads/${req.file.filename}`);
            master = { thumb: thumbarray, path: path };
            console.log(thumbnailFilename);
            console.log(thumbnail);
            const saveThumbnail = await saveBuffer(
              thumbnail,
              `public/gallery/thumbnail/${thumbnailFilename}.jpeg`
            );
            var tempCat = parseInt(category);
            console.log(tempCat, typeof tempCat);
            const file = new File({
              path: `gallery/uploads/${req.file.filename}`,
              thumb: `gallery/thumbnail/${thumbnailFilename}.jpeg`,
              category: tempCat
            });
            const temp = await file.save();
            console.log(temp);
          } catch (err) {
            console.error(err, "shubham");
          }
        }
      }
    }
    res.send(master);
  });
});

router.post("/upload", async (req, res) => {
  uploadSingle(req, res, async err => {
    let thumbarray;
    let path;
    let master;
    // req.file = req.files[i];
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
        // res.render("index", {
        //   msg: "File uploaded",
        //   file: `uploads/${req.file.filename}`
        // });
        try {
          let options = {
            width: 400,
            height: 400,
            responseType: "base64",
            jpegOptions: { force: true, quality: 100 }
          };

          const thumbnail = await imageThumbnail(
            `public/blogs/uploads/${req.file.filename}`
          );
          thumbnailFilename = "thumbnail_" + req.file.filename.split(".")[0];
          thumbarray = `blogs/thumbnail/${thumbnailFilename}.jpeg`;
          path = `blogs/uploads/${req.file.filename}`;
          master = { thumb: thumbarray, path: path };
          console.log(thumbnailFilename);
          console.log(thumbnail);
          const saveThumbnail = await saveBuffer(
            thumbnail,
            `public/blogs/thumbnail/${thumbnailFilename}.jpeg`
          );
          // const file = new File({
          //   path: `public/blogs/uploads/${req.file.filename}`,
          //   thumb: `public/blogs/thumbnail/${thumbnailFilename}.jpeg`
          // });
          // const temp = await file.save();
          // console.log(temp);
        } catch (err) {
          console.error(err, "shubham");
        }
      }
    }
    res.send(master);
  });
});
module.exports = router;
