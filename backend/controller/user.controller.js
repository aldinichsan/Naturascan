const { User, Image } = require('../models/user.model')
const bcryptjs = require('bcryptjs')
const jsonwebtoken = require('jsonwebtoken')
const { Storage } = require("@google-cloud/storage")
const projectId = "naturascan-388320" // Get this from Google Cloud
const keyFilename = "./key.json"  // Get this from Google Cloud -> Credentials -> Service Accounts
const storage = new Storage({ projectId, keyFilename, })
const bucket = storage.bucket("naturascan") // Get this from Google Cloud -> Storage
const tf = require('@tensorflow/tfjs-node')
// const fetch = require('node-fetch')
const axios = require('axios')
const sharp = require('sharp')

const loadModel = async () => {
  const modelPath = './my_tfjs_model/model.json';
  const model = await tf.loadLayersModel(`file://${modelPath}`);
  return model;
};

let loadedModel;
loadModel()
  .then((model) => {
    loadedModel = model;
    console.log('Model loaded');
  })
  .catch((error) => {
    console.error('Error loading model:', error);
  });

//load image 
const height = 150;
const width = 150;
async function loadImageFromUrl(url) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const imageData = Buffer.from(response.data, 'binary');

    const resizedImage = await sharp(imageData)
      .resize(width, height)
      .toBuffer();
    const imageTensor = tf.node.decodeImage(resizedImage, 3);
    const float32ImageTensor = tf.cast(imageTensor, 'float32'); // Convert dtype to float32

     // Normalize the pixel values
     const normalizedImageTensor = float32ImageTensor.div(255);

     
    const reshapedInput = normalizedImageTensor.expandDims(0);

    return reshapedInput
  } catch (error) {
    console.error('Error loading image from URL:', error);
  }
}


exports.DaftarUser = async (req, res) => {
  const { password, email } = req.body
  const emailexist = await User.findOne({ email: email })
  // const usernameexist = await User.findOne({username: username})

  if (emailexist) {
    return res.status(404).json({
      status: false,
      message: 'Email telah digunakan'
    })
  }
  // if (usernameexist){
  //     return res.status(404).json({
  //         status:false,
  //         message: 'Username telah digunakan'
  //     })
  // }
  const hashpassword = await bcryptjs.hash(password, 10)
  const user = new User({
    // username: username,
    password: hashpassword,
    email: email
  })

  user.save()
  return res.status(201).json({
    status: true,
    message: 'user berhasil ditambahkan',
  })
}

exports.LoginUser = async (req, res) => {
  const { email, password } = req.body

  const datauser = await User.findOne({ email: email })
  if (datauser) {
    const passwordUser = await bcryptjs.compare(password, datauser.password)
    if (passwordUser) {
      const data = {
        id: datauser._id
      }
      const token = await jsonwebtoken.sign(data, process.env.SECRET)
      return res.status(200).json({
        status: true,
        message: "berhasil Login",
        token: token
      })
    } else {
      return res.status(401).json({
        status: false,
        message: "Password yang anda masukkan salah"
      })
    }
  } else {
    return res.status(401).json({
      status: false,
      message: "username atau password yang anda masukkan salah"
    })
  }

}

