const fs = require('fs');
let code = fs.readFileSync('src/components/Preloader.tsx', 'utf8');

code = code.replace(
  "import { gsap } from '../lib/gsap'",
  "import { gsap, ScrollTrigger } from '../lib/gsap'"
);

code = code.replace(
  "onComplete: () => setMounted(false)",
  "onComplete: () => { setMounted(false); ScrollTrigger.refresh(); }"
);

fs.writeFileSync('src/components/Preloader.tsx', code);
