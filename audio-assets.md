# Audio Assets Specifications

## Overview

Game Rai uses two sound effects loaded from the `assets/` directory. Audio is handled via the Web Audio API (`HTMLAudioElement`) with autoplay policy handling.

## Sound Effects

### Jump Sound
| Property  | Value              |
|-----------|--------------------|
| File      | `assets/jump.wav`  |
| Trigger   | Every time Ghosty flaps |
| Duration  | ~0.15s (short whoosh) |
| Behavior  | Reset `currentTime = 0` before each play to allow rapid repeat |

### Game Over Sound
| Property  | Value                   |
|-----------|-------------------------|
| File      | `assets/game_over.wav`  |
| Trigger   | On collision / death    |
| Duration  | ~0.8s                   |
| Behavior  | Play once per game over event |

## Autoplay Policy Handling

Browsers block audio until the first user interaction. All sounds use:

```js
audio.currentTime = 0;
audio.play().catch(() => {}); // silently ignore autoplay block
```

Since the first interaction (Space / Click / Tap) is required to start the game, audio is always unlocked before it plays.

## Error Handling

If an audio file fails to load, the game continues silently — no crash or error is shown to the user.
