const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Imports
code = code.replace(
  "import { gsap, ScrollTrigger } from './lib/gsap'",
  "import { gsap, ScrollTrigger } from './lib/gsap'\nimport { heroProgress } from './lib/scrollState'\nimport { useReducedMotion } from './hooks/useReducedMotion'\nimport { useIsMobile } from './hooks/useIsMobile'"
);

// Add useHeroPin hook
const useHeroPinHook = `
function useHeroPin(sectionRef: React.RefObject<HTMLElement | null>, titleRef: React.RefObject<HTMLElement | null>) {
  const isReducedMotion = useReducedMotion()
  const isMobile = useIsMobile()

  useEffect(() => {
    if (!sectionRef.current || isReducedMotion || isMobile) {
      heroProgress.current = 0
      return
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=150%',
        pin: true,
        scrub: true,
        onUpdate: (self) => {
          heroProgress.current = self.progress
        }
      })

      if (titleRef.current) {
        gsap.to(titleRef.current, {
          y: -100,
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: '+=100%',
            scrub: true,
          }
        })
      }
    })

    return () => ctx.revert()
  }, [sectionRef, titleRef, isReducedMotion, isMobile])
}
`

code = code.replace('export default function App() {', useHeroPinHook + '\nexport default function App() {');

// Add sectionRef inside App
code = code.replace(
  'const heroRef = useRef<HTMLDivElement>(null)',
  'const heroRef = useRef<HTMLDivElement>(null)\n  const heroSectionRef = useRef<HTMLElement>(null)'
);

// Call useHeroPin
code = code.replace(
  'useHeroContentReveal(heroRef)',
  'useHeroContentReveal(heroRef)\n  useHeroPin(heroSectionRef, titleRef)'
);

// Attach ref to section
code = code.replace(
  '<section className="scene scene-hero" id="hero">',
  '<section className="scene scene-hero" id="hero" ref={heroSectionRef}>'
);

fs.writeFileSync('src/App.tsx', code);
