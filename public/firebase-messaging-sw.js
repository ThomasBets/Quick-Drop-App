importScripts(
    "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"
);
importScripts(
    "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
    apiKey: "YOUR_API_KEY",
    authDomain: "quickdrop-f647e.firebaseapp.com",
    projectId: "quickdrop-f647e",
    storageBucket: "quickdrop-f647e.appspot.com",
    messagingSenderId: "458174786803",
    appId: "1:458174786803:web:xxxx",
});

const messaging = firebase.messaging();
