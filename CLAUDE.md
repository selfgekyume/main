# Games

Each folder is a standalone browser game published with GitHub Pages and played on a phone from the home screen.

## sorrowbloom/

- `index.html` is the whole game. `sw.js` makes it work offline; `manifest.webmanifest` and the icons make it installable.
- `guide.html` is the player guide (opened from GUIDE on the title and pause menus, cached offline by `sw.js`). Its item,
  character and enemy lists are written out by hand, so when you add or change items, characters, enemies, bosses, rooms,
  modes or unlocks, update the guide to match.
- After any change to the game, run `sh sorrowbloom/bump-version.sh`. It writes one build stamp into `index.html`,
  `sw.js` and `version.json`. Installed copies compare that stamp to decide when to update, so skipping it means
  phones keep the old version.
- Couch co-op: `G.players` holds everyone in the run (player 1 first) and `G.player` is whoever the running code is about,
  swapped with `withP(p,fn)`: each player while they update, a tear's owner (`t.p`), an enemy's target (`targetOf`). So code
  written against `G.player` mostly just works; anything that should touch every player (hazards, healing, positions) loops
  `G.players`/`livePlayers()`. Up to five players (`MAXP`): player 1 on touch, keyboard or a controller; players 2-5 each on
  their own controller (`Input.coPads[k]`, read into `Input.co[k]`, colors in `PCOL`). They join with START on the character
  select screen and are saved as `co` in the run save (the first co-op build saved one as `coop`/`p2`; `restoreRun` still reads
  that). Chrome shows at most 4 controllers. Solo runs have one player, so keep them unchanged.
- Run codes (`ABCD-EFGH`) replay a run because every seeded system derives from `run.seedStr`. Key any new
  seeded randomness off it too; cosmetic randomness uses `FX`.
- The current floor's look, enemies and boss come from `G.floorDef` (floor II is sometimes `MALL`), so use it
  instead of `FLOORS[depth-1]` for anything about the floor you're on.
- An in-progress run is saved separately under `sorrowbloom.run.v1` (see `snapshotRun`/`restoreRun`); new run
  or room state that should survive the app closing needs adding there.
- Saves live in the browser's `localStorage` under `sorrowbloom.v1`. Keep the save format backward compatible so
  updates never wipe progress.
- Music uses real recordings: `audio/*.mp3` (CC0 guitar, bass and drums, see `audio/README.md`) are decoded at startup
  by `AU.preload` and played by `gtrRec`/`bassRec`/`drumRec`. The guitar runs through the amp in `AU.gtrChain`. Until the
  recordings are decoded (or if they fail), the synth versions play instead (`ksBuf` strings, `drumKit` samples). The
  audio files have their own service-worker cache, so if you change one bump its number in `AUDIO_V` in both `index.html`
  and `sw.js`. The amp's knobs are `AU.AMP` (gain, bass, mid, treble, presence, 0-10).
- Songs are written by hand in `SONGS`, one per floor (`FLOORS[i].song.tune`), plus `mall` and `title`, in a tracker
  notation explained above it (one token per 16th note). Every song needs the sections the music modes ask for: explore,
  verseA, verseB, chorus, blast, breakdown, bdHeavy, intro, end, and for bosses bossBlast and bossHalf (`BOSS1`/`2`/`3`).
  Riff sections play a drum fill in their last bar every other time round (`FILLS`, or a section's own `fill`).
- Calm rooms (title, explore) have three arrangements per song: `explore` (classic), `exploreB` (twinkle, built by
  `twinkle()`) and `exploreC` (dreamy, built by `dreamy()`). Each floor picks one with `song.calm` in `FLOORS`, treasure
  and secret rooms switch to another (`Music.setRoomCalm`), and Settings > Audio > Calm music (`opts.calm2`) can force one.
- Sound effects are synthesized recipes in `SFX`, played with `AU.play(name,{x})`, where `x` pans the sound to where it
  happened and `AU.gaps` limits how often a sound repeats. `AU.play` swallows errors, so test a new recipe by calling
  `SFX[name](AU,t,o)` directly. Keep steady noise (hiss, hum) out of the mix: players hear it.
