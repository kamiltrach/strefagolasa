const firebaseConfig = {
    apiKey: "AIzaSyD5rE81B9PNgYh-Ut8gQUpUbHWrv4MUZHg",
    authDomain: "flutter-ai-playground-d7796.firebaseapp.com",
    databaseURL: "https://flutter-ai-playground-d7796-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "flutter-ai-playground-d7796",
    storageBucket: "flutter-ai-playground-d7796.firebasestorage.app",
    messagingSenderId: "56640861835",
    appId: "1:56640861835:web:f645e0c15ab2027e00068e"
};

try {
    firebase.initializeApp(firebaseConfig);
    // Udostępniamy obiekty globalnie dla pliku index.html
    window.db = firebase.firestore();
    window.auth = firebase.auth();
} catch (e) {
    console.error("Błąd inicjalizacji Firebase", e);
}