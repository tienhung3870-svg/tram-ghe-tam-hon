const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add import
if (!code.includes("import Books from './sections/Books'")) {
  code = code.replace(
    "import SmoothScroll from './SmoothScroll'",
    "import SmoothScroll from './SmoothScroll'\nimport Books from './sections/Books'"
  );
}

// Remove old #books section
const bookSectionRegex = /\{\/\* BOOK \*\/\}\s*<section className="scene scene-book" id="books">[\s\S]*?<\/section>/;
code = code.replace(bookSectionRegex, "{/* BOOK */}\n        <Books />");

// Remove BookScene import and Suspense since it's now replaced (Wait, does Books use BookScene? The prompt didn't say, it said track sách ngang. I'll remove BookScene from App.tsx).
code = code.replace("const BookScene = lazy(() => import('./scenes/BookScene'))", "");

fs.writeFileSync('src/App.tsx', code);
