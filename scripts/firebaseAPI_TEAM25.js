//----------------------------------------
//  Your web app's Firebase configuration
//----------------------------------------
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAolTMgUe093R8H1C_pMExAXSyD_c7FGFg",
  authDomain: "howru-ba5c2.firebaseapp.com",
  projectId: "howru-ba5c2",
  storageBucket: "howru-ba5c2.appspot.com",
  messagingSenderId: "258348900618",
  appId: "1:258348900618:web:c8ec5d23c6286f277c1af3",
  measurementId: "G-3218ZKH4Z3"
};

//--------------------------------------------
// initialize the Firebase app
// initialize Firestore database if using it
//--------------------------------------------
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
