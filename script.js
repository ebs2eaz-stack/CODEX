const bookingForm = document.querySelector("#bookingForm");
const bookingList = document.querySelector("#bookingList");
const bookingCount = document.querySelector("#bookingCount");
const bookingDelta = document.querySelector("#bookingDelta");
const formStatus = document.querySelector("#formStatus");
const dateInput = document.querySelector("#date");
const timeInput = document.querySelector("#time");
const filterInput = document.querySelector("#bookingFilter");
const seedBtn = document.querySelector("#seedBtn");
const clearBtn = document.querySelector("#clearBtn");

const storageKey = "northstar-it-bookings";

const sampleBookings = [
  {
    id: "sample-1",
    name: "Maya Chen",
    company: "Oak & Ledger CPA",
    email: "maya@example.com",
    phone: "(555) 018-1402",
    service: "Cybersecurity Review",
    urgency: "Priority",
    date: getOffsetDate(1),
    time: "10:30",
    details: "Need MFA reviewed before new staff onboarding."
  },
  {
    id: "sample-2",
    name: "Chris Morgan",
    company: "Morgan Family Clinic",
    email: "chris@example.com",
    phone: "(555) 019-7780",
    service: "Network Management",
    urgency: "Emergency",
    date: getOffsetDate(0),
    time: "14:00",
    details: "Front desk Wi-Fi and card terminal are dropping connection."
  }
];

function getOffsetDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function loadBookings() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) {
    localStorage.setItem(storageKey, JSON.stringify(sampleBookings));
    return sampleBookings;
  }

  try {
    return JSON.parse(saved);
  } catch {
    return sampleBookings;
  }
}

function saveBookings(bookings) {
  localStorage.setItem(storageKey, JSON.stringify(bookings));
}

function formatDate(value, time) {
  const date = new Date(`${value}T${time || "09:00"}`);
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function renderBookings() {
  const bookings = loadBookings().sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const filter = filterInput.value;
  const visibleBookings = filter === "All" ? bookings : bookings.filter((booking) => booking.urgency === filter);

  bookingCount.textContent = String(bookings.length);
  bookingDelta.textContent = bookings.length === 1 ? "1 client awaiting service" : `${bookings.length} clients awaiting service`;

  if (!visibleBookings.length) {
    bookingList.innerHTML = `<div class="empty-state">No bookings match this view.</div>`;
    return;
  }

  bookingList.innerHTML = visibleBookings.map((booking) => `
    <article class="booking-item">
      <div>
        <h4>${escapeHtml(booking.company)} - ${escapeHtml(booking.service)}</h4>
        <p>${escapeHtml(booking.name)} | ${formatDate(booking.date, booking.time)}</p>
        <p>${escapeHtml(booking.details)}</p>
      </div>
      <span class="urgency ${escapeHtml(booking.urgency)}">${escapeHtml(booking.urgency)}</span>
    </article>
  `).join("");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(bookingForm);
  const booking = Object.fromEntries(formData.entries());
  booking.id = crypto.randomUUID();

  const bookings = loadBookings();
  bookings.push(booking);
  saveBookings(bookings);
  renderBookings();

  bookingForm.reset();
  setDefaults();
  formStatus.textContent = "Booking submitted. It is now visible in the dashboard.";
  window.setTimeout(() => {
    formStatus.textContent = "";
  }, 4500);
});

filterInput.addEventListener("change", renderBookings);

seedBtn.addEventListener("click", () => {
  const bookings = loadBookings();
  const index = bookings.length + 1;
  bookings.push({
    id: crypto.randomUUID(),
    name: "Taylor Brooks",
    company: `New Client ${index}`,
    email: "taylor@example.com",
    phone: "(555) 010-3344",
    service: "Helpdesk Support",
    urgency: index % 2 ? "Standard" : "Priority",
    date: getOffsetDate(index % 5),
    time: "11:00",
    details: "Needs help with workstation setup and Microsoft 365 access."
  });
  saveBookings(bookings);
  renderBookings();
});

clearBtn.addEventListener("click", () => {
  saveBookings([]);
  renderBookings();
});

function setDefaults() {
  dateInput.min = getOffsetDate(0);
  dateInput.value = getOffsetDate(1);
  timeInput.value = "09:30";
}

setDefaults();
renderBookings();
