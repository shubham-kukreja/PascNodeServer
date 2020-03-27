const express = require("express");
const multer = require("multer");
const path = require("path");
const imageThumbnail = require("image-thumbnail");
const { File } = require("../models/file");
const saveBuffer = require("save-buffer");
const { googleStorage } = require("@google-cloud/storage");
var router = express.Router();
const crypto = require("crypto");
var admin = require("firebase-admin");
var serviceAccount = require("../bin/pascblogs-54ff3-firebase-adminsdk-yvopm-1aec2070de.json");
const GridFsStorage = require("multer-gridfs-storage");
const mongoose = require("mongoose");
// using a database instance
// const database = await MongoClient.connect(process.env.MONGODB_URL);
const mongoURI = process.env.MONGODB_URL;

// connection
const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true
});
let gfs;
conn.once("open", () => {
  // init stream
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "uploads"
  });
});
let globalFilename;
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads"
        };
        globalFilename = filename;
        console.log(filename, 'from storage')
        resolve(fileInfo);
        return filename;
      });
    });
  }
});

const upload = multer({
  storage
}).single("photo");

router.get("/image/:filename", (req, res) => {
  // console.log('id', req.params.id)
  const file = gfs
    .find({
      filename: req.params.filename
    })
    .toArray((err, files) => {
      if (!files || files.length === 0) {
        return res.status(404).json({
          err: "no files exist"
        });
      }
      gfs.openDownloadStreamByName(req.params.filename).pipe(res);
    });
});
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   storageBucket: "pascblogs-54ff3.appspot.com"
// });

// var bucket = admin.storage().bucket();
// bucket.upload("Screenshot.png");

// const storagemulter = multer.diskStorage({
//   destination: "./public/gallery/uploads/",
//   filename: async (req, file, cb) => {
//     cb(
//       null,
//       file.fieldname + "-" + Date.now() + path.extname(file.originalname)
//     );
//   }
// });
const storageblogs = multer.diskStorage({
  destination: "./public/blogs/uploads/",
  filename: async (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
});
// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 10000000 },
//   fileFilter: (req, file, cb) => {
//     checkFileType(file, cb);
//   }
// }).array("photo", 10);

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

// router.post("/upload", upload.single("photo"), (req, res) => {
//   res.json({
//     upload: true
//   });
// });

router.post('/upload/firebase', async(req, res) => {
  const file = new File({
    path: req.body.path,
    thumb: req.body.thumb,
    category: req.body.category
  });
  file.save();
  res.json(file)
})

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
          const image = await image;
          thumbnailFilename = "thumbnail_" + req.file.filename.split(".")[0];
          thumbarray = `public/blogs/thumbnail/${thumbnailFilename}.jpeg`;
          path = `public/blogs/uploads/${req.file.filename}`;
          console.log("a", thumbarray);
          console.log("b", path);
          master = { thumb: thumbnail, path: image };
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

    res.json(master);
  });
});

// const uploadImageToStorage = file => {
//   return new Promise((resolve, reject) => {
//     if (!file) {
//       reject("No image file");
//     }
//     let newFileName = `${file.originalname}_${Date.now()}`;

//     let fileUpload = bucket.file(newFileName);

//     const blobStream = fileUpload.createWriteStream({
//       metadata: {
//         contentType: file.type
//       }
//     });

//     blobStream.on("error", error => {
//       reject("Something is wrong! Unable to upload at the moment.", error);
//     });

//     blobStream.on("finish", () => {
//       const url = format(
//         `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`
//       );
//       resolve(url);
//     });

//     blobStream.end(file.buffer);
//   });
// };

module.exports = router;
