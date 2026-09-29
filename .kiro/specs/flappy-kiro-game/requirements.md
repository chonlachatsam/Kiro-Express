# Requirements Document

## Introduction

Flappy Kiro เป็นเกมบนเบราว์เซอร์แนว Flappy Bird ที่ผู้เล่นควบคุมตัวละคร Ghosty (ผี) ให้บินผ่านท่อสีเขียวที่เลื่อนมาจากขวา โดยเกมทำงานเป็นไฟล์ `index.html` เดี่ยว ไม่ต้องมี build step ใช้ vanilla HTML/CSS/JavaScript และ assets ที่มีอยู่ในโปรเจกต์แล้ว

## Glossary

- **Game**: ระบบเกม Flappy Kiro ทั้งหมด
- **Ghosty**: ตัวละครผีที่ผู้เล่นควบคุม ใช้ sprite จาก `assets/ghosty.png`
- **Pipe**: ท่อสีเขียวที่เลื่อนจากขวาไปซ้าย มีท่อบน (Top_Pipe) และท่อล่าง (Bottom_Pipe) เป็นคู่
- **Gap**: ช่องว่างระหว่าง Top_Pipe และ Bottom_Pipe ที่ Ghosty ต้องผ่าน
- **Score**: คะแนนที่เพิ่มขึ้นทุกครั้งที่ Ghosty ผ่านคู่ Pipe สำเร็จ
- **High_Score**: คะแนนสูงสุดที่เคยทำได้ในเซสชันปัจจุบัน เก็บใน localStorage
- **Canvas**: พื้นที่วาดเกมบน HTML5 Canvas element
- **Game_Loop**: วนซ้ำ animation loop ที่ขับเคลื่อนการอัปเดตและวาดเกม
- **Gravity**: แรงโน้มถ่วงที่ดึง Ghosty ลงตลอดเวลา
- **Jump_Force**: แรงที่ผลักดัน Ghosty ขึ้นเมื่อผู้เล่นกด
- **Hitbox**: พื้นที่ตรวจสอบการชนของ Ghosty และ Pipe

---

## Requirements

### Requirement 1: การแสดงผลเกมบน Canvas

**User Story:** As a player, I want to see the game rendered in a browser canvas, so that I can play the game without installing anything.

#### Acceptance Criteria

1. THE Game SHALL render a Canvas element ขนาด 400×600 pixels เป็น viewport หลักของเกม
2. THE Game SHALL วาดพื้นหลังสีฟ้า (sky blue) บน Canvas ในทุก frame
3. THE Game SHALL แสดง Ghosty sprite จาก `assets/ghosty.png` ที่ตำแหน่งปัจจุบันบน Canvas
4. THE Game SHALL แสดง Pipe คู่ละหนึ่งคู่หรือมากกว่า โดย Top_Pipe มีสีเขียวและยื่นลงมาจากด้านบน Bottom_Pipe ยื่นขึ้นมาจากด้านล่าง
5. THE Game SHALL แสดงพื้น (ground) เป็นแถบสีน้ำตาลหรือสีเขียวที่ด้านล่างของ Canvas
6. THE Game SHALL รัน Game_Loop โดยใช้ `requestAnimationFrame` เพื่อความลื่นไหล

---

### Requirement 2: การควบคุม Ghosty

**User Story:** As a player, I want to control Ghosty using keyboard or touch, so that I can play on both desktop and mobile.

#### Acceptance Criteria

1. WHEN ผู้เล่นกดปุ่ม `Space` หรือ `ArrowUp` THE Game SHALL ให้ Jump_Force แก่ Ghosty ในทิศทางขึ้น
2. WHEN ผู้เล่น Click บน Canvas THE Game SHALL ให้ Jump_Force แก่ Ghosty ในทิศทางขึ้น
3. WHEN ผู้เล่น Tap บน Canvas บนอุปกรณ์มือถือ THE Game SHALL ให้ Jump_Force แก่ Ghosty ในทิศทางขึ้น
4. WHILE เกมกำลังดำเนินอยู่ THE Game SHALL ใช้ Gravity ดึง Ghosty ลงต่อเนื่องทุก frame
5. THE Game SHALL จำกัดความเร็ว (velocity) ของ Ghosty ไม่ให้ตกเร็วเกิน 10 pixels ต่อ frame
6. WHEN ผู้เล่นกด Space หรือ Click ระหว่างหน้าจอ Start Screen THE Game SHALL เริ่มเกมและให้ Jump_Force แก่ Ghosty

---

### Requirement 3: การเลื่อนและสร้าง Pipe

**User Story:** As a player, I want pipes to continuously scroll from right to left, so that the game provides an ongoing challenge.

#### Acceptance Criteria