exports.postData = async (req, res) => {
  const gambar = req.file
  const randomNumber = Math.random();
  const filename = randomNumber  + req.file.originalname
  const path = 'https://storage.googleapis.com/naturascan/'+ filename

  try {
    if (gambar) {
      const blob = bucket.file(filename);
      await new Promise((resolve, reject) => {
        const blobStream = blob.createWriteStream();
        
        blobStream.on('error', (err) => {
          // Handle error while uploading
          console.error(err);
          reject('Failed to upload file');
        });
    
        blobStream.on('finish', () => {
          // File upload is complete
          console.log('File uploaded successfully');
          resolve();
        });
    
        blobStream.end(req.file.buffer); // Start uploading the file
      });
    } else {
      throw new Error('Error with image');
    }
    
    try {
      const imageTensor = await loadImageFromUrl(path);
      const logits = loadedModel.predict(imageTensor);  
      const predictionsArray = logits.arraySync();
      const probabilities = predictionsArray[0]; // Get the probabilities for the first (and only) image
      // Find the index of the predicted class with the highest probability
      const maxProbIndex = probabilities.indexOf(Math.max(...probabilities));
      const nilai = probabilities[maxProbIndex]



      if (nilai > 0.8) {
            // To move file
            const sourceFilename = filename
            const sourceBucketName = 'naturascan'
            const destinationBucketName = 'naturascan'
            const destinationFilename = maxProbIndex+'/'+filename;
            // Define the source and destination file objects
            const sourceFile = storage.bucket(sourceBucketName).file(sourceFilename)
            const destinationFile = storage.bucket(destinationBucketName).file(destinationFilename)
            // Move the file
            async function moveFile() {
              try {
                await sourceFile.move(destinationFile)
                console.log('File moved successfully.')
              } catch (err) {
                console.error('Error moving file:', err)
              }
            }
            // Call the moveFile function to initiate the file move
            moveFile();
            // end of move file
        switch (maxProbIndex) {
          case 0:
            return res.status(200).json({
              status: true,
              "nama tumbuhan" : "allium",
              "nama latin": "Allium sativum",
              isedible : true
            })
            break;
          case 1:
            return res.status(200).json({
              status: true,
              "nama tumbuhan" : "borage",
              "nama latin": "Borago officinalis",
              isedible : true
            })
            break;
          case 2:
            return res.status(200).json({
              status: true,
              "nama tumbuhan" : "burdock",
              "nama latin": "Arctium",
              isedible : true
            })
            break;
          case 3:
            return res.status(200).json({
              status: true,
              "nama tumbuhan" : "calendula",
              "nama latin": "Calendula officinalis",
              isedible : true
            })
            break;
          case 4:
            return res.status(200).json({
              status: true,
              "nama tumbuhan" : "chickweed",
              "nama latin": "Stellaria media",
              isedible : true
            })
            break;
          case 5:
            return res.status(200).json({
              status: true,
              "nama tumbuhan" : "chicory",
              "nama latin": "Cichorium intybus",
              isedible : true
            })
            break;
          case 6:
            return res.status(200).json({
              status: true,
              "nama tumbuhan" : "common yarrow",
              "nama latin": "Achillea millefolium",
              isedible : true
            })
            break;
          case 7:
            return res.status(200).json({
              status: true,
              "nama tumbuhan" : "daisy",
              "nama latin": "Bellis perennis",
              isedible : true
            })
            break;
          case 8:
            return res.status(200).json({
              status: true,
              "nama tumbuhan" : "dandelion",
              "nama latin": "Taraxacum",
              isedible : true
            })
            break;
          case 9:
            return res.status(200).json({
              status: true,
              "nama tumbuhan" : "geranium",
              "nama latin": "Geranium",
              isedible : true
            })
            break;
          case 10:
            return res.status(200).json({
              status: true,
              "nama tumbuhan" : "ground ivy",
              "nama latin": "Glechoma hederacea",
              isedible : true
            })
            break;
          case 11:
            return res.status(200).json({
              status: true,
              "nama tumbuhan" : "henbit",
              "nama latin": "Lamium amplexicaule",
              isedible : true
            })
            break;
          case 12:
            return res.status(200).json({
              status: true,
              "nama tumbuhan" : "meadowsweet",
              "nama latin": "Filipendula ulmaria",
              isedible : true
            })
            break;
          case 13:
            return res.status(200).json({
              status: true,
              "nama tumbuhan" : "ramsons",
              "nama latin": "Allium ursinum",
              isedible : true
            })
            break;
          case 14:
            return res.status(200).json({
              status: true,
              "nama tumbuhan" : "red clover",
              "nama latin": "Trifolium pratense",
              isedible : true
            })
            break;
  
          default:  
            return res.status(200).json({
              status: true,
              "nama tumbuhan" : "Image cannot be classified",
              isedible : false
            })
            break;
        }
      }else {
        return res.status(200).json({
          status: true,
          "nama tumbuhan" : "Image cannot be classified",
          isedible : false
        })
      }
    } catch (error) {
      console.error('Error during image classification:', error);
      res.status(200).json({ error: 'Image classification failed' });
    } 

    } catch (error) {
      res.status(500).send(error)
    }
}