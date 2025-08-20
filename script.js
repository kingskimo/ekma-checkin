// script.js - With Firebase Backend

// Firebase Configuration (REPLACE with your own)
const firebaseConfig = {
  apiKey: "AIzaSyCVdOI4tuix2j9n9zeHi20eaGPYSYMdIQY",
  authDomain: "ekma-visitor-backend.firebaseapp.com",
  projectId: "ekma-visitor-backend",
  storageBucket: "ekma-visitor-backend.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abc123"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

// Enable offline support
db.enablePersistence()
  .catch(err => {
    if (err.code === 'failed-precondition') {
      console.warn("Multiple tabs open. Offline support limited.");
    } else if (err.code === 'unimplemented') {
      console.warn("Browser doesn't support offline storage.");
    }
  });

// Auto-set today's date
document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("date");
  if (dateInput) {
    dateInput.valueAsDate = new Date();
  }
});

// Form Submission
document.getElementById("checkInForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("fullName").value;
  const purpose = document.getElementById("purpose").value;
  const phone = document.getElementById("phone").value;
  const date = document.getElementById("date").value;
  const time = new Date().toLocaleTimeString("en-US", { 
    hour: "2-digit", 
    minute: "2-digit" 
  });

  const visitorData = {
    name,
    purpose,
    phone,
    date,
    time,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    await db.collection("visitors").add(visitorData);
    
    // Show success
    const alert = document.getElementById("alert");
    alert.textContent = `Check-in successful, ${name}!`;
    alert.style.display = "block";
    setTimeout(() => alert.style.display = "none", 3000);

    // Reset form
    e.target.reset();
    document.getElementById("date").valueAsDate = new Date();

  } catch (error) {
    console.error("Error saving to Firebase: ", error);
    alert("Check-in saved locally. Syncing when online.");
  }
});
