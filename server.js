const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const port = process.env.PORT || 3000;
const root = __dirname;
const dataDir = path.join(root, "data");
const usersFile = path.join(dataDir, "users.json");

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCKOUT_MS = 60 * 1000; // 1 minute

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

const publicPaths = new Set(["/login.html", "/login.css", "/login.js"]);

// In-memory session and rate-limit stores. These reset when the server restarts.
const sessions = new Map();
const loginAttempts = new Map();

// ---------- Password + user storage helpers ----------

function loadUsers() {
  if (!fs.existsSync(usersFile)) return [];
  try {
    return JSON.parse(fs.readFileSync(usersFile, "utf8"));
  } catch {
    return [];
  }
}

function saveUsers(users) {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

function verifyPassword(password, salt, hash) {
  const computed = Buffer.from(hashPassword(password, salt), "hex");
  const expected = Buffer.from(hash, "hex");
  if (computed.length !== expected.length) return false;
  return crypto.timingSafeEqual(computed, expected);
}

function upsertUser(username, password) {
  const users = loadUsers();
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = hashPassword(password, salt);
  const existing = users.find((user) => user.username === username);
  if (existing) {
    existing.salt = salt;
    existing.hash = hash;
  } else {
    users.push({ username, salt, hash });
  }
  saveUsers(users);
}

function ensureDefaultUser() {
  const users = loadUsers();
  if (users.length > 0) return;
  upsertUser("admin", "admin123");
  console.log("==============================================");
  console.log("No users found - created a default login:");
  console.log("  Username: admin");
  console.log("  Password: admin123");
  console.log("Change it now with:");
  console.log("  node server.js --set-password admin <newPassword>");
  console.log("==============================================");
}

// ---------- Sessions ----------

function createSession(username) {
  const sessionId = crypto.randomBytes(32).toString("hex");
  sessions.set(sessionId, { username, expiresAt: Date.now() + SESSION_DURATION_MS });
  return sessionId;
}

function parseCookies(cookieHeader) {
  const result = {};
  (cookieHeader || "").split(";").forEach((pair) => {
    const idx = pair.indexOf("=");
    if (idx === -1) return;
    const key = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1).trim();
    if (key) result[key] = decodeURIComponent(value);
  });
  return result;
}

function getSession(request) {
  const cookies = parseCookies(request.headers.cookie);
  const sid = cookies.sid;
  if (!sid) return null;
  const session = sessions.get(sid);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    sessions.delete(sid);
    return null;
  }
  return { sid, ...session };
}

// ---------- Basic login rate limiting ----------

function isLockedOut(ip) {
  const entry = loginAttempts.get(ip);
  if (!entry || !entry.lockedUntil) return false;
  if (entry.lockedUntil > Date.now()) return true;
  loginAttempts.delete(ip);
  return false;
}

function recordFailedAttempt(ip) {
  const entry = loginAttempts.get(ip) || { count: 0 };
  entry.count += 1;
  if (entry.count >= MAX_LOGIN_ATTEMPTS) {
    entry.lockedUntil = Date.now() + LOGIN_LOCKOUT_MS;
    entry.count = 0;
  }
  loginAttempts.set(ip, entry);
}

function clearFailedAttempts(ip) {
  loginAttempts.delete(ip);
}

// ---------- Request helpers ----------

function sendJSON(response, status, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  response.end(body);
}

function readJSONBody(request) {
  return new Promise((resolve, reject) => {
    let data = "";
    request.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1e6) {
        reject(new Error("Body too large"));
        request.destroy();
      }
    });
    request.on("end", () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(err);
      }
    });
    request.on("error", reject);
  });
}

function serveStaticFile(requestedPath, response) {
  const filePath = path.join(root, requestedPath);
  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream",
    });
    response.end(content);
  });
}

// ---------- CLI: manage users without starting the server ----------

