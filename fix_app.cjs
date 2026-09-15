const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Fix old gsap imports
code = code.replace("import gsap from 'gsap'", "import { gsap, ScrollTrigger } from './lib/gsap'");
code = code.replace("import { ScrollTrigger } from 'gsap/ScrollTrigger'", "");
code = code.replace("gsap.registerPlugin(ScrollTrigger)", "");

// Check if hooks were imported
if (!code.includes('import { useReducedMotion }')) {
  code = code.replace(
    "import { gsap, ScrollTrigger } from './lib/gsap'",
    "import { gsap, ScrollTrigger } from './lib/gsap'\nimport { heroProgress } from './lib/scrollState'\nimport { useReducedMotion } from './hooks/useReducedMotion'\nimport { useIsMobile } from './hooks/useIsMobile'"
  );
}

// Rename function inside App if it was incorrectly placed
code = code.replace(/function useHeroPinHook\(\) \{/g, ''); // just in case

fs.writeFileSync('src/App.tsx', code);
