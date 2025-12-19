/* ==========================================
   LOGIN SYSTEM ISAMARKETS (ADVANCED)
   - Multi User
   - Password Hash (SHA-256)
   - Auto Logout
   - Dark Mode
========================================== */

/* ====== KONFIGURASI ====== */
const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 menit (ubah sesuai kebutuhan)

/* ====== DATA USER (HASHED PASSWORD) ====== */
const users = [
    {
        username: "admin",
        role: "admin",
        password: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9" 
        // hash dari "12345"
    },
    {
        username: "kasir",
        role: "kasir",
        password: "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92"
        // hash dari "123456"
    }
];

/* ====== HASH FUNCTION ====== */
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

/* ====== LOGIN FUNCTION ====== */
async function login() {
    const userInput = document.getElementById("username").value.trim();
    const passInput = document.getElementById("password").value.trim();
    const agree = document.getElementById("agree").checked;
    const error = document.getElementById("error");

    error.textContent = "";

    if (!userInput || !passInput) {
        error.textContent = "Username dan Password wajib diisi!";
        return;
    }

    if (!agree) {
        error.textContent = "Anda wajib menyetujui Privacy Policy & Terms!";
        return;
    }

    const hashed = await hashPassword(passInput);
    const user = users.find(
        u => u.username === userInput && u.password === hashed
    );

    if (!user) {
        error.textContent = "Username atau Password salah!";
        return;
    }

    /* ====== SIMPAN SESSION ====== */
    localStorage.setItem("login", "true");
    localStorage.setItem("user", user.username);
    localStorage.setItem("role", user.role);
    localStorage.setItem("lastActivity", Date.now());

    window.location.href = "index.html";
}

/* ====== AUTO LOGOUT ====== */
function checkSession() {
    const last = localStorage.getItem("lastActivity");
    if (!last) return;

    if (Date.now() - last > SESSION_TIMEOUT) {
        alert("Session habis. Silakan login kembali.");
        logout();
    }
}

/* ====== UPDATE AKTIVITAS ====== */
function updateActivity() {
    localStorage.setItem("lastActivity", Date.now());
}

/* ====== LOGOUT ====== */
function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

/* ====== DARK MODE ====== */
function toggleDarkMode() {
    document.body.classList.toggle("dark");
    localStorage.setItem(
        "darkMode",
        document.body.classList.contains("dark") ? "on" : "off"
    );
    updateDarkIcon();
}

function updateDarkIcon() {
    const btn = document.querySelector(".dark-toggle");
    if (btn) {
        btn.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
    }
}

/* ====== LOAD PAGE ====== */
window.addEventListener("DOMContentLoaded", () => {
    // Dark Mode
    if (localStorage.getItem("darkMode") === "on") {
        document.body.classList.add("dark");
    }
    updateDarkIcon();

    // Auto logout checker
    setInterval(checkSession, 10000);

    // Update aktivitas user
    ["click", "keydown", "mousemove"].forEach(evt => {
        document.addEventListener(evt, updateActivity);
    });

    // Enter = Login
    document.addEventListener("keydown", e => {
        if (e.key === "Enter") login();
    });
});