function runCli() {
  const [command, username, password] = process.argv.slice(2);
  if (command !== "--set-password" && command !== "--add-user") return false;

  if (!username || !password) {
    console.log("Usage: node server.js --set-password <username> <newPassword>");
    process.exit(1);
  }

  upsertUser(username, password);
  console.log(`Saved credentials for user "${username}".`);
  process.exit(0);
}

if (runCli()) {
  // unreachable, runCli() exits the process itself; kept for clarity
}

// ---------- Server ----------

ensureDefaultUser();

const server = http.createServer(async (request, response) => {
  try {
    const cleanPath = decodeURIComponent(request.url.split("?")[0]);
    const ip = request.socket.remoteAddress || "unknown";

    if (request.method === "POST" && cleanPath === "/api/login") {
      if (isLockedOut(ip)) {
        sendJSON(response, 429, { ok: false, error: "Too many attempts. Please wait a minute and try again." });
        return;
      }

      let body;
      try {
        body = await readJSONBody(request);
      } catch {
        sendJSON(response, 400, { ok: false, error: "Invalid request." });
        return;
      }

      const username = (body.username || "").trim();
      const password = body.password || "";
      const user = loadUsers().find((item) => item.username === username);

      if (!user || !verifyPassword(password, user.salt, user.hash)) {
        recordFailedAttempt(ip);
        sendJSON(response, 401, { ok: false, error: "Invalid username or password." });
        return;
      }

      clearFailedAttempts(ip);
      const sessionId = createSession(user.username);
      response.setHeader(
        "Set-Cookie",
        `sid=${sessionId}; HttpOnly; Path=/; Max-Age=${SESSION_DURATION_MS / 1000}; SameSite=Lax`
      );
      sendJSON(response, 200, { ok: true, username: user.username });
      return;
    }

    if (request.method === "POST" && cleanPath === "/api/logout") {
      const cookies = parseCookies(request.headers.cookie);
      if (cookies.sid) sessions.delete(cookies.sid);
      response.setHeader("Set-Cookie", "sid=; HttpOnly; Path=/; Max-Age=0");
      sendJSON(response, 200, { ok: true });
      return;
    }

    if (request.method === "GET" && cleanPath === "/api/me") {
      const session = getSession(request);
      if (!session) {
        sendJSON(response, 401, { ok: false });
        return;
      }
      sendJSON(response, 200, { ok: true, username: session.username });
      return;
    }

    if (request.method === "POST" && cleanPath === "/api/change-password") {
      const session = getSession(request);
      if (!session) {
        sendJSON(response, 401, { ok: false, error: "Not logged in." });
        return;
      }

      let body;
      try {
        body = await readJSONBody(request);
      } catch {
        sendJSON(response, 400, { ok: false, error: "Invalid request." });
        return;
      }

      const users = loadUsers();
      const user = users.find((item) => item.username === session.username);
      const currentPassword = body.currentPassword || "";
      const newPassword = body.newPassword || "";

      if (!user || !verifyPassword(currentPassword, user.salt, user.hash)) {
        sendJSON(response, 401, { ok: false, error: "Current password is incorrect." });
        return;
      }
      if (newPassword.length < 4) {
        sendJSON(response, 400, { ok: false, error: "New password must be at least 4 characters." });
        return;
      }

      const salt = crypto.randomBytes(16).toString("hex");
      user.salt = salt;
      user.hash = hashPassword(newPassword, salt);
      saveUsers(users);
      sendJSON(response, 200, { ok: true });
      return;
    }

    if (publicPaths.has(cleanPath)) {
      serveStaticFile(cleanPath, response);
      return;
    }

    const requestedPath = cleanPath === "/" ? "/index.html" : cleanPath;
    const session = getSession(request);

    if (!session) {
      if (requestedPath === "/index.html" || path.extname(requestedPath) === ".html") {
        response.writeHead(302, { Location: "/login.html" });
        response.end();
      } else {
        response.writeHead(401, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Unauthorized");
      }
      return;
    }

    serveStaticFile(requestedPath, response);
  } catch (err) {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Server error");
  }
});

server.listen(port, () => {
  console.log(`MediStore Manager running at http://localhost:${port}`);
});