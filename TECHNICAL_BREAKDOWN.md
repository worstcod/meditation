# Technical Deep-Dive: The Meditation Aura Engine

This document explains the underlying engineering principles, mathematical heuristics, and architectural decisions used to build the **Dopamine Challenge Meditation App**.

---

## 1. System Architecture: Client-Side Heavy
Unlike typical apps that process data on a server, this app is built as a **Client-Side Heavy (Edge AI)** application.
- **Why?** Real-time video processing requires extremely low latency. Sending video frames to a server would be too slow and expensive.
- **How?** We use **WebAssembly (WASM)** via Google MediaPipe to run complex neural networks directly in the user's browser at 30-60 frames per second.

---

## 2. Core AI: MediaPipe Holistic Implementation
The "brain" of the app is the `vision.js` file, which orchestrates the MediaPipe Holistic model.

### Pose & Face Landmarks
- The model identifies **33 3D Pose landmarks** and **468 Face landmarks**.
- **Stillness Logic:** We specifically monitor the `Nose (0)`, `Shoulders (11, 12)`, and `Chest (avg of 11/12)` nodes.
- **Dynamic Thresholding:** We don't use a fixed pixel distance for "movement." Instead, we calculate the distance between the user's shoulders on-screen. We then set the "Strike Zone" as a percentage (approx. 10-15%) of that shoulder width. This ensures the app works whether you are sitting close to or far from the camera.

### Eye-Closure Detection
- We calculate the **Eye Aspect Ratio (EAR)** or use MediaPipe's visibility/blendshapes to determine if the eyes are closed.
- If the distance between the upper and lower eyelid landmarks falls below a specific threshold for 3 consecutive seconds, a failure is triggered.

---

## 3. The Aura Rendering Engine (Canvas & Math)
The visual "halo" effect is achieved using the HTML5 **2D Canvas API** and complex layering techniques.

### Silhouette Segmentation
MediaPipe provides a **Segmentation Mask**—a black-and-white image where "White" is the person and "Black" is the background.
1. We draw this mask onto an offscreen canvas.
2. We use `globalCompositeOperation = 'source-in'` to fill only the "White" (person) area with the current level's colors (e.g., Orange).
3. We then draw this colored silhouette back onto the main canvas multiple times with a `filter = blur(Xpx)`.
4. **Thickness Scaling:** As `gameState.currentLevel` increases, we programmatically increase the `blur` radius and draw the silhouette 3-4 times on top of itself to increase "Density" (Opacity).

### The Submerging Effect (Physics)
Each "bubble" is an object in a `particles[]` array with properties: `x, y, vx, vy, life, decay`.
- **Source-In Clipping:** When bubbles fall, they are drawn using the segmentation mask as a "clipping path." This makes it look like they are disappearing *inside* your body rather than just falling behind you.
- **Level Up Bursts:** When a timer milestone is hit, we spawn 80 particles with high downward velocity (`vy`) from the top-center to simulate an "energy splash."

---

## 4. Game Loop & Mode Pacing
The `main.js` file runs a `setInterval` (the game loop) every 1 second.

### The Math of Levels
There are **21 Levels** (Black to Silver).
- **Normal Mode:** Uses a non-linear array `LEVEL_THRESHOLDS`. The time required to level up increases as you get closer to Silver (e.g., 30s for Level 1, but 10 minutes for Level 20).
- **Linear Modes:** Dharana (21s), Dhyana (48s), and Samadhi (108s) override this array, using a simple `Math.floor(elapsedTime / interval)` to force a consistent level-up pace.

---

## 5. Persistence & Multi-Platform Strategy
### Mock Authentication
Since we want it to be a standalone tool, we use **LocalStorage API**.
- User data is serialized into JSON strings and stored in the browser's disk.
- When you "Sign In," we look up the email key in the local dictionary.

### PWA (Progressive Web App)
To allow installation as an **APK/Mobile App**, we implemented:
- **Web Manifest:** Tells Android to treat the browser tab as an "Installed App" (no URL bar).
- **Service Worker:** Receptacles (intercepts) network requests. When the app asks for the MediaPipe AI models, the Service Worker serves them from the local cache, allowing for a smooth experience even on slower mobile networks.

---

## 6. Interactive Mapper (The Custom Click)
When setting custom targets, we translate the 2D mouse click (`clientX/Y`) into the normalized AI coordinate space (`0.0 to 1.0`). We then run a **Nearest Neighbor Search**:
1. Iterate through all 33 pose nodes.
2. Calculate the distance (Euclidean) from the click to the node.
3. The node with the smallest distance becomes the new "Green" tracking target.

---

### Summary Checklist of Tech
- **Language:** ES6+ JavaScript
- **API:** HTML5 Canvas, MediaPipe, ServiceWorker API, LocalStorage
- **Design:** Glassmorphism (CSS Blur + Translucency)
- **Physics:** Euler Integration for particles (velocity + gravity)
