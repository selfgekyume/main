# Build prompt: SORROWBLOOM

> Paste everything below the line into a fresh Claude Code session. It's written as instructions from me to me, so it can be followed top to bottom without asking questions.

---

## The ask

Build **SORROWBLOOM**, a single-player, endlessly replayable, top-down twin-stick roguelike in the spirit of *The Binding of Isaac*, but sadder, darker and more emo. Think: a kid lost inside their own head after a bad night, fighting the things they can't say out loud. Candlelight, rain on windows, wilted flowers, black eyeliner tears, cassette-tape static, and a soundtrack that sounds like a 2am bedroom-recorded post-rock demo.

It should be the kind of game where you die, sigh, and immediately hit "again". Short runs (15–25 min), lots of items, every run feels different.

## Hard constraints

- **One file:** `sorrowbloom/index.html`. Vanilla JS + `<canvas>` + Web Audio. No build step, no frameworks, no external assets. Everything (sprites, sounds, music) is generated in code.
- Fonts from Google Fonts only (suggest *Pirata One* or *UnifrakturMaguntia* for titles, *VT323* or *Silkscreen* for UI).
- Runs at 60fps on a mid laptop with 200+ bullets on screen. Use object pools for bullets, particles and enemies; fixed-timestep update, interpolated render.
- Low internal resolution (e.g. 480×270), scaled up with `image-rendering: pixelated`, letterboxed. Works on desktop (keyboard + mouse, gamepad via Gamepad API) and on phones (dual virtual thumbsticks).
- Save meta-progress in `localStorage`, wrapped in try/catch, game works fine without it.
- Match the repo's existing style: look at `midnight-rental/index.html` for how the previous game structured a big single-file canvas game, CSS tokens, and its generative-soundtrack approach. Reuse patterns, not content.

## Core loop

1. Title screen → pick a character → descend.
2. Each **floor** is a procedurally generated grid of rooms (Isaac-style). Doors lock while enemies are alive.
3. Clear rooms, collect items, find the boss room, beat the boss, take the stairs down.
4. 6 floors + a final floor. Die → run summary screen ("you got as far as…") → unlock stuff → go again.

### Controls
- WASD move, arrow keys (or mouse aim + click) shoot, Space = active item, Q = drop a "candle" (bomb), E = use consumable, Esc = pause.
- Gamepad: left stick move, right stick shoot, triggers for active/bomb.
- Touch: left half = move stick, right half = aim/shoot stick, small buttons for active/bomb.

### Player stats (all modifiable by items)
Hearts (half-heart granularity), damage, tears/fire rate, shot speed, range, move speed, luck. Plus extra heart types:
- **Red hearts** — normal health.
- **Black hearts** — temporary, deal damage to the room when lost.
- **Cracked hearts** — absorb one hit then shatter.
- **Hollow containers** — empty max-HP.

The player shoots **tears**. Lean into it. Different items turn them into ink, blood, ash, broken glass, rose petals, etc.

## Floors (the descent)

Each floor has its own palette, tileset, enemy pool, ambient sound and music layer. Generate tiles procedurally (noise + dithering + a few hand-coded pixel motifs).

| # | Floor | Mood / palette | Notes |
|---|-------|----------------|-------|
| 1 | **The Bedroom** | purple-grey, fairy lights, posters peeling | tutorial-ish, soft enemies |
| 2 | **Rain Street** | wet asphalt, sodium-orange streetlights, reflections | rain overlay, puddles slow you |
| 3 | **The Overgrown Chapel** | moss green, stained glass, candle wax | candles light radius, dark corners |
| 4 | **Static Hospital** | sick teal, flickering fluorescents | lights flicker, enemies hide in darkness |
| 5 | **The Drowned Memory** | deep blue, everything underwater | slower bullets, bubbles, muffled audio (low-pass filter) |
| 6 | **Ashfield** | black and ember red, falling ash | fire hazards |
| 7 | **The Last Room** | monochrome with one color: whatever item you picked up most | final boss |

