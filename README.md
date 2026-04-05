# 🧘 Dopamine Challenge: Meditation

A premium, camera-based meditation application designed to gamify mindfulness through the "Dopamine Challenge" concept. Using real-time AI computer vision (Google MediaPipe), the app tracks your posture and eye-stillness, rewarding your focus with a visually evolving energy "Aura" that transforms from deep Black to glowing Silver.

---

## ✨ Key Features

- **🛡️ Shield of Stillness:** High-precision postural tracking using your webcam. If you move beyond the threshold, you register a "Strike". 
- **👁️ Zen Eye-Tracking:** Automatically detects if your eyes are open or closed. After 30 seconds of meditation, keeping your eyes open for more than 3 seconds results in an immediate failure.
- **🌌 Dynamic Aura Engine:** Your bodily silhouette glows with an evolving aura. As you level up through time-based milestones, the halo grows thicker, denser, and more vibrant.
- **🌊 Energy Bubbles:** Ambient particles of your current level's color fall into your presence and "submerge" into your aura when you level up.
- **📶 Interactive Custom Targets:** Don't just use defaults—manually click on your forehead, chin, or shoulders on the live camera feed to set custom tracking points for your specific meditation needs.
- **📱 PWA & Mobile Ready:** Fully configured as a Progressive Web App (PWA). Can be installed on Android/iOS and run fullscreen like a native APK.

---

## 🎮 Game Modes (Yoga Stages)

The app features specialized timing intervals based on traditional Yoga stages:

| Mode | Level Up Interval | Difficulty |
| :--- | :--- | :--- |
| **Normal** | Geometric (30s, 60s, 120s...) | Dynamic |
| **Dharana** | Every 21 Seconds | Easy |
| **Dhyana** | Every 48 Seconds | Medium |
| **Samadhi** | Every 108 Seconds | Hard |

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3 (Vanilla), JavaScript (ES6+)
- **AI Core:** [Google MediaPipe Holistic](https://google.github.io/mediapipe/solutions/holistic.html) for real-time body and face tracking.
- **Physics:** Custom particle physics engine for aura bubbles.
- **PWA:** Service Workers and Web App Manifest for offline support and mobile installation.

---

## 🚀 Getting Started

### Prerequisites
- A modern web browser with camera access (Chrome/Edge recommended).
- A stable webcam or integrated laptop camera.

### Running Locally
1. Clone or download this repository.
2. Open `index.html` in your browser.
3. *Note: For the Service Worker and PWA features to activate, the app must be served over HTTPS or `localhost` (e.g., using VS Code Live Server).*

### How to Play
1. **Sign Up/Sign In**: Create a local profile to track your progress and Pie Points.
2. **Select Mode**: Choose between Normal, Dharana, Dhyana, or Samadhi.
3. **Calibrate**: Sit still in front of the camera. The AI will find your shoulders, head, and chest.
4. **Meditate**: Keep your eyes closed and stay perfectly still. Achievements are awarded at the 3-minute and 21-minute marks!

---

## 📲 How to Install (APK Instructions)

Since this app is a **Progressive Web App**, you can get it on your phone easily:

1. **Host the app** on a free service (GitHub Pages, Netlify, or Vercel).
2. **Visit the URL** on your Android/iOS phone.
3. **Chrome (Android)**: Tap "Add to Home Screen" or the "Install App" prompt.
4. **Safari (iOS)**: Tap the Share button and select "Add to Home Screen".
5. **For a real `.apk` file**: Go to [PWABuilder.com](https://www.pwabuilder.com/), paste your URL, and download the "Android App Package".

---

## 📝 Progression Logic (The 21 Colors)
Your Aura evolution follows a 21-level path:
`Black` → `Dark Brown` → `Brown` → `Muddy Red` → `Red` → `Orange` → `Yellow` → `Green` → `Blue` → `Indigo` → `Violet` → `Lavender` → `White` → `Gold` → `Silver`

Pie Points earned from streaks allow you to gain levels faster.

---

## 📜 Credits
Built with ❤️ to help people master their focus in a distracted world.
**Developer:** Antigravity AI Powered by Google DeepMind.
