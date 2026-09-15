const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Imports
if (!code.includes("import Preloader from './components/Preloader'")) {
  code = code.replace(
    "import SmoothScroll from './SmoothScroll'",
    "import SmoothScroll from './SmoothScroll'\nimport Preloader from './components/Preloader'\nimport Cursor from './components/Cursor'\nimport Marquee from './components/Marquee'"
  );
}

// Remove old CursorGlow import and usage
// Wait, CursorGlow is not imported in the current file if it was a component inside or auto-imported?
// Let's just remove <CursorGlow />
code = code.replace("<CursorGlow />", "<Cursor />");

// Insert Preloader right inside <div className="app">
code = code.replace('<div className="app">', '<div className="app">\n        <Preloader />');

// Insert Marquee between Books and About
code = code.replace(
  '{/* ABOUT */}',
  '<Marquee />\n\n        {/* ABOUT */}'
);

fs.writeFileSync('src/App.tsx', code);
