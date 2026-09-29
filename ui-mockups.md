# UI Mockups & Interface Design

## Screen Layout

Canvas size: **400 × 600px**, centered on a dark background (`#1a1a2e`).

---

## 1. Start Screen

```
┌─────────────────────────┐
│                         │
│      [dim overlay]      │
│                         │
│      Game Rai           │  ← bold 42px, gold #FFD700
│                         │
│       [👻 Ghosty]       │  ← sprite at center
│                         │
│  Press Space or Click   │  ← 18px white
│       to Start          │
│                         │
│     Best: 12            │  ← 16px gold (hidden if 0)
│                         │
└─────────────────────────┘
```

---

## 2. In-Game HUD

```
┌─────────────────────────┐
│  [sky gradient]         │
│                         │
│   [pipes]               │
│                         │
│      👻                 │  ← Ghosty
│                         │
│   [pipes]               │
│                         │
├─────────────────────────┤
│  Score: 5  |  Best: 12  │  ← HUD bar, bold 16px white
└─────────────────────────┘
```

HUD bar: semi-transparent black `rgba(0,0,0,0.35)`, height 28px, sits above ground.

---

## 3. Game Over Screen

```
┌─────────────────────────┐
│                         │
│      [dim overlay]      │
│                         │
│       Game Over         │  ← bold 44px, red #FF5252
│                         │
│       Score: 5          │  ← bold 26px white
│       Best: 12          │  ← 20px gold
│                         │
│  Press Space or Click   │  ← 17px grey
│       to Retry          │
│                         │
└─────────────────────────┘
```

---

## 4. Page Layout

```
[dark background #1a1a2e]
      [canvas — green border glow]
  เอาเวลาเล่นเกมไปเรียนนะ     ← grey reminder text below canvas
```

---

## Color Palette

| Element        | Color     |
|----------------|-----------|
| Page background | `#1a1a2e` |
| Sky top        | `#5BA4CF` |
| Sky bottom     | `#87CEEB` |
| Ground         | `#8B6914` |
| Grass strip    | `#5D8A3C` |
| Pipe body      | `#4CAF50` |
| Pipe cap       | `#388E3C` |
| Title text     | `#FFD700` |
| Score text     | `#ffffff` |
| Game over text | `#FF5252` |
| Canvas border  | `#4CAF50` |
