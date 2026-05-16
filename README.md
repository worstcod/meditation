# Dopamine Challenge: Meditation

Welcome to the **Dopamine Challenge**, a camera-based meditation platform designed to gamify physical stillness. Using advanced computer vision, the app tracks your posture and rewards you for remaining perfectly still while penalizing movement. 

The ultimate goal is to evolve your energy aura from **Black** to **Gold (Buddha State)**.

---

## 🌟 Key Features

- **Real-Time Body Tracking**: Powered by Google MediaPipe, the app uses your webcam to monitor your body landmarks (Shoulders, Chest, Nose, Eyes) in 3D space.
- **Aura Evolution**: As you remain still, a dynamic, glowing aura is projected onto your silhouette. The aura grows denser, thicker, and changes color as you progress through 21 distinct levels.
- **Custom Target Nodes**: Click on the canvas before a session to select specific body parts you want the app to track (e.g., track *only* your left hand and right knee).
- **Eye Tracking**: True meditation requires closed eyes. If your eyes remain open for 3 continuous seconds (after the first 30 seconds), the session instantly ends.
- **Pie Points System**: Earn special points by hitting long streaks of absolute stillness. Pie Points act as a time-multiplier, rapidly accelerating your Aura evolution.
- **Lifetime Habits Dashboard**: Tracks your total sessions, total minutes meditated, daily consecutive streak (🔥), and your all-time personal best stillness record (🏅).
- **Global Leaderboards**: Compare your peak aura levels against legendary masters and other users based on the selected Yoga Mode.

---

## ⚖️ Game Mechanics & Rules

The game revolves around **The Unmoved Timer**. Every second you sit still pushes you closer to the next aura color. Movement sets you back.

### 🧘 Pie Points (The Rewards)
Pie Points are awarded for prolonged periods of *perfect, unbroken stillness*. Every 1 Pie Point artificially boosts your Aura progression by 60 seconds.

- **3 mins** unmoved = **+7** Pie Points
- **5 mins** unmoved = **+3** Pie Points
- **10 mins** unmoved = **+5** Pie Points
- **15 mins** unmoved = **+5** Pie Points
- **21 mins** unmoved = **+7** Pie Points
- **30 mins** unmoved = **+10** Pie Points
- **45 mins** unmoved = **+10** Pie Points
- **1 hour** unmoved = **+15** Pie Points
- **108 mins** unmoved = **+21** Pie Points (Buddha State)

### ⚠️ Strikes (The Penalties)
Large body movements register as strikes. The app dynamically calculates your shoulder width to set a fair movement threshold.

- **Strike 1**: You lose **50% of your current aura progress** (minimum 30 seconds lost), lose **30% of your decimal score**, and lose **3 Pie Points**. Your Unmoved Timer resets to 0.
- **Strike 2**: You lose **75% of your current aura progress** (minimum 60 seconds lost), lose **60% of your decimal score**, and lose **5 Pie Points**. Your Unmoved Timer resets to 0.
- **Strike 3**: **Session Terminated.** Your aura breaks entirely, and you are sent to the report card screen.

---

## 🪷 The 21 Aura Colors
Your energy evolves through the following stages:

1. Black
2. Dark Brown
3. Brown
4. Muddy Red
5. Red
6. Red-Orange
7. Orange
8. Yellow-Orange
9. Yellow
10. Yellow-Green
11. Green
12. Emerald Green
13. Blue-Green
14. Light Blue
15. Blue
16. Indigo
17. Violet
18. Lavender
19. White
20. Silver
21. **Gold (Buddha State)**

---

## ⚙️ Yoga Modes (Difficulties)

Before starting a session, you can choose a Yoga Mode. These modes alter the time required to level up and the strictness of the camera tracking.

### 1. Normal Mode (Default)
- **Progression**: Curved difficulty. The early levels are fast (30 seconds to reach Level 1), but the time required increases exponentially as you approach Gold. 
- **Total Time to Gold**: Exactly **108 minutes**.
- **Tracking Strictness**: Normal (allows movement within 15% of your shoulder width).

### 2. Dharana (Easy Focus)
- **Progression**: Linear and fast. Your aura color upgrades strictly every **21 seconds**.
- **Total Time to Gold**: **7 minutes** (420 seconds).
- **Tracking Strictness**: Normal (15% shoulder width).

### 3. Dhyana (Medium Contemplation)
- **Progression**: Linear and moderate. Your aura color upgrades strictly every **48 seconds**.
- **Total Time to Gold**: **16 minutes** (960 seconds).
- **Tracking Strictness**: Normal (15% shoulder width).

### 4. Samadhi (Hard / Master Level)
- **Progression**: Linear and slow. Your aura color upgrades strictly every **108 seconds**.
- **Total Time to Gold**: **36 minutes** (2160 seconds).
- **Tracking Strictness**: **Extremely Strict**. The movement threshold is cut in half (only 8% of your shoulder width is allowed). Furthermore, strikes register twice as fast (5 frames of movement instead of 10). Breathing heavily is enough to break your aura in Samadhi mode.

---

## 🧪 How to Test
1. Make sure you are in a well-lit room so the camera can read your posture.
2. In the "Environment" settings, you can check **"Blur My Room"** for privacy.
3. **For New Users**: On the login screen, click the **Sign Up** tab. Enter any name, age, email, and password to register a local account. Then, switch back to the **Sign In** tab and use those exact credentials to log in.
4. **Quick Demo**: Click the "👀 Watch 1-Min Demo Journey" button to see a rapid time-lapse of the 21 aura colors wrapping around you in just 60 seconds.
