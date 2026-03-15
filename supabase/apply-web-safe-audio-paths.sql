-- Recommended browser-safe audio mapping.
-- Upload these existing MP3 files into the private `mind-power-audio` bucket:
-- week-1/mind-power-week-1.mp3
-- week-2/mind-power-week-2.mp3
-- week-3/mind-power-week-3.mp3
-- week-4/mind-power-week-4.mp3
--
-- Local source files already present on this machine:
-- C:\Users\Admin\Downloads\MindPower_storage_ready\week-1\mind-power-week-1.mp3
-- C:\Users\Admin\Downloads\MindPower_storage_ready\week-2\mind-power-week-2.mp3
-- C:\Users\Admin\Downloads\MindPower_storage_ready\week-3\mind-power-week-3.mp3
-- C:\Users\Admin\Downloads\MindPower_storage_ready\week-4\mind-power-week-4.mp3
--
-- Run this SQL after those MP3 objects have been uploaded.

with program_to_update as (
  select id
  from public.programs
  where title = 'Mind Power'
  limit 1
),
audio_mapping as (
  select 1 as week_number, 'week-1/mind-power-week-1.mp3'::text as audio_path
  union all
  select 2, 'week-2/mind-power-week-2.mp3'
  union all
  select 3, 'week-3/mind-power-week-3.mp3'
  union all
  select 4, 'week-4/mind-power-week-4.mp3'
)
update public.program_weeks as program_weeks
set audio_path = audio_mapping.audio_path
from program_to_update
join audio_mapping
  on true
where program_weeks.program_id = program_to_update.id
  and program_weeks.week_number = audio_mapping.week_number;
