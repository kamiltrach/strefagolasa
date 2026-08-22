// 1. Konfiguracja PIERWSZEJ bazy (Konto A)
const firebaseConfigPrimary = {
    apiKey: "AIzaSyD5rE81B9PNgYh-Ut8gQUpUbHWrv4MUZHg",
    authDomain: "flutter-ai-playground-d7796.firebaseapp.com",
    databaseURL: "https://flutter-ai-playground-d7796-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "flutter-ai-playground-d7796",
    storageBucket: "flutter-ai-playground-d7796.firebasestorage.app",
    messagingSenderId: "56640861835",
    appId: "1:56640861835:web:f645e0c15ab2027e00068e"
};

// 2. Konfiguracja DRUGIEJ bazy (Konto B)
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

// 3. Inicjalizacja obu aplikacji z użyciem globalnego obiektu 'firebase' (składnia Compat)
firebase.initializeApp(firebaseConfigPrimary);
const app2 = firebase.initializeApp(firebaseConfigSecondary, "DrugaBaza");

// 4. Przypisanie instancji do obiektu window, aby plik HTML mógł z nich korzystać
window.db = firebase.firestore();
window.auth = firebase.auth();
window.db2 = app2.firestore();
