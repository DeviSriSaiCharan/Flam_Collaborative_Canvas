# 🎨 Real-Time Collaborative Drawing Canvas

A **multi-user real-time collaborative drawing application** built using **Node.js**, **Express**, **Socket.IO**, and **HTML5 Canvas** — where multiple users can draw together on the same canvas with instant synchronization, undo/redo, and per-user tracking.

---

## 📋 Overview

This project enables users to:

- Draw on a shared canvas in real time  
- Choose custom brush colors and stroke widths  
- Undo and redo their own drawings  
- Join specific rooms (isolated drawing sessions)  
- See other connected users in the same room  
- Track approximate user location (via GeoIP)

The system uses **Socket.IO** for low-latency real-time synchronization and **HTML5 Canvas** for drawing operations.

---

## 🏗️ Architecture Overview

The architecture is divided into **Client** and **Server** layers:

### **Client**
- Renders canvas UI using `HTML5 Canvas`
- Captures mouse/touch pointer events
- Buffers drawing data for efficiency
- Emits strokes to the server every 40ms
- Listens to `stroke`, `undo`, `redo`, and `clear` events from the server

### **Server**
- Built with `Express` and `Socket.IO`
- Manages rooms, users, and stroke history
- Maintains `undoStack` and `redoStack` for each user
- Handles synchronization, conflict resolution, and broadcasting
- Uses `geoip-lite` to identify user locations

---

## 📂 Folder Structure
```
collaborative-canvas/
├── client/
│ ├── index.html # Main UI
│ ├── style.css # Tailwind styling
│ ├── main.js # Entry point and initialization
│ ├── canvas.js # Drawing logic (Canvas API)
│ └── websocket.js # WebSocket (Socket.IO) communication
│
├── server/
│ ├── server.ts # Express + Socket.IO backend
│ ├── rooms.ts # Room and user state management
│ └── drawing-state.ts # Undo/Redo and stroke synchronization
│
├── package.json
├── README.md
└── ARCHITECTURE.md
```


---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository
```bash
git clone https://github.com/<your-username>/collaborative-canvas.git
cd collaborative-canvas
```

### 2️⃣ Install Dependencies
```bash
pnpm install
```

### 3️⃣ Run in Development
```bash
npm run build
npm start
```

### 4️⃣ Access Application
Open your browser and visit:
```bash
http://localhost:3000
```

## 🧠 How It Works

### 🖌️ Drawing

Each user’s mouse/touch movement generates (x, y) points, which are:

- Stored in a temporary pointsBuffer

- Sent to the server in batches every 40ms
 
- Broadcast to all users in the same room
 
- Rendered smoothly using linear interpolation

### 🔁 Undo/Redo

Each user maintains their own:

- undoStack → stores completed strokes

- redoStack → stores undone strokes

- When a user clicks Undo:
 
- Their last stroke is popped from undoStack
 
- Moved to redoStack
 
- The server rebuilds the room’s current canvas and emits newStrokes to all users


## 🛰️ WebSocket Protocol
| Event           | Direction        | Description                               |
| --------------- | ---------------- | ----------------------------------------- |
| `joinRoom`      | Client → Server  | User joins a room                         |
| `stroke`        | Client ↔ Server  | Real-time drawing data (batched points)   |
| `drawComplete`  | Client → Server  | Finalizes stroke and pushes to undo stack |
| `clear`         | Client ↔ Server  | Clears canvas for all users               |
| `undo`          | Client ↔ Server  | Removes last stroke for one user          |
| `redo`          | Client ↔ Server  | Reapplies last undone stroke              |
| `changeInUsers` | Server → Clients | Notifies user joins/disconnects           |
| `newStrokes`    | Server → Clients | Sends all active strokes to re-render     |



## ⚔️ Conflict Resolution Strategy

- Each user’s drawing is isolated in their own undoStack.

- Undo/Redo affects only that user’s strokes.

- Server rebuilds the global canvas state by merging all users’ undoStacks.

- Ensures consistency and prevents one user from undoing another’s work.


## 🧩 Testing Guide

1. Run the server locally:
```bash
npm start
```

2. Open two browser tabs:
```bash
http://localhost:3000/?room=test-room
```

3. Try the following:

- Draw in one tab → visible in both

- Click Undo/Redo → updates reflected globally

- Clear canvas → clears both tabs
 
- Observe user list updates when tabs open/close