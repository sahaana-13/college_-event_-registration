// ==============================
// EVENT MANAGEMENT SYSTEM
// ==============================

const STORAGE_KEY = "events";

// ---------- Utility Functions ----------
function getEvents() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveEvents(events) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

// ---------- ADMIN LOGIN ----------
function loginAdmin() {
  const user = document.getElementById("adminUser").value.trim();
  const pass = document.getElementById("adminPass").value.trim();

  if (user === "admin" && pass === "1234") { // You can change credentials here
    localStorage.setItem("adminLoggedIn", "true");
    document.getElementById("login-section").style.display = "none";
    document.getElementById("admin-section").style.display = "block";
    renderEvents();
  } else {
    alert("Invalid username or password!");
  }
}

function togglePassword() {
  const passField = document.getElementById("adminPass");
  passField.type = passField.type === "password" ? "text" : "password";
}

// ---------- ADD EVENT ----------
function addEvent() {
  const eid = document.getElementById("eid").value.trim();
  const ename = document.getElementById("ename").value.trim();
  const category = document.getElementById("category").value.trim();
  const date = document.getElementById("date").value;
  const venue = document.getElementById("venue").value.trim();
  const time = document.getElementById("time").value;

  if (!eid || !ename || !category || !date || !venue || !time) {
    alert("Please fill all fields before adding the event.");
    return;
  }

  const events = getEvents();
  if (events.some(e => e.id === eid)) {
    alert("An event with this ID already exists!");
    return;
  }

  const newEvent = {
    id: eid,
    name: ename,
    category,
    date,
    venue,
    time,
    participants: []
  };

  events.push(newEvent);
  saveEvents(events);
  renderEvents();

  document.getElementById("eventForm").reset();
  alert("Event added successfully!");
}

// ---------- RENDER EVENTS ----------
function renderEvents() {
  const list = document.getElementById("eventList") || document.getElementById("events-list");
  if (!list) return;

  const events = getEvents();
  list.innerHTML = "";

  if (events.length === 0) {
    list.innerHTML = "<p>No events available yet.</p>";
    return;
  }

  events.forEach((ev, index) => {
    const div = document.createElement("div");
    div.className = "event-card";
    div.innerHTML = `
      <h3>${ev.name}</h3>
      <p><b>ID:</b> ${ev.id}</p>
      <p><b>Category:</b> ${ev.category}</p>
      <p><b>Date:</b> ${ev.date}</p>
      <p><b>Venue:</b> ${ev.venue}</p>
      <p><b>Time:</b> ${ev.time}</p>
      ${
        document.getElementById("eventList")
          ? `
        <button class="btn small" onclick="viewParticipants('${ev.id}')">View Participants</button>
        <button class="btn small outline" onclick="downloadPDF('${ev.id}')">Download PDF</button>
      `
          : `<button class="btn small glow" onclick="register('${ev.id}')">Register</button>`
      }
    `;
    list.appendChild(div);
  });
}

// ---------- STUDENT REGISTRATION ----------
function register(eventId) {
  const name = prompt("Enter your full name:");
  const studentId = prompt("Enter your Student ID:");
  const className = prompt("Enter your Class:");
  const section = prompt("Enter your Section:");
  const department = prompt("Enter your Department:");
  const college = prompt("Enter your College Name:");

  if (!name || !studentId || !className || !section || !department || !college) {
    alert("Registration cancelled. All fields are required.");
    return;
  }

  const events = getEvents();
  const ev = events.find(e => e.id === eventId);
  if (!ev) return alert("Event not found!");

  const already = ev.participants.find(p => p.studentId === studentId);
  if (already) return alert("You have already registered for this event!");

  ev.participants.push({ name, studentId, className, section, department, college });
  saveEvents(events);
  alert("Registered successfully!");
}

// ---------- VIEW PARTICIPANTS ----------
function viewParticipants(eventId) {
  const events = getEvents();
  const ev = events.find(e => e.id === eventId);
  if (!ev) return;

  if (ev.participants.length === 0) {
    alert("No participants yet for this event.");
    return;
  }

  let list = "Participants:\n\n";
  ev.participants.forEach((p, i) => {
    list += `${i + 1}. ${p.name} (${p.studentId}) - ${p.className}-${p.section}, ${p.department}, ${p.college}\n`;
  });
  alert(list);
}

// ---------- DOWNLOAD PARTICIPANTS PDF ----------
function downloadPDF(eventId) {
  const { jsPDF } = window.jspdf;
  const events = getEvents();
  const ev = events.find(e => e.id === eventId);
  if (!ev) return;

  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(`Participants List - ${ev.name}`, 10, 10);
  doc.text(`Event ID: ${ev.id}`, 10, 20);
  doc.text(`Category: ${ev.category}`, 10, 30);
  doc.text(`Date: ${ev.date}`, 10, 40);
  doc.text(`Venue: ${ev.venue}`, 10, 50);
  doc.text(`Time: ${ev.time}`, 10, 60);

  let y = 80;
  doc.setFontSize(12);
  if (ev.participants.length === 0) {
    doc.text("No participants registered yet.", 10, y);
  } else {
    ev.participants.forEach((p, i) => {
      doc.text(`${i + 1}. ${p.name} (${p.studentId}) - ${p.className}-${p.section}, ${p.department}, ${p.college}`, 10, y);
      y += 10;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });
  }

  doc.save(`${ev.name}_Participants.pdf`);
}

// ---------- AUTO LOGIN CHECK ----------
window.addEventListener("DOMContentLoaded", () => {
  const isLoggedIn = localStorage.getItem("adminLoggedIn") === "true";
  const loginSection = document.getElementById("login-section");
  const adminSection = document.getElementById("admin-section");

  if (loginSection && adminSection) {
    if (isLoggedIn) {
      loginSection.style.display = "none";
      adminSection.style.display = "block";
    } else {
      loginSection.style.display = "block";
      adminSection.style.display = "none";
    }
  }

  renderEvents();
});
