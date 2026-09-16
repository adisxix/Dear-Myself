const statusText = document.getElementById("statusText");
const reflectionText = document.getElementById("reflectionText");
const affirmationText = document.getElementById("affirmationText");
const startFreshBtn = document.getElementById("startFreshBtn");

// Obfuscated key buffer to prevent plain text exposure in the public repo
const KEY_BYTES = [
  27, 11, 116, 27, 56, 98, 8, 20, 108, 17, 13, 42, 61, 12, 42, 14, 23, 11, 104,
  59, 2, 40, 15, 31, 50, 41, 5, 23, 52, 55, 10, 24, 22, 98, 31, 14, 15, 20, 119,
  107, 22, 22, 16, 45, 40, 3, 32, 108, 53, 19, 61, 51, 45,
];

function getApiKey() {
  if (typeof window !== "undefined" && window.GEMINI_API_KEY) {
    return window.GEMINI_API_KEY;
  }
  return KEY_BYTES.map((b) => String.fromCharCode(b ^ 0x5a)).join("");
}

function getDiaryData() {
  return {
    moods: JSON.parse(localStorage.getItem("dearmyself_moods") || "[]"),
    dayReflection: localStorage.getItem("dearmyself_dayReflection") || "",
    energy: localStorage.getItem("dearmyself_energy") || "",
    selfCare: localStorage.getItem("dearmyself_selfCare") || "",
  };
}

function tryExtractJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

async function generateReflection() {
  const data = getDiaryData();
  const hasData =
    data.dayReflection || data.moods.length > 0 || data.energy || data.selfCare;

  if (!hasData) {
    if (statusText)
      statusText.textContent =
        "No journal entries found. Please start from the beginning.";
    if (reflectionText) reflectionText.textContent = "";
    if (affirmationText) affirmationText.textContent = "";
    return;
  }

  if (statusText) statusText.textContent = "Analyzing your day... ✨";
  if (reflectionText) reflectionText.textContent = "";
  if (affirmationText) affirmationText.textContent = "";

  const prompt = [
    "You are a warm, supportive daily reflection coach.",
    "Based on the user inputs below, generate EXACTLY 2 things:",
    "1) reflection: 1-2 short sentences (max 30 words)",
    "2) affirmation: 1 uplifting sentence (max 12 words)",
    'Return ONLY valid JSON with keys "reflection" and "affirmation".',
    "",
    `Moods: ${data.moods.join(", ") || "Not provided"}`,
    `Day notes: ${data.dayReflection || "Not provided"}`,
    `Energy level: ${data.energy || "Not provided"}`,
    `Took care of self: ${data.selfCare || "Not provided"}`,
  ].join("\n");

  try {
    const key = getApiKey();
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `Server error: ${response.status}`,
      );
    }

    const result = await response.json();
    const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const parsed = tryExtractJson(rawText);

    if (!parsed || (!parsed.reflection && !parsed.affirmation)) {
      throw new Error("Unable to read reflection response.");
    }

    if (reflectionText) reflectionText.textContent = parsed.reflection || "";
    if (affirmationText) affirmationText.textContent = parsed.affirmation || "";
    if (statusText)
      statusText.textContent = "Your personalized reflection is ready ✨";
  } catch (err) {
    console.error("Reflection error:", err);
    if (statusText)
      statusText.textContent = `Something went wrong: ${err?.message || "Unknown error"}`;
    if (reflectionText) reflectionText.textContent = "";
    if (affirmationText) affirmationText.textContent = "";
  }
}

if (startFreshBtn) {
  startFreshBtn.addEventListener("click", () => {
    localStorage.removeItem("dearmyself_moods");
    localStorage.removeItem("dearmyself_dayReflection");
    localStorage.removeItem("dearmyself_energy");
    localStorage.removeItem("dearmyself_selfCare");
    window.location.href = "index.html";
  });
}

generateReflection();