### Room generation
- Grid map (~9×8), start in centre, grow 8–16 rooms by random walk with "no 2×2 blocks" rule (the Isaac approach).
- Dead ends become special rooms: **Boss** (furthest from start), **Treasure** (item pedestal), **Shop** (a crying shopkeeper who sells for "tears" currency), **Secret room** (hidden, bomb a wall adjacent to 3+ rooms), **Confession booth** (trade hearts for items, the devil-deal analogue), **Music box room** (heal + a short lore line).
- ~40 hand-authored room layouts as compact string templates (`#` rock, `^` spikes, `o` pot, `E` enemy spawn, `~` pit), mirrored/rotated randomly. Seeded RNG (mulberry32) so a run can be replayed from a seed shown on the pause screen.
- Minimap in the corner; rooms reveal as visited. Full map on Tab.

## Enemies (~20 types)

Each enemy is a small state machine (idle → telegraph → attack → recover). Telegraph every attack with a flash or wind-up so deaths feel fair.

Examples:
- **Weeper** — floats toward you, cries a ring of 4 tears when hurt.
- **Moth** — erratic flight, drawn to light sources.
- **Static Kid** — teleports with a TV-snow glitch, fires a 3-shot spread.
- **Wilted** — slow flower creature, leaves a petal trail that hurts.
- **Hollow Mask** — invulnerable from the front, flank it.
- **Lullaby** — music-box doll, fires bullets in a spiral synced to the beat.
- **Echo** — copies your last 2 seconds of movement.
- **Choir** — 3 linked enemies; kill one and the others enrage.
- **Unsent Letter** — paper envelope that splits into smaller letters.
- **Drowned Hand** — erupts from the floor where you stood a second ago.
- Plus floor-specific variants (wet, burning, glitched) recoloured with stat tweaks.

Elite/"heavy-hearted" versions: 1-in-15 chance, darker outline, more HP, drops better loot.

## Bosses (one per floor, + alt bosses for replays)

Every boss gets: a name card intro ("I. THE MOTHER OF MOTHS" in gothic font with a slow ink-bleed reveal), a big HP bar, 2–3 phases, a unique music track, and a death animation that's a little sad, not triumphant.

1. **The Mother of Moths** — circles the room, spawns moths, phase 2 extinguishes the lights.
2. **Gutterlight** — a streetlamp with a face. Sweeping beam of bullets, puddles become hazards.
3. **The Choirmaster** — sings in bullet patterns; patterns are literally driven by the music sequencer notes.
4. **Patient Zero / The Flatline** — an ECG line that moves across the screen as a laser; beat = attack.
5. **The Drowned Bride** — veil of bullets, pulls you toward her with currents.
6. **Ember Saint** — fire columns, the arena shrinks.
7. **Final: YOU** — a mirror of the player with the items you collected this run, wearing a wilted crown. Phase 2: the room cracks and the two of you fall into a white void. Phase 3: it stops attacking and you choose whether to keep shooting. (Two endings.)

Alt bosses unlock after the first win so floors 1–6 each have 2 possible bosses.

Bullet patterns: build a small pattern DSL (`ring(n, speed)`, `spiral(arms, rate)`, `aimed(spread, count)`, `wave(amp, freq)`) so bosses are mostly data.

## Items (60+ to start, designed to stack)

Item = `{ id, name, flavor, pool, quality(0–4), onPickup, stat mods, tearModifiers[], hooks }`. Hooks: `onShoot`, `onHit`, `onKill`, `onRoomClear`, `onHurt`, `onFloorStart`. Tear modifiers compose (homing + splitting + piercing must all work together; that combo chaos is the whole point).

