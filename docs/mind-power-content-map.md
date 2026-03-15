# Mind Power Content Map

The `mind-power-audio` bucket is now public. The app uses exact storage object
paths and builds public URLs from `program_weeks.audio_path` for the canonical
weekly session audio.

## Canonical weekly session audio

Verified from the uploaded bucket object rows on 2026-03-15:

- Week 1 -> `Week 1/10 Exercises for the Week.mp3`
- Week 2 -> `Week 2/07 Exercises for the Week.wma`
- Week 3 -> `Week 3/07 Exercises for the Week.wma`
- Week 4 -> `Week 4/03 Contacting the Subconscious Mind.wma`

Selection rule:

- Prefer `Exercises for the Week`
- If a week does not contain that track, keep the documented fallback

Week 4 note:

- The uploaded Week 4 objects do not contain `Exercises for the Week`
- The canonical fallback remains `Week 4/03 Contacting the Subconscious Mind.wma`

## Full uploaded weekly audio lists

Week 1:
- `Week 1/01 Introduction to Mind Power.mp3`
- `Week 1/02 Conditions for Mind Power.mp3`
- `Week 1/03 The Six Laws Explained.mp3`
- `Week 1/04 All is law.mp3`
- `Week 1/05 The Six Laws.mp3`
- `Week 1/06 The Conscious Mind.mp3`
- `Week 1/07 Negatives.mp3`
- `Week 1/08 Concentration and Contemplation.mp3`
- `Week 1/09 Inner and Outer Worlds.mp3`
- `Week 1/10 Exercises for the Week.mp3`

Week 2:
- `Week 2/01 Know Thyself.wma`
- `Week 2/02 Doing the Exercises.wma`
- `Week 2/03 The Mind as a Garden.wma`
- `Week 2/04 Cultivating the Conscious Mind.wma`
- `Week 2/05 Seeding.wma`
- `Week 2/06 Visualization.wma`
- `Week 2/07 Exercises for the Week.wma`

Week 3:
- `Week 3/01 Understanding the System.wma`
- `Week 3/02 Decision, Action, Persistence.wma`
- `Week 3/03 Thoughts and Health.wma`
- `Week 3/04 Affirmations.wma`
- `Week 3/05 Acknowledging.wma`
- `Week 3/06 Setting up a Creating Period.wma`
- `Week 3/07 Exercises for the Week.wma`

Week 4:
- `Week 4/01 Developing Mind Power Habits (David Ellis's conflicted copy).wma`
- `Week 4/01 Developing Mind Power Habits.wma`
- `Week 4/02 Goals.wma`
- `Week 4/03 Contacting the Subconscious Mind.wma`
- `Week 4/04 The Six Laws Expanded.wma`
- `Week 4/05 Self Image.wma`
- `Week 4/06 You are Unique.wma`

## Source files used for canonical mapping

- Week 1: `C:\Users\Admin\Downloads\MP_extracted\MP\Mind Power Course Week 1\10 Exercises for the Week.wma`
- Week 2: `C:\Users\Admin\Downloads\MP_extracted\MP\Mind Power Course Week 2\07 Exercises for the Week.wma`
- Week 3: `C:\Users\Admin\Downloads\MP_extracted\MP\Mind Power Course Week 3\07 Exercises for the Week.wma`
- Week 4 fallback: `C:\Users\Admin\Downloads\MP_extracted\MP\Mind Power Course Week 4\03 Contacting the Subconscious Mind.wma`

## Format compatibility

Week 1 is now uploaded as `.mp3`, which is broadly browser-friendly.

Weeks 2-4 are still `.wma`. The app still attempts browser playback, but
browser support is not universal for those files. If playback fails, the UI
keeps the page stable and offers direct open/download actions for the file.

## Content update SQL

To sync `program_weeks.audio_path` and `exercise_text` to the verified canonical
weekly mapping, run:

- `supabase/apply-real-course-content.sql`

## Day-to-week mapping

- Days 1-7 -> Week 1
- Days 8-14 -> Week 2
- Days 15-21 -> Week 3
- Days 22-28 -> Week 4

This matches the helper logic in `lib/program.ts`.
