-- Documentación: la racha diaria vive en progress.data (jsonb), no requiere columnas nuevas.
-- Campos esperados en data.streakState:
--   days: text[] (YYYY-MM-DD America/Bogota)
--   current, longest: int
--   freezesAvailable: int
--   freezeUsedWeek: text | null
--   today: { date, readingMs, answeringMs, questionsAnswered, readingDone, answeringDone, completed, celebrated? }
-- data.presentedExam: boolean (onboarding)
-- No aplica DDL; el cliente ya sincroniza el documento completo.
select 1;
