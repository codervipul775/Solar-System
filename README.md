# 3D Solar System Explorer

A beautiful interactive 3D solar system simulation built with Three.js. Explore the planets, control their orbital speeds, and switch between dark and light themes.

## Features

- Realistic 3D models of the Sun and all major planets
- Saturn's iconic ring
- Interactive camera controls (zoom, pan, rotate)
- Click on any planet to view information
- Adjust the orbital speed of each planet in real-time with sliders
- Pause/resume the simulation at any time
- Reset camera to default view
- Toggle between dark and light mode
- Responsive, modern UI

## Screenshots

![Solar System Screenshot](screenshot.png)

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, Safari)
- No installation or build tools required

### Running the Project

1. **Clone or Download** this repository to your computer.
2. **Open `index.html`** in your web browser.
   - You can double-click the file, or right-click and choose "Open with..." and select your browser.
   - If you see CORS errors, use a simple local server (see below).

#### (Optional) Run with a Local Server

Some browsers block local file loading for security. To avoid this:

- **Using Python 3:**

  ```sh
  python3 -m http.server 8000
  ```

  Then open [http://localhost:8000](http://localhost:8000) in your browser.

- **Using VS Code Live Server Extension:**
  1. Install the "Live Server" extension in VS Code.
  2. Right-click `index.html` and select "Open with Live Server".

## Project Structure

```
/ (root)
├── index.html
├── style.css
├── js/
│   └── main.js
├── img/
│   └── ... (planet textures, skybox, etc.)
└── README.md
```

## Credits

- [Three.js](https://threejs.org/) for 3D rendering
- Planet textures and skybox images from public domain/educational sources

## License

This project is for educational and demonstration purposes.