Flavor text is short and emo. Examples:
- **Eyeliner** — "Tears now leave black streaks." (damage up, tears leave a damaging trail)
- **Mixtape (Side B)** — "The songs you skipped." (shots fire in rhythm with the music; on-beat shots deal 2×)
- **Wilted Rose** — "Still beautiful." (petal tears split on hit)
- **Unsent Text** — "Typing…" (homing, but delayed)
- **Broken Locket** — "Half of something." (+1 cracked heart, double damage when at 1 heart)
- **Cigarette Burn** — "It never healed right." (tears ignite enemies)
- **Hoodie** — "Hood up, world off." (+speed, enemies sometimes lose track of you)
- **Polaroid** — "Before." (one-time revive)
- **Black Nail Polish** — "Chipped." (+fire rate)
- **Insomnia** — "3:47 AM." (you get stronger the longer you're in a room)
- **Rain Jacket** — "Not waterproof, just proof." (immune to puddles, +range)
- **Mood Ring** — "Changes." (random stat shuffle each floor)
- **Headphones** — "Turn it up." (music volume ducks other sound; +damage during the chorus)

**Active items** (Space, recharge per room cleared): *Scream* (knockback shockwave), *Lighter* (temporary light + fire ring), *Diary* (random effect from a table), *Hourglass* (slow time), *Matchbook* (3 charges of fire).

**Consumables:** pills ("SSRIs" is too real, call them **Little Candies** with unidentified effects until first use) and **Tarot-style cards** (*The Moon, The Tower, The Hanged Man*…).

**Transformations:** collect 3 items from a set (e.g. Moth set, Choir set, Ink set) → visual transformation of the player + a bonus ability. Very Isaac, very satisfying.

## Characters (unlockable)

- **Wren** (start) — balanced.
- **Ash** — low health, high damage, starts with a lighter.
- **Juniper** — can't hold red hearts, only black ones.
- **The Twins** — control two bodies at once, shared HP.
- **Nobody** — invisible sprite, only shadow and tears visible. Hard mode.

Unlocked by achievements (beat floor 3 without taking damage, etc.).

## Music & sound: the most important part for the vibe

All generative with Web Audio, no samples.

**Engine:** a small sequencer with a lookahead scheduler (`setTimeout` loop scheduling ~100ms ahead on `audioCtx.currentTime`). Exposes the current beat so gameplay can sync to it (items, the Choirmaster, Lullaby enemies).

**Instruments** (each a little synth function):
- Clean "emo guitar": plucked Karplus-Strong string, chorus + reverb, playing twinkly arpeggios in open-tuning voicings (think Midwest emo: maj7, add9, sus2 chords).
- Distorted wall guitar for boss fights: detuned saws → waveshaper → lowpass, power chords.
- Sub bass: sine + slight saturation.
- Drums: synthesized kick (pitch-swept sine), snare (noise + tone), hats (filtered noise). Half-time feels in normal rooms, blast beats on boss phase 3.
- Music box: high sine bells with slight detune, for menus and the Music Box room.
- Pad: slow-attack detuned triangles with long reverb (convolution reverb from generated noise impulse).
- Tape layer: vinyl crackle + slow pitch wobble (LFO on playback detune) + occasional dropout.

**Structure:** each floor has a key and chord progression (e.g. Bedroom: Dmaj7–Bm9–Gmaj7–A6, 82 bpm). Layers fade in/out by state:
- Exploring an empty room → pad + clean guitar only.
- Enemies present → add drums + bass.
- Low health (1 heart) → low-pass sweep closes, heartbeat kick, everything slightly detunes.
- Boss → full band, distorted, its own riff. Phase changes = key change or tempo change.
- Death → everything slows down like a tape stopping (ramp playbackRate/detune down), then silence, then a single music-box melody on the run summary.

**SFX:** tear shot (soft "plip"), enemy hit, enemy death (glassy shatter), heart pickup, item pickup jingle (short arpeggio up in the floor's key, so it's always in tune with the music), door slam, boss roar (detuned noise + formant filter), player hurt (muffled thud + brief screen desaturation).

Master bus: compressor → limiter. Separate music/SFX volume sliders.

## Visual style & juice

- Pixel art drawn procedurally to offscreen canvases at startup (sprite atlas). Characters ~16×16, bosses 48–96px. 3–4 frame walk cycles.
- **Lighting:** dark overlay canvas with radial light "holes" cut out (player, candles, fire, tears that glow). Darkness is a core mechanic on later floors.
- Post-processing on the final canvas: subtle vignette, film grain, chromatic aberration on hit, scanline/VHS wobble when at low health, desaturation that deepens as you lose hearts.
- Screen shake (trauma-based, decays), hit-stop (2–3 frames) on big hits, knockback, damage numbers optional.
- Particles: rain, ash, petals, dust motes in light beams, tear splashes, blood/ink splatter that **stays on the floor** for the room.
- Enemies flash white when hit. Bosses crack visibly as they lose HP.
- Rooms have little environmental details: crumpled notes, a phone with "1 missed call", a cassette, a mirror that reflects you a frame late.

## UI / UX

- Title: rain on a window, candle flicker, game title bleeding in, "press any key". Menu music = music box.
- HUD: hearts top-left, consumables + coins ("tears") below, active item charge bar, minimap top-right, floor name shown on entry ("FLOOR II — RAIN STREET") in gothic font.
- Item pickup: big centered name + flavor text, fades after 2s.
- Pause: items collected this run (hover for descriptions), seed, stats, volume.
- Run summary: floor reached, time, killer ("killed by: The Mother of Moths"), items as a strip of icons, a sad little epitaph generated from the run ("Wren carried a Wilted Rose and an Unsent Text. They made it to the Chapel.").
- **Journal** (meta menu): every item/enemy/boss you've encountered, silhouettes for undiscovered ones. Collect-'em-all drive.
- Accessibility: reduce flashing toggle, screen shake slider, colorblind-safe bullet outlines, rebindable keys.

## Replayability

- Seeded runs plus a **Daily Run** (seed from the date, one try, local best score).
- Unlocks: items get added to pools as you achieve things, so early runs are simpler and the pool grows.
- **Hard mode** ("Heavier") after first win: more champions, fewer hearts.
- Random room events: a door that only opens if you're at full health, a crying statue that gives an item if you don't shoot for 10 seconds, a cursed room.
- Synergies the player discovers, not the game tells them about.

## Code architecture (inside the single file)

Organize as clearly commented sections in this order:
1. Config & constants (tunables in one object so balancing is easy)
2. RNG (mulberry32, seeded)
3. Input (keyboard, mouse, gamepad, touch → unified `input` state)
4. Audio engine (context, buses, synths, sequencer, song data per floor, SFX)
5. Sprite generation (procedural pixel art → atlas)
6. Entity system (simple arrays + pools; `update(dt)`/`draw(ctx)` per type)
7. Bullet pattern DSL
8. Enemies & bosses (data + behaviors)
9. Items, hooks & tear modifiers
10. Floor/room generation
11. Lighting & post-fx
12. UI / HUD / menus / journal
13. Save/meta-progression
14. Main loop & state machine (`title → charSelect → playing → paused → itemPickup → bossIntro → dead → summary → victory`)

Collision: AABB/circle vs tile grid for walls, spatial hash for bullets vs enemies.

## Build order (do it in passes, commit after each)

1. **Skeleton:** canvas, scaling, loop, input, player moves and shoots tears in one room with walls. Commit.
2. **Rooms & floors:** generator, doors, minimap, room transitions (slide camera). 4 basic enemies. Commit.
3. **Audio v1:** sequencer, clean guitar + pad + drums, layer switching by room state, core SFX. Commit.
4. **Items:** item system with hooks, 25 items, treasure rooms, shop, hearts types. Commit.
5. **Bosses:** pattern DSL, first 3 bosses with intros, boss music. Commit.
6. **Floors 4–7:** remaining tilesets, enemies, bosses, final boss + endings. Commit.
7. **Juice pass:** lighting, post-fx, particles, screen shake, hit-stop, low-health effects. Commit.
8. **Meta:** characters, unlocks, journal, daily run, save. Commit.
9. **Content pass:** reach 60+ items, 20 enemies, alt bosses, transformations, room events. Commit.
10. **Polish & balance:** playtest by actually running it (use Playwright + Chromium to load the page, simulate input, screenshot each floor and check the console for errors). Tune difficulty so floor 1 is clearable by a new player and floor 6 is genuinely hard. Commit.

## Definition of done

- Open `sorrowbloom/index.html` directly in a browser, it runs with zero console errors.
- A full run from title to final boss is possible, and dying gives a summary and returns to the title.
- Two consecutive runs look and play noticeably differently.
- The music changes with what's happening and never sounds out of tune with the pickups.
- It feels sad, pretty and a bit cursed. If it doesn't make you want to put on a hoodie, it's not done.
