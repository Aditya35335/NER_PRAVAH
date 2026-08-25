# PRAHARI
### Predictive Risk & Hazard Alert for Rapid Action & Incident Response

AI-Powered Landslide Early Warning, Evacuation & Disaster Response Platform for the North Eastern Region of India.

---

## 🚀 Quick Start (Works out-of-the-box)

The application starts in **DEMO MODE = ON** with zero external API keys required. Follow these steps to spin up the local servers:

### 1. Install Dependencies
Run the command below in the project root to install dependencies for the root, backend, and frontend concurrently:
```bash
npm run install:all
```

### 2. Build the Projects
Build the TypeScript files:
```bash
npm run build:all
```

### 3. Launch Both Servers
Launch the Node.js Express server (port 5000) and the React Vite server (port 5173) concurrently:
```bash
npm start
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser to view the platform!

---

## 🔑 Hackathon Demo Accounts
Toggle roles in the header to view different features. The default credentials loaded are:

| Role | Username | Password | Access Details |
|------|----------|----------|----------------|
| **Super Admin** | `admin` | `admin` | Full control over API configurations, connections, credentials |
| **District Authority** | `authority` | `authority` | Manage village lists, assign shelters, clear road blockages |
| **Disaster Officer** | `officer` | `officer` | Dispatch manual alerts and manage incident status flags |
| **Field Volunteer** | `volunteer` | `volunteer` | Mark household evacuations safe, upload slope reports |
| **Village User** | `village` | `village` | Standard citizen warning screen ("Am I in danger?") |

---

## 🚨 3-Minute Hackathon Demo Script

Follow this sequence to deliver a high-impact presentation:

1. **Step 1: Regional Overview**
   Open the Landing Page and click **Explore Live Demo**. Show the Command Center Dashboard with 24-hour rainfall trends, active warnings, and evacuation stats.
2. **Step 2: Interactive Mapping**
   Click **Risk Map** to Pan/Zoom. Explain that markers represent villages (red/yellow/green depending on risk score), blue icons represent shelters, and lines represent highways.
3. **Step 3: Trigger Rainfall Event**
   Navigate to **Settings** -> **Hackathon Simulator**. Select **Mawsynram Village** and click **Trigger Rain Spike (Medium)**. Show the telemetry updating.
4. **Step 4: ESCALATE TO CRITICAL**
   Click **Activate Critical Slide Risk (Critical)**. This raises rainfall to 145mm, pushing the risk score to 92%. Observe:
   - A critical early warning alert toast pops up automatically with sound chimes.
   - The map draws a transparent red danger zone circle.
   - The system automatically triggers **EMERGENCY MODE**, showing a flashing red response banner.
5. **Step 5: Evacuation Routing**
   Click **Evacuation** -> **Evacuation Router**. Select **Mawsynram Village** and calculate the route. Show the system calculating coordinates that dynamically bypass blocked corridors (e.g. Lunglei-Tlabung road).
6. **Step 6: Mobile Check-ins (Offline-first)**
   Open the **Village View** (mobile simulation button). 
   - Click the **Go Offline** button (observe the red `🔴 OFFLINE` status).
   - Log in as the volunteer (`volunteer` / `volunteer`) and check off a few households as "Evacuated".
   - Report a road blockage incident.
   - Turn the internet back on (`Go Online`) -> Observe the status show `🟡 SYNCING` and then `🟢 SYNCED` as it updates the dashboard counts in real time!
7. **Step 7: Production-Ready Fallback**
   Navigate to **Data Sources**. Explain how the Central Provider layer works. If OpenWeather or Copernicus APIs fail, the system falls back to simulated data with `🟡 DEMO DATA` labels, preserving stability.
