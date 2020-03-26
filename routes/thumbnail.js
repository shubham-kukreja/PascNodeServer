const express = require("express");
const multer = require("multer");
const path = require("path");
const imageThumbnail = require("image-thumbnail");
const { File } = require("../models/file");
const saveBuffer = require("save-buffer");
const googleStorage = require('@google-cloud/storage');
var router = express.Router();

const storage3 = googleStorage({
  projectId: "pascblogs-54ff3",
  keyFilename: "<path to service accounts prviate key JSON>"
});

const bucket = storage.bucket("pascblogs-54ff3.appspot.com");


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
            const saveThumbnail = await saveBuffer(
              thumbnail,
              `public/gallery/thumbnail/${thumbnailFilename}.jpeg`
            );
            var tempCat = parseInt(category);
            const file = new File({
              path: `gallery/uploads/${req.file.filename}`,
              thumb: `gallery/thumbnail/${thumbnailFilename}.jpeg`,
              category: tempCat
            });
            const temp = await file.save();
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
        } catch (err) {
          console.error(err, "shubham");
        }
      }
    }
    res.send(master);
  });
});


const uploadImageToStorage = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject('No image file');
    }
    let newFileName = `${file.originalname}_${Date.now()}`;

    let fileUpload = bucket.file(newFileName);

    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype
      }
    });

    blobStream.on('error', (error) => {
      reject('Something is wrong! Unable to upload at the moment.');
    });

    blobStream.on('finish', () => {
      // The public URL can be used to directly access the file via HTTP.
      const url = format(`https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`);
      resolve(url);
    });

    blobStream.end(file.buffer);
  });
}

module.exports = router;
