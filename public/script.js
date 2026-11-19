// ==========================================
// BREATHEWISE AI - COMPLETE FRONTEND SCRIPT
// ==========================================

// Backend automatically uses the same hostname as the website.
// This supports both laptop and phone.
// TO THIS:
const BACKEND_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : "";

// ==========================================
// DEMO CITY DATA FOR COMPARISON
// These are illustrative values, not live readings.
// ==========================================

const demoCities = {
  patna: {
    name: "Patna",
    aqi: 156,
    status: "Unhealthy",
    pm25: 62,
    pm10: 104,
    no2: 31
  },

  delhi: {
    name: "Delhi",
    aqi: 178,
    status: "Unhealthy",
    pm25: 75,
    pm10: 120,
    no2: 42
  },

  mumbai: {
    name: "Mumbai",
    aqi: 95,
    status: "Moderate",
    pm25: 35,
    pm10: 65,
    no2: 22
  },

  bengaluru: {
    name: "Bengaluru",
    aqi: 72,
    status: "Moderate",
    pm25: 28,
    pm10: 48,
    no2: 18
  },

  kolkata: {
    name: "Kolkata",
    aqi: 142,
    status: "Unhealthy for sensitive groups",
    pm25: 55,
    pm10: 90,
    no2: 29
  }
};

// ==========================================
// AQI STATUS
// ==========================================

function getAQIStatus(aqi) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}

function getAQIDescription(aqi) {
  if (aqi <= 50) {
    return "Air quality is good. Enjoy your outdoor activities.";
  }

  if (aqi <= 100) {
    return "Air quality is acceptable for most people.";
  }

  if (aqi <= 150) {
    return "Sensitive groups should take extra care.";
  }

  if (aqi <= 200) {
    return "Consider reducing prolonged outdoor activities.";
  }

  if (aqi <= 300) {
    return "Avoid prolonged outdoor exposure.";
  }

  return "Air quality is hazardous. Follow local health guidance.";
}

// ==========================================
// UPDATE DASHBOARD
// ==========================================

