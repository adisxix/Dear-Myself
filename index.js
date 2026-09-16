const mainContent = document.getElementById("mainContent");
const loader = document.getElementById("loader");
const startButton = document.getElementById("startBtn");

function startJournal() {
  if (startButton) startButton.disabled = true;
  if (mainContent) mainContent.style.display = "none";
  if (loader) loader.style.display = "flex";

  setTimeout(() => {
    window.location.href = "mood.html";
  }, 1200);
}

if (startButton) {
  startButton.addEventListener("click", startJournal);
}
