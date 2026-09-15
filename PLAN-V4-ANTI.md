# PLAN V4 — Trạm Ghế Tâm Hồn lên cấp Awwwards

> Người lập kế hoạch: Claude. Người làm: Antigravity.
> Anti KHÔNG tự đổi kế hoạch. Làm đúng thứ tự. Mỗi Phase xong mới qua Phase sau.

## Luật bắt buộc

1. Stack giữ nguyên: Vite + React 19 + R3F + drei + GSAP + Lenis. KHÔNG cài framework mới (không Next.js, không Tailwind).
2. Được cài thêm đúng 2 gói: `@react-three/postprocessing`, `split-type`. Ngoài ra cấm.
3. Mỗi Phase = 1 commit riêng, message dạng `feat: v4 phase N - ...`.
4. Sau mỗi Phase phải chạy và dán KẾT QUẢ THẬT (số, không nói suông):
   - `find . -name "._*" -delete && npm run build` → 0 errors
   - Screenshot puppeteer 390x844 + 1440x900
   - `scrollWidth === clientWidth` ở cả 2 viewport
5. Tôn trọng `prefers-reduced-motion`: có media query thì tắt scrub/pin/parallax, chỉ fade nhẹ.
6. Mobile (<768px): tắt postprocessing, giảm particle còn 1/3, không pin section dài.
7. File > 300 dòng thì tách. Không để `console.log`.
8. Nếu kẹt quá 2 lần cùng lỗi → DỪNG, ghi lỗi vào `BLOCKERS.md`, không đoán bừa.

## Nguồn học (Anti đọc code/bài viết, không cần xem video)

| Kỹ thuật | Nguồn |
|---|---|
| Scroll pin + scrub 3D | github.com/adrianhajdin/iphone (JS Mastery Apple-style) |
| Awwwards GSAP patterns | JS Mastery GSAP course repo (tìm trên github adrianhajdin) |
| Parallax, text reveal, magnetic | blog.olivierlarose.com/tutorials |
| Infinite gallery + Flip | tympanus.net/codrops/2026/07/30/building-an-infinite-gsap-scroll-gallery-with-parallax-and-flip-transitions/ |
| 3D scroll text | tympanus.net/codrops/2025/11/04/creating-3d-scroll-driven-text-animations-with-css-and-gsap/ |

Chỉ bóc PATTERN, không copy nguyên file.

---

## Phase 0 — Nền móng (không thêm hiệu ứng)

Mục tiêu: dọn để các Phase sau cắm vào sạch.

- Tạo `src/lib/gsap.ts`: register ScrollTrigger + Flip 1 lần duy nhất, export `gsap`.
- Nối Lenis với ScrollTrigger trong `SmoothScroll.tsx`: `lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker.add` + `lagSmoothing(0)`.
- Tạo `src/hooks/useReducedMotion.ts` và `src/hooks/useIsMobile.ts`.
- Tách `App.tsx` thành `src/sections/Hero.tsx`, `Pillars.tsx`, `Books.tsx`, `About.tsx`.
- Mọi animation GSAP dùng `gsap.context()` + cleanup trong `useLayoutEffect` (hoặc `useGSAP` nếu tự viết hook tương đương).

Nghiệm thu: web nhìn y hệt v3, build sạch, không lỗi console.

## Phase 1 — Hero điện ảnh

- Title: dùng `split-type` tách chữ → mỗi ký tự `yPercent:110 → 0`, bọc trong `overflow:hidden` (clip reveal, KHÔNG dùng opacity). Stagger 0.03.
- Hero pin 150vh: khi scroll, compass xoay theo `progress` (0 → 180°), camera dolly lùi nhẹ, title mờ + trượt lên.
- Truyền scroll progress vào R3F qua 1 ref (không setState mỗi frame).
- Slogan xuất hiện theo từng dòng sau khi title xong.

Nghiệm thu: screenshot ở scroll 0%, 50%, 100% của hero.

## Phase 2 — 3D chất lượng cao

- Thêm `@react-three/postprocessing`: Bloom (luminanceThreshold ~0.6), Vignette nhẹ. Chỉ desktop.
- `drei` `<Environment preset="night" />` cho compass có phản chiếu kim loại vàng.
- Compass: material `meshStandardMaterial` metalness 0.9 roughness 0.25.
- Chuột di → compass nghiêng nhẹ (lerp, tối đa 8°).
- `dpr={[1, 1.5]}`, `frameloop` dừng khi hero ra khỏi viewport (IntersectionObserver).

Nghiệm thu: FPS đo bằng `performance.now` trong 3s ≥ 50 trên desktop; ghi số.

## Phase 3 — Pillars: reveal có nhịp

- Mỗi card: clip-path `inset(100% 0 0 0) → inset(0)` + ảnh/icon bên trong scale 1.2 → 1 (parallax trong card).
- Heading section dùng cùng text reveal Phase 1 (tái dùng hook `useSplitReveal`).
- Hover desktop: card nghiêng 3D theo chuột (max 6°), viền sáng vàng chạy theo con trỏ.

## Phase 4 — Books: horizontal scroll gallery

- Section pin, cuộn dọc → sách chạy ngang (pattern Olivier Larose horizontal-scroll).
- Mỗi sách parallax nhẹ khác tốc độ.
- Click sách → GSAP Flip phóng to thành chi tiết, click lại thu về.
- Mobile: bỏ pin, thành swipe ngang native (`scroll-snap`).

## Phase 5 — Micro-interaction

- Magnetic button cho CTA (hút theo chuột, bán kính 80px).
- Cursor: vòng tròn nhỏ + phóng to khi hover link/card (thay radial glow hiện tại, giữ tông vàng).
- Marquee chữ chạy vô hạn giữa Books và About, tốc độ tăng theo vận tốc scroll (Lenis velocity).
- Preloader: số % đếm 0→100 khi asset 3D load (`useProgress` của drei), rồi màn trượt lên.

## Phase 6 — Kiểm định cuối

- Lighthouse mobile: Performance ≥ 70, Accessibility ≥ 90. Ghi số.
- Test reduced-motion bật trong Chrome DevTools → không có pin/scrub.
- Không overflow ngang ở 360, 390, 768, 1440.
- Quay 1 video màn hình 20s (puppeteer screencast hoặc ghi tay) để Hùng xem.
- Push GitHub, ghi `CHANGELOG-V4.md` liệt kê từng Phase + số đo.

---

## Báo cáo mỗi Phase (Anti dán đúng format)

```
PHASE N: <tên>
Files đổi: ...
Build: <thời gian> / <số errors>
Overflow 390: <scrollWidth>/<clientWidth>
Overflow 1440: ...
Screenshot: <đường dẫn>
Vấn đề còn lại: ...
Commit: <hash>
```
