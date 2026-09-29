# Ghosty Sprite Specifications

## Character Overview

Ghosty is the player-controlled ghost character in Game Rai. The sprite is loaded from `assets/ghosty.png`.

## Sprite Dimensions

| Property     | Value        |
|--------------|--------------|
| Rendered size | 44 × 44 px  |
| Source file  | `assets/ghosty.png` |
| Format       | PNG (transparent background) |

## Hitbox

The hitbox is shrunk by 8px on every side to create a forgiving collision feel:

| Property       | Value              |
|----------------|--------------------|
| Hitbox padding | 8px per side       |
| Hitbox width   | 28px (44 - 8×2)    |
| Hitbox height  | 28px (44 - 8×2)    |
| Type           | AABB (Axis-Aligned Bounding Box) |

## States

| State    | Description                            |
|----------|----------------------------------------|
| Idle     | Static sprite on Start Screen          |
| Flap     | Same sprite — no animation in MVP      |
| Death    | Sprite remains visible on Game Over    |

## Fallback

If `ghosty.png` fails to load, a white circle of radius 22px is drawn as fallback.

## Starting Position

- **x:** 90px (fixed throughout gameplay)
- **y:** canvas center (300px) minus half sprite height