1. WHILE เกมกำลังดำเนินอยู่ THE Game SHALL เลื่อน Pipe ทุกชิ้นจากขวาไปซ้ายด้วยความเร็วคงที่ 2–3 pixels ต่อ frame
2. THE Game SHALL สร้าง Pipe คู่ใหม่ทุกๆ 1.5–2.5 วินาที โดยตำแหน่ง Gap สุ่มในช่วงที่ตกอยู่บน Canvas
3. THE Gap SHALL มีความสูงไม่น้อยกว่า 120 pixels เพื่อให้ผ่านได้
4. WHEN Pipe เลื่อนออกไปทางซ้ายจนพ้น Canvas THE Game SHALL ลบ Pipe นั้นออกจากหน่วยความจำ
5. THE Game SHALL วาด Pipe ด้วยสีเขียว (#4CAF50 หรือใกล้เคียง) พร้อมขอบสีเขียวเข้ม

---

### Requirement 4: การตรวจสอบการชนและเงื่อนไข Game Over

**User Story:** As a player, I want the game to end when Ghosty hits a pipe or the ground, so that I have a meaningful challenge.

#### Acceptance Criteria

1. WHEN Hitbox ของ Ghosty ทับซ้อนกับ Hitbox ของ Pipe ใดๆ THE Game SHALL หยุดเกมและแสดงหน้า Game Over
2. WHEN Ghosty ตกลงถึงพื้น (y >= ground level) THE Game SHALL หยุดเกมและแสดงหน้า Game Over
3. WHEN Ghosty บินขึ้นไปพ้นขอบบนของ Canvas (y < 0) THE Game SHALL หยุดเกมและแสดงหน้า Game Over
4. WHEN เกม Game Over THE Game SHALL เล่นไฟล์เสียง `assets/game_over.wav` หนึ่งครั้ง
5. THE Hitbox ของ Ghosty SHALL มีขนาดเล็กกว่า sprite 20% ทุกด้าน เพื่อให้การชนรู้สึกยุติธรรม (forgiving hitbox)

---

### Requirement 5: ระบบ Score

**User Story:** As a player, I want to see my current score and high score, so that I can track my progress and compete with myself.

#### Acceptance Criteria

1. WHEN Ghosty ผ่านคู่ Pipe สำเร็จ (x ของ Ghosty > x ขวาสุดของ Pipe) THE Game SHALL เพิ่ม Score ขึ้น 1 คะแนน
2. THE Game SHALL แสดง Score ปัจจุบันบน Canvas ระหว่างเกมดำเนินอยู่
3. THE Game SHALL แสดง High_Score บน Canvas ระหว่างเกมดำเนินอยู่
4. WHEN Score ปัจจุบัน > High_Score THE Game SHALL อัปเดต High_Score ทันที
5. THE Game SHALL บันทึก High_Score ลงใน `localStorage` ภายใต้ key `flappyKiroHighScore`
6. WHEN เกมโหลดขึ้นมา THE Game SHALL อ่าน High_Score จาก `localStorage` (ถ้ามี)

---

### Requirement 6: Start Screen

**User Story:** As a player, I want a start screen when I open the game, so that I know how to begin playing.

#### Acceptance Criteria

1. WHEN เกมโหลดขึ้นมา THE Game SHALL แสดง Start Screen โดยไม่เริ่ม Game_Loop ทันที
2. THE Start_Screen SHALL แสดงชื่อเกม "Flappy Kiro" บน Canvas
3. THE Start_Screen SHALL แสดงข้อความวิธีเริ่ม เช่น "Press Space or Click to Start"
4. THE Start_Screen SHALL แสดง Ghosty sprite ที่ตำแหน่งกึ่งกลาง Canvas
5. THE Start_Screen SHALL แสดง High_Score ที่บันทึกไว้ (ถ้ามี)

---

### Requirement 7: Game Over Screen

**User Story:** As a player, I want to see my final score and be able to restart, so that I can try to beat my high score.

#### Acceptance Criteria

1. WHEN เกม Game Over THE Game SHALL แสดง Game Over Screen บน Canvas
2. THE Game_Over_Screen SHALL แสดงข้อความ "Game Over"
3. THE Game_Over_Screen SHALL แสดง Final Score ของรอบนั้น
4. THE Game_Over_Screen SHALL แสดง High_Score ที่อัปเดตแล้ว
5. THE Game_Over_Screen SHALL แสดงข้อความวิธี restart เช่น "Press Space or Click to Restart"
6. WHEN ผู้เล่นกด Space หรือ Click ระหว่าง Game Over Screen THE Game SHALL reset เกมและเริ่มรอบใหม่

---

### Requirement 8: เสียงประกอบ

**User Story:** As a player, I want sound effects when jumping and dying, so that the game feels more engaging.

#### Acceptance Criteria

1. WHEN Ghosty กระโดด THE Game SHALL เล่นไฟล์เสียง `assets/jump.wav`
2. WHEN เกม Game Over THE Game SHALL เล่นไฟล์เสียง `assets/game_over.wav`
3. IF เบราว์เซอร์บล็อก autoplay audio THEN THE Game SHALL เล่นเสียงได้หลังจากมี user interaction ครั้งแรก (space/click)
4. THE Game SHALL ไม่ crash หรือแสดง error ถ้าไฟล์เสียงโหลดไม่ได้

---

### Requirement 9: ความเข้ากันได้และการรัน

**User Story:** As a developer, I want the game to run by simply opening index.html in a browser, so that no build step or server is required.

#### Acceptance Criteria

1. THE Game SHALL รันได้โดยการเปิดไฟล์ `index.html` ในเบราว์เซอร์โดยตรง (file:// protocol) หรือ localhost
2. THE Game SHALL ใช้เฉพาะ vanilla HTML5, CSS3, และ JavaScript โดยไม่มี external dependencies หรือ npm packages
3. THE Game SHALL ทำงานได้บน Chrome, Firefox, และ Edge เวอร์ชันปัจจุบัน
4. THE Game SHALL responsive บน viewport ขนาด 400px ขึ้นไป โดย Canvas อยู่กึ่งกลางหน้าจอ
5. THE Game SHALL ใช้ asset paths แบบ relative เช่น `assets/ghosty.png` เพื่อให้ทำงานได้จาก root ของโปรเจกต์
