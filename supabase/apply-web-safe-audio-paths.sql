-- Current browser-safe canonical audio mapping.
-- Verified against the live public `mind-power-audio` bucket on 2026-03-16:
-- Week 1/10 Exercises for the Week.mp3
-- Week 2/07 Exercises for the Week.mp3
-- Week 3/07 Exercises for the Week.mp3
-- Week 4/03 Contacting the Subconscious Mind.mp3
--
-- Run this SQL to sync `program_weeks.audio_path` to the currently uploaded
-- public MP3 object paths.

with program_to_update as (
  select id
  from public.programs
  where title = 'Mind Power'
  limit 1
),
audio_mapping as (
  select 1 as week_number, 'Week 1/10 Exercises for the Week.mp3'::text as audio_path
  union all
  select 2, 'Week 2/07 Exercises for the Week.mp3'
  union all
  select 3, 'Week 3/07 Exercises for the Week.mp3'
  union all
  select 4, 'Week 4/03 Contacting the Subconscious Mind.mp3'
)
update public.program_weeks as program_weeks
set audio_path = audio_mapping.audio_path
from program_to_update
join audio_mapping
  on true
where program_weeks.program_id = program_to_update.id
  and program_weeks.week_number = audio_mapping.week_number;
