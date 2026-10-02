# Recorded instruments

The game's guitar, bass and drums are short recordings packed into three files. Each file starts with a timing
click at 0.05 s, then the samples back to back; `SMP_T` in `index.html` says where each one starts.

| File | Source | What's in it |
| --- | --- | --- |
| `gtr.mp3` | [Emilyguitar](https://github.com/sfzinstruments/karoryfer.emilyguitar) | Epiphone Emily the Strange, recorded direct. Single notes every 3 semitones from C#2, two takes each, picked hard (for the amp) and softer (for clean parts). |
| `gtrx.mp3` | [Emilyguitar](https://github.com/sfzinstruments/karoryfer.emilyguitar) | The player's hand muting the strings (release samples), at their natural level, for when a part stops dead. |
| `drumx.mp3` | [Big Rusty Drums](https://github.com/sfzinstruments/karoryfer.big-rusty-drums) | A soft kit for the calm rooms: cross-stick, a gentle kick, soft hi-hat and soft ride, played softly and kept at their natural level. |
| `bass.mp3` | [Growlybass](https://github.com/sfzinstruments/karoryfer.growlybass) | Squier Jazz Bass, recorded direct. Notes every 3 semitones from C#1, two takes each. |
| `drums.mp3` | [Big Rusty Drums](https://github.com/sfzinstruments/karoryfer.big-rusty-drums) | 24" kick, 14" snare (rimshots and center hits), 14" hi-hats, 17" crash, 18" china, three toms, 22" ride and its bell. Close and overhead mics mixed. |

All three libraries are by Karoryfer Lecolds and released under CC0 1.0 (public domain). Thank you!

The files are built by trimming each sample to its attack, fading the tail and normalizing it, then encoding the
sprite as mono 44.1 kHz MP3 (112 kbps for guitar and bass, 128 kbps for drums). If you change one, bump its number in
`AUDIO_V` in both `index.html` and `sw.js` so installed copies download the new one.
