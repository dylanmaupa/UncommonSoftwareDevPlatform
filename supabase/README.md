# Supabase SQL Source of Truth

This folder is the canonical history for rebuilding the Supabase database used by this project.

If the database is ever lost, recreate it by running these SQL files in order from the Supabase SQL Editor.

## Run Order

1. `01_trigger_user_profile.sql`
2. `02_add_instructor_specialization.sql`
3. `03_courses_schema_and_seed.sql`
4. `04_more_python_content.sql`
5. `05_update_python_exercises.sql`
6. `06_comprehensive_python_course.sql`
7. `07_gamified_streaks.sql`
8. `08_user_xp.sql`
9. `09_user_achievements.sql`
10. `10_add_gender_avatars.sql`
11. `11_instructor_exercises.sql`
12. `12_fix_streaks_logic.sql`
13. `13_instructor_grading.sql`

## Notes

- `13_instructor_grading.sql` adds the `grade` and `feedback` columns and expands the allowed instructor review statuses.
- Run files in numeric order because later files may depend on earlier schema changes.
- Prefer `IF NOT EXISTS`, `DROP ... IF EXISTS`, and additive migrations so rerunning is safer.

## Rule For Future Database Changes

Every future schema change, policy change, seed update, or data migration must be added as a new numbered `.sql` file in this folder.

Use this naming pattern:

- `14_short_description.sql`
- `15_another_change.sql`

Do not keep database-only changes only in Supabase Dashboard history. If it changes the live database, commit the SQL file here too.
