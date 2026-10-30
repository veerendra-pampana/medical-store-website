const loginForm = document.querySelector("#loginForm");
const loginError = document.querySelector("#loginError");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginError.textContent = "";

  const username = document.querySelector("#loginUsername").value.trim();
  const password = document.querySelector("#loginPassword").value;

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();

    if (response.ok && data.ok) {
      window.location.href = "/";
    } else {
      loginError.textContent = data.error || "Sign in failed.";
    }
  } catch (error) {
    loginError.textContent = "Could not reach the server. Please try again.";
  }
});