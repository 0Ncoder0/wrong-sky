# Key visual prompt（概念图提示词）

> 用于生成 / 迭代 Wrong Sky 主视觉与风格对齐。  
> 成品：[`key-visual-v2.png`](./key-visual-v2.png)（当前方向）· [`key-visual-v1.png`](./key-visual-v1.png)（对照，偏卡通）  
> **当前推荐提示词：v2**

---

## v2 — 2026-09-23（推荐）

方向：从绘本/玩具感收到 **editorial illustration / indie 等距 mockup**；仍轻、仍可读，但不儿童向。

```
Game concept art key visual for an indie isometric (2.5D, fixed camera, no rotation) lite factory + tower defense game titled Wrong Sky.

Art direction: soft sci-fi editorial illustration, indie isometric game mockup. Mature cozy — relaxed and hopeful, NOT kids’ cartoon, NOT preschool, NOT kawaii mascot game. Clean thin linework (or soft edge definition with minimal outline weight), controlled cel-ish shading, gentle shadows. Buildings read as compact expedition / field equipment: rounded but structural, soft bevels, matte panels with subtle seams — NOT balloon toys, NOT plastic classroom kits, NOT chibi architecture.

Color: muted warm dusty rose / sand-beige / lavender-grey terrain; calm desaturated turquoise ocean at map edges. Fewer candy accents; clear accents only on solar panels and rocket. Avoid high-saturation pastel sticker palette.

Setting: small square alien island (~32x32 tiles feel), entire map visible, no minimap, no fog. Sparse alien flora and soft rocks (stone is a resource), airy composition with breathing room.

Camera: classic isometric diamond tiles, high readability, player-facing clarity.

Center composition:
- Small astronaut, short adult proportions (less chibi), friendly simple helmet/visor, mid-walk pose — not bulky power armor, not sticker-face cute.
- Round-edged mining building and small workshop as field gadgets (camping/expedition gear vibe), bright but restrained solar panels (glossy blue-violet accents, not grim tech).
- Playful-but-readable turret (compact pop-cannon / light defense post), a few simple ammo icons nearby — whimsical without looking like a toy squirt gun for toddlers.
- Assembler as a clean craft module / compact fabricator box (friendly, not heavy industry).
- Rocket launch pad mid-distance in a “ready” state; stubby colorful rocket with rounded fins, toy-like proportions OK but materials more matte/illustrated than plastic glossy.
- One fixed enemy spawn corner: a few same-type critters walking straight to the nearest building, ignoring the player. Geometric / hard-shell mite or small drone-like silhouette — lightly menacing, slightly goofy, NOT horror, NOT purple blob one-eye mascots.

UI overlay (clean indie PC HUD, not mobile toy UI):
- Top-left: power generation / consumption with soft icons.
- Bottom-left: pocket inventory row (stone, ore, plates, ammo, rocket parts) + numbers.
- Right: compact build bar with building thumbnails.
- Small visible tech-tree panel, one node researching with progress ring; thinner panels, rounded but not bubbly; minimal English placeholders (“Stone”, “Solar”, “Turret”, “Research…”).

Mood: relaxed, hopeful, lightly humorous. Soft alien afternoon light. NO conveyor belts, NO cables, NO warehouses, NO pipe/gear clutter.

Style keywords: isometric screenshot mockup, soft sci-fi illustration, muted palette with clear accents, thin lineart, high readability, Steam indie cozy-but-grown-up, 16:9, concept art poster quality.

Negative: no thick black outlines, no chibi, no kawaii mascot enemies, no preschool pastel, no balloon architecture, no sticker-book UI, no dark metal factories, no oily machinery porn, no neon cyberpunk, no photorealism, no gore, no horror aliens, no tiny unreadable UI, no rotating 3D camera, no pure top-down orthographic, no text walls, no watermarks, no logos of existing games.
```

**对标语感（给模型用，勿抄 UI）：** Mini Motorways 的信息干净感 + Outer Wilds 的轻好奇科幻，但是 **2D 等距插画**，不是写实 3D。

---

## v1 — 2026-09-22（原稿，偏卡通）

```
Game concept art key visual for an indie isometric (2.5D, fixed camera, no rotation) lite factory + tower defense game.

Art direction: lighthearted soft sci-fi, cozy hand-drawn 2D comic / picture-book style. NOT dark industrial, NOT hard mech, NOT cyberpunk, NOT rusty military factory, NOT photorealistic. Think “astronaut picnic on an alien planet” / colorful classroom science kits turned into cute buildings. Rounded corners, soft shapes, thick clean outlines, flat-ish cel shading, gentle shadows, cheerful but not childish clutter.

Setting: a small square alien island map (~32x32 tiles feel), entire map visible, no minimap, no fog of war. Soft alien terrain in warm dusty rose, sand-beige, and muted lavender rock. Ocean water around the borders in calm turquoise, clearly marking the map edge. Sparse cute alien plants, soft rocks (stone is a crafting resource).

Camera: classic isometric diamond tiles, readable grid, player-facing clarity over realism.

Center composition (one clear hero shot of the gameplay screen feel):
- A small cute astronaut character (short proportions, friendly helmet with a simple face reflection or visor highlight, not bulky power armor) mid-walk with a simple walk-cycle comic pose.
- Nearby: a round-edged mining building (looks like a toy digger / camping gadget, not heavy machinery), a small workshop, bright cheerful solar panels (glossy blue-violet like shiny signs, not grim tech).
- A whimsical turret that still reads as a turret but looks playful (e.g. colorful pop-cannon / slingshot tower vibe), with a few cartoon ammo icons nearby.
- An assembler that looks like a friendly craft table / toy factory box.
- A rocket launch pad building in the mid-distance, currently in a “ready / transforming” cute state, with a stubby colorful rocket (toy-like proportions, rounded fins).
- One fixed enemy spawn corner with a few same-type cute-but-threatening alien critters (simple silhouette, not horror) walking straight toward the nearest building, ignoring the player. Keep them readable and slightly goofy, not scary.

UI overlay (clean HUD, light casual game, not RTS dense):
- Top-left: power readout (generation / consumption) with soft icons.
- Bottom-left: “pocket inventory” row of simple item icons + numbers (stone, ore, plates, ammo, rocket parts).
- Right side: build bar with building thumbnails.
- A small open tech-tree panel (visible nodes, one researching with a progress ring), soft card UI, rounded rectangles, pastel panels, thin outlines. Minimal text placeholders in English like “Stone”, “Solar”, “Turret”, “Research…”.

Mood: relaxed, hopeful, lightly humorous. Soft daylight or gentle alien afternoon light. Airy composition, breathing room, not crowded with pipes/gears/conveyor belts (NO conveyor belts, NO cables, NO warehouses shown).

Technical / style keywords: isometric game screenshot mockup, 2D comic illustration, soft pastel-with-clear-accents color palette, thick lineart, cute props, high readability, Steam indie cozy sci-fi, concept art poster quality, 16:9.

Negative constraints: no dark metal factories, no oily machinery porn, no neon cyberpunk, no ultra-realistic rendering, no gore, no horror aliens, no tiny unreadable UI, no rotating 3D camera, no top-down pure 2D orthographic (keep isometric), no text walls, no watermarks, no logos of existing games.
```
