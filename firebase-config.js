// Firebase — baza główna
const firebaseConfig = {
    apiKey: "AIzaSyD5rE81B9PNgYh-Ut8gQUpUbHWrv4MUZHg",
    authDomain: "flutter-ai-playground-d7796.firebaseapp.com",
    databaseURL: "https://flutter-ai-playground-d7796-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "flutter-ai-playground-d7796",
    storageBucket: "flutter-ai-playground-d7796.firebasestorage.app",
    messagingSenderId: "56640861835",
    appId: "1:56640861835:web:f645e0c15ab2027e00068e"
};

// Firebase — 2. baza
const firebaseConfigSecondary = {
  apiKey: "AIzaSyBs9M0G0-77vi8nAJyYYE3nfOOQlP_AAHo",
  authDomain: "aplicationkj.firebaseapp.com",
  databaseURL: "https://aplicationkj-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "aplicationkj",
  storageBucket: "aplicationkj.firebasestorage.app",
  messagingSenderId: "517530048908",
  appId: "1:517530048908:web:ad81162bc4e1f8ee1f9ea9",
  measurementId: "G-QY8EE6DBZE"
};

// Firebase — 3. baza
// Ta baza przechowuje:
// posts      -> wszystkie posty
// stats      -> wszystkie statystyki
// transfers  -> wszystkie transfery
const firebaseConfigTertiary = {
  apiKey: "AIzaSyCSfpNxbRTwL2PErQrNW4UQ-B4zqhHkrVw",
  authDomain: "strefa-f41ef.firebaseapp.com",
  projectId: "strefa-f41ef",
  storageBucket: "strefa-f41ef.firebasestorage.app",
  messagingSenderId: "460055344104",
  appId: "1:460055344104:web:221886736a2ac85160ea5d",
  measurementId: "G-ZPP3H30M35"
};

firebase.initializeApp(firebaseConfig);

const secondaryApp = firebase.initializeApp(
    firebaseConfigSecondary,
    "secondary"
);

const tertiaryApp = firebase.initializeApp(
    firebaseConfigTertiary,
    "tertiary"
);

window.db = firebase.firestore();
window.db2 = secondaryApp.firestore();
window.db3 = tertiaryApp.firestore();

window.auth = firebase.auth();
