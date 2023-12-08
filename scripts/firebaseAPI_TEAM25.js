//----------------------------------------
//  Your web app's Firebase configuration
//----------------------------------------
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDqkknGDCCxalWw-42VqM3KndrEDX5_Tx0",
  authDomain: "howru2-fcdff.firebaseapp.com",
  projectId: "howru2-fcdff",
  storageBucket: "howru2-fcdff.appspot.com",
  messagingSenderId: "80926592644",
  appId: "1:80926592644:web:e978f3a1ebb0f26a843cd1",
  measurementId: "G-RGZ8C8KKL9"
};

//--------------------------------------------
// initialize the Firebase app
// initialize Firestore database if using it
//--------------------------------------------
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
