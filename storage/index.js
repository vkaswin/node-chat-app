const { initializeApp } = require("firebase/app");
const { getStorage, ref, uploadBytes, getBlob } = require("firebase/storage");

const firebaseConfig = {
  apiKey: "AIzaSyBN2QN4cpQH8peu7COhRdd17jTX_o6JThw",
  authDomain: "node-chat-app-88711.firebaseapp.com",
  projectId: "node-chat-app-88711",
  storageBucket: "node-chat-app-88711.appspot.com",
  messagingSenderId: "117512449188",
  appId: "1:117512449188:web:0aa8da61b9f13568f78a31",
  measurementId: "G-RHRWSZ0863",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const fileUpload = async (files) => {
  let urls = [];
  try {
    for (let { originalname, buffer, mimetype } of files) {
      let metadata = {
        contentType: mimetype,
      };
      let storageRef = ref(storage, originalname);
      let {
        metadata: { bucket, fullPath },
      } = await uploadBytes(storageRef, buffer, metadata);
      urls.push(
        `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${fullPath}?alt=media`
      );
    }
    return urls;
  } catch (error) {
    console.log(error);
  }
};

module.exports = { fileUpload };
