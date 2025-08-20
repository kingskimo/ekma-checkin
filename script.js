// script.js
let currentUser = null;

// Auto-set today's date
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("date").valueAsDate = new Date();
});

// Check authentication state
auth.onAuthStateChanged(user => {
  const loginSection = document.getElementById("loginSection");
  const visitorsSection = document.getElementById("visitorsSection");

  if (user) {
    currentUser = user;
    if (loginSection) loginSection.style.display = "none";
    if (visitorsSection) visitorsSection.style.display = "block";
    loadVisitors();
  } else {
    if (loginSection) loginSection.style.display = "block";
    if (visitorsSection) visitorsSection.style.display = "none";
  }
});

// Sign In
function signIn() {
  const email = document.getElementById("adminEmail").value;
  const password = document.getElementById("adminPassword").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => alert("Login successful!"))
    .catch(error => alert("Error: " + error.message));
}

// Sign Out
function signOutUser() {
  auth.signOut().then(() => alert("Signed out!"));
}

// Load Visitors
function loadVisitors() {
  const visitorsList = document.getElementById("visitorsList");
  visitorsList.innerHTML = "";

  db.collection("visitors")
    .orderBy("timestamp", "desc")
    .onSnapshot(snapshot => {
      visitorsList.innerHTML = "";
      snapshot.forEach(doc => {
        const data = doc.data();
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${data.name}</td>
          <td>${data.purpose}</td>
          <td>${data.phone}</td>
          <td>${data.date} ${data.time}</td>
        `;
        visitorsList.appendChild(tr);
      });
    });
}

// Export to CSV
function exportToCSV() {
  let csv = "Name,Purpose,Phone,Date & Time\n";
  db.collection("visitors")
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const data = doc.data();
        csv += `"${data.name}","${data.purpose}","${data.phone}","${data.date} ${data.time}"\n`;
      });

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ekma-visitors-${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
    });
}

// Check-in Form Submission
const form = document.getElementById("checkInForm");
if (form) {
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("fullName").value;
    const purpose = document.getElementById("purpose").value;
    const phone = document.getElementById("phone").value;
    const date = document.getElementById("date").value;
    const time = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const visitorData = {
      name,
      purpose,
      phone,
      date,
      time,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    };

    try {
      await db.collection("visitors").add(visitorData);
      showSuccess(`Check-in successful, ${name}!`);
      form.reset();
      document.getElementById("date").valueAsDate = new Date();
    } catch (error) {
      console.error("Error saving data: ", error);
      alert("Failed to save. Please try again.");
    }
  });
}

// Show success message
function showSuccess(msg) {
  const alert = document.getElementById("alert");
  alert.textContent = msg;
  alert.style.display = "block";
  setTimeout(() => (alert.style.display = "none"), 3000);
}