async function showCity(cityName) {
  const cityTitle = document.getElementById("cityTitle");
  const aqiValue = document.getElementById("aqiValue");
  const aqiStatus = document.getElementById("aqiStatus");
  const aqiDescription = document.getElementById("aqiDescription");
  const dataNotice = document.getElementById("dataNotice");

  try {
    if (cityTitle) cityTitle.textContent = `Loading ${cityName}...`;

    // Find city coordinates.
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
    );

    if (!geoResponse.ok) {
      throw new Error("Unable to search for this city.");
    }

    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("City not found. Try another city name.");
    }

    const location = geoData.results[0];

    // Load forecast.
    loadForecast(location.latitude, location.longitude);

    // Get current estimated air-quality readings.
    const airURL =
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${location.latitude}&longitude=${location.longitude}&current=us_aqi,pm2_5,pm10,nitrogen_dioxide&timezone=auto`;

    const airResponse = await fetch(airURL);

    if (!airResponse.ok) {
      throw new Error("Air-quality service is temporarily unavailable.");
    }

    const airData = await airResponse.json();

    if (!airData.current) {
      throw new Error("No air-quality readings available.");
    }

    const current = airData.current;

    const aqi = Math.round(current.us_aqi);

    if (cityTitle) cityTitle.textContent = location.name;
    if (aqiValue) aqiValue.textContent = aqi;
    if (aqiStatus) aqiStatus.textContent = getAQIStatus(aqi);

    if (aqiDescription) {
      aqiDescription.textContent = getAQIDescription(aqi);
    }

    document.getElementById("pm25Value").textContent =
      current.pm2_5 ?? "--";

    document.getElementById("pm10Value").textContent =
      current.pm10 ?? "--";

    document.getElementById("no2Value").textContent =
      current.nitrogen_dioxide ?? "--";

    const meter = document.getElementById("aqiMeter");

    if (meter) {
      meter.style.width = Math.min((aqi / 500) * 100, 100) + "%";
    }

    if (dataNotice) {
      dataNotice.textContent =
        "Showing estimated air-quality data from Open-Meteo. AQI uses the US AQI scale and may differ from official CPCB readings.";
    }

  } catch (error) {
    console.error("City search error:", error);

    if (cityTitle) cityTitle.textContent = "Data unavailable";

    if (dataNotice) {
      dataNotice.textContent = error.message;
    }
  }
}

// ==========================================
// CITY SEARCH
// ==========================================

const searchButton = document.getElementById("searchButton");
const cityInput = document.getElementById("cityInput");

if (searchButton && cityInput) {
  searchButton.addEventListener("click", () => {
    const city = cityInput.value.trim();

    if (city) {
      showCity(city);
    }
  });

  cityInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      searchButton.click();
    }
  });
}

// ==========================================
// CITY COMPARISON
// ==========================================

const compareButton = document.getElementById("compareButton");

if (compareButton) {
  compareButton.addEventListener("click", () => {
    const cityOne = document.getElementById("cityOne").value;
    const cityTwo = document.getElementById("cityTwo").value;

    const first = demoCities[cityOne];
    const second = demoCities[cityTwo];

    const result = document.getElementById("comparisonResult");

    if (!first || !second || !result) return;

    result.innerHTML = `
      <h3>${first.name} vs ${second.name}</h3>

      <p><strong>${first.name} AQI:</strong> ${first.aqi}</p>
      <p><strong>${second.name} AQI:</strong> ${second.aqi}</p>

      <p><strong>${first.name} PM2.5:</strong> ${first.pm25}</p>
      <p><strong>${second.name} PM2.5:</strong> ${second.pm25}</p>

      <p><strong>${first.name} PM10:</strong> ${first.pm10}</p>
      <p><strong>${second.name} PM10:</strong> ${second.pm10}</p>

      <p><strong>Comparison:</strong>
      ${first.aqi < second.aqi
        ? first.name + " has the lower illustrative AQI."
        : second.aqi < first.aqi
          ? second.name + " has the lower illustrative AQI."
          : "Both have the same illustrative AQI."}
      </p>

      <small>Illustrative demo data, not live measurements.</small>
    `;
  });
}

// ==========================================
// 7-DAY AIR QUALITY FORECAST
// ==========================================

async function loadForecast(latitude, longitude) {
  const forecastGrid = document.getElementById("forecastGrid");

  if (!forecastGrid) return;

  forecastGrid.innerHTML = "<p>Loading forecast...</p>";

  try {
    const url =
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&hourly=us_aqi&timezone=auto&forecast_days=7`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Forecast service returned HTTP ${response.status}.`);
    }

    const data = await response.json();

    if (!data.hourly || !data.hourly.us_aqi) {
      throw new Error("Forecast data is unavailable.");
    }

    const dailyAQI = {};

    data.hourly.time.forEach((time, index) => {
      const date = time.split("T")[0];
      const value = data.hourly.us_aqi[index];

      if (value == null) return;

      if (!dailyAQI[date]) {
        dailyAQI[date] = [];
      }

      dailyAQI[date].push(value);
    });

    const days = Object.entries(dailyAQI);

    if (days.length === 0) {
      throw new Error("No forecast readings were returned.");
    }

    forecastGrid.innerHTML = days.map(([date, values]) => {
      const average = Math.round(
        values.reduce((sum, value) => sum + value, 0) / values.length
      );

      const status = getAQIStatus(average);

      const day = new Date(date + "T12:00:00")
        .toLocaleDateString("en-IN", {
          weekday: "short"
        });

      return `
        <div class="forecast-card">
          <h3>${day}</h3>
          <div class="forecast-aqi">${average}</div>
          <p>${status}</p>
        </div>
      `;
    }).join("");

  } catch (error) {
    console.error("Forecast error:", error);

    forecastGrid.innerHTML =
      `<p>Forecast error: ${error.message}</p>`;
  }
}

// ==========================================
// TODAY'S DATE
// ==========================================

const todayLabel = document.getElementById("todayLabel");

if (todayLabel) {
  todayLabel.textContent = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

// ==========================================
// BREATHEWISE AI CHATBOT
// ==========================================

const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatWindow = document.getElementById("chatWindow");

function addChatMessage(message, sender) {
  if (!chatWindow) return;

  const messageElement = document.createElement("div");

  messageElement.className = sender === "user"
    ? "user-message"
    : "bot-message";

  messageElement.textContent = message;

  chatWindow.appendChild(messageElement);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  return messageElement;
}

if (chatForm && chatInput) {
  chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const message = chatInput.value.trim();

    if (!message) return;

    addChatMessage(message, "user");

    chatInput.value = "";

    const loadingMessage = addChatMessage(
      "BreatheWise is thinking...",
      "bot"
    );

    const sendButton = chatForm.querySelector("button");

    if (sendButton) sendButton.disabled = true;

    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          message: message
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Chat service unavailable.");
      }

      loadingMessage.textContent =
        data.reply || "I could not generate an answer.";

    } catch (error) {
      console.error("Chatbot error:", error);

      loadingMessage.textContent =
        "Sorry, BreatheWise is temporarily unavailable. Please try again.";
    }

    if (sendButton) sendButton.disabled = false;
  });
}

// ==========================================
// CHAT PROMPT SUGGESTIONS
// ==========================================

document.querySelectorAll(".prompt-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    const text = chip.textContent.trim();

    if (chatInput) {
      chatInput.value = text;
      chatInput.focus();
    }
  });
});

// ==========================================
// ECO TRACKER
// ==========================================

const habitCheckboxes = document.querySelectorAll(".habit-check");
const habitScore = document.getElementById("habitScore");
const scorePercent = document.getElementById("scorePercent");
const scoreRing = document.getElementById("scoreRing");

function updateEcoScore() {
  const total = habitCheckboxes.length;

  const completed = document.querySelectorAll(
    ".habit-check:checked"
  ).length;

  const percentage = total > 0
    ? Math.round((completed / total) * 100)
    : 0;

  if (habitScore) {
    habitScore.textContent = `${completed}/${total}`;
  }

  if (scorePercent) {
    scorePercent.textContent = `${percentage}%`;
  }

  if (scoreRing) {
    scoreRing.style.background =
      `conic-gradient(#35b779 ${percentage}%, #e5e7eb ${percentage}%)`;
  }
}

habitCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", updateEcoScore);
});

updateEcoScore();

// ==========================================
// MOBILE NAVIGATION
// ==========================================

const menuButton = document.getElementById("menuButton");
const sidebar = document.getElementById("sidebar");

if (menuButton && sidebar) {
  menuButton.addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });
}

document.querySelectorAll(".sidebar a").forEach((link) => {
  link.addEventListener("click", () => {
    if (sidebar) {
      sidebar.classList.remove("active");
    }
  });
});

// ==========================================
// INITIAL DASHBOARD
// ==========================================

showCity("Patna");

console.log("BreatheWise AI frontend loaded successfully.");
console.log("Chatbot backend:", BACKEND_URL);
