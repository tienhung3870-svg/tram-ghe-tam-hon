const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const lazyInView = `
function LazyInView({ children }: { children: React.ReactNode }) {
  const [inView, setInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); observer.disconnect() }
    }, { rootMargin: '400px' })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return <div ref={ref} style={{ width: '100%', height: '100%' }}>{inView ? children : null}</div>
}
`;

content = content.replace('export default function App() {', lazyInView + '\nexport default function App() {');
content = content.replace(/<PillarScene \/>/g, '<LazyInView><PillarScene /></LazyInView>');
content = content.replace(/<BookScene \/>/g, '<LazyInView><BookScene /></LazyInView>');

fs.writeFileSync('src/App.tsx', content);
