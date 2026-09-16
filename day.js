const reflectionInput = document.getElementById("reflectionInput");
const nextButton = document.getElementById("nextBtn");
const wordCountText = document.getElementById("wordCount");

const MAX_WORDS = 500;

function getWords(text) {
  const trimmed = text.trim();
  if (!trimmed) return [];
  return trimmed.split(/\s+/);
}

function updateUI() {
  if (!reflectionInput || !nextButton || !wordCountText) return;

  const words = getWords(reflectionInput.value);
  const hasText = reflectionInput.value.trim().length > 0;

  wordCountText.textContent = `${words.length} / ${MAX_WORDS} words`;
  nextButton.disabled = !hasText;
}

// Restore saved text if user came back
const savedReflection = localStorage.getItem("dearmyself_dayReflection");
if (savedReflection && reflectionInput) {
  reflectionInput.value = savedReflection;
}

if (reflectionInput) {
  reflectionInput.addEventListener("input", () => {
    const words = getWords(reflectionInput.value);
    if (words.length > MAX_WORDS) {
      reflectionInput.value = words.slice(0, MAX_WORDS).join(" ");
    }
    updateUI();
  });
}

if (nextButton) {
  nextButton.addEventListener("click", () => {
    if (!nextButton.disabled) {
      const text = reflectionInput ? reflectionInput.value.trim() : "";
      localStorage.setItem("dearmyself_dayReflection", text);
      window.location.href = "energy.html";
    }
  });
}

updateUI();
