-- Run this against the existing `mind-power-audio` bucket content.
-- The bucket now uses public object URLs in the app, and `audio_path` stores the
-- canonical weekly session audio for each week.
-- Verified storage object paths from the live public bucket on 2026-03-16:
-- Week 1/10 Exercises for the Week.mp3
-- Week 2/07 Exercises for the Week.mp3
-- Week 3/07 Exercises for the Week.mp3
-- Week 4/03 Contacting the Subconscious Mind.mp3
--
-- Note on Week 4:
-- The uploaded Week 4 storage objects do not include a file named
-- "Exercises for the Week", so the current mapping preserves the documented
-- fallback to `Week 4/03 Contacting the Subconscious Mind.mp3`.

with program_to_update as (
  select id
  from public.programs
  where title = 'Mind Power'
  limit 1
),
course_content as (
  select
    1 as week_number,
    'Week 1'::text as title,
    'Week 1/10 Exercises for the Week.mp3'::text as audio_path,
    $$1. Write down the six laws on a piece of paper. Spend 5 minutes contemplating these six laws every day.

2. Take one law each day. Start with the first law on the first day, second law on the next day, and so forth. Contemplate that one law for 5 minutes.

3. Contemplate the following statement for 5 minutes each day: "I am in possession of an amazing instrument of power that is transforming my life, now that I'm learning to use it."

4. Contemplate the following statement for 5 minutes each day: "My personal vibration determines the circumstances and situations that happen to me. My thoughts and my beliefs create my personal vibration."

5. Self-observation: Several times every day, right in the midst of doing something, stop and catch yourself thinking. Observe your mind in action.

6. Weeding of negatives: Begin to weed out negatives by experimenting with the 4 techniques. There is no time limit with this exercise.

7. Go over your notes for 5 to 10 minutes every day.$$::text as exercise_text

  union all

  select
    2,
    'Week 2',
    'Week 2/07 Exercises for the Week.mp3',
    $$1. Pick a quality or characteristic that you wish to possess. Spend 5 minutes every day visualising yourself possessing that quality.

2. For 5 minutes every day, seed what it would feel like to have that quality, as in exercise 1.

3. Visualise yourself doing your Mind Power exercises and being proficient at them for 5 minutes every day.

4. Contemplation exercise: rewrite the six laws into the personal. For example, "thoughts are real forces" becomes "my thoughts are real forces". Spend 5 minutes every day contemplating the six laws.

5. Contemplate the following statements for several minutes every day:
- My power to think thoughts is my power to create in my life.
- I have the power to think whatever thoughts I choose.

6. Self-observation exercise: ask yourself several times during the course of the day:
- How am I feeling?
- What am I thinking?

7. Weed out negatives by using the techniques from Lecture 1.

8. Go over your notes for 5 minutes every day.$$::text

  union all

  select
    3,
    'Week 3',
    'Week 3/07 Exercises for the Week.mp3',
    $$1. Pick a quality that you wish you had. For 5 minutes every day, seed and visualise that you have that quality, that you are that person. Combine seeding and visualisation as one technique.

2. Spend 5 minutes each day affirming to yourself that you are that person.

3. Project of your choice: pick something that you want to see happen to you this week. Spend 10 minutes every day using visualisation, seeding and affirmations to create it.

4. Acknowledging exercise: make an acknowledging list of at least 15 or 20 things that presently make you feel good about yourself and that make you feel you are a success. Spend 5 minutes contemplating this list.

5. For 5 minutes every day, visualise that your life is going well and is working in every aspect.

6. For 5 minutes every day, go over your notes, starting from the beginning of this course.

7. Drink 2 to 3 litres of water every day.$$::text

  union all

  select
    4,
    'Week 4',
    'Week 4/03 Contacting the Subconscious Mind.mp3',
    $$1. For 5 minutes every day repeat the following affirmation: "I always remember my dreams". Write your dreams down in a special Dream Journal.

2. Each day, for 10 minutes, use the three steps to reach the subconscious.

3. Contemplation: choose a phrase or law to contemplate for 5 minutes each day.

4. Self-image: for 5 minutes each day, re-create an aspect of your self-image using seeding, visualisation and affirmation.

5. Project of the week: spend 10 minutes every day visualising and seeding whatever goal you wish.$$::text
)
insert into public.program_weeks (
  program_id,
  week_number,
  title,
  audio_path,
  exercise_text
)
select
  program_to_update.id,
  course_content.week_number,
  course_content.title,
  course_content.audio_path,
  course_content.exercise_text
from program_to_update
cross join course_content
on conflict (program_id, week_number) do update
set
  title = excluded.title,
  audio_path = excluded.audio_path,
  exercise_text = excluded.exercise_text;
