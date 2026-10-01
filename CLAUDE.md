# Games

Each folder is a standalone browser game published with GitHub Pages and played on a phone from the home screen.

## sorrowbloom/

- `index.html` is the whole game. `sw.js` makes it work offline; `manifest.webmanifest` and the icons make it installable.
- After any change to the game, run `sh sorrowbloom/bump-version.sh`. It writes one build stamp into `index.html`,
  `sw.js` and `version.json`. Installed copies compare that stamp to decide when to update, so skipping it means
  phones keep the old version.
- Run codes (`ABCD-EFGH`) replay a run because every seeded system derives from `run.seedStr`. Key any new
  seeded randomness off it too; cosmetic randomness uses `FX`.
- Saves live in the browser's `localStorage` under `sorrowbloom.v1`. Keep the save format backward compatible so
  updates never wipe progress.
