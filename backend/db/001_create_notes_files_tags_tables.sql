BEGIN;

-- Assumes a public.users table with a UUID primary key.
-- If your users table uses a different key type, adjust notes.user_id accordingly.

CREATE TABLE IF NOT EXISTS public.notes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  course TEXT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_notes_user
    FOREIGN KEY (user_id)
    REFERENCES public.users (id)
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS public.files (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  note_id BIGINT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  CONSTRAINT chk_files_size_nonnegative CHECK (file_size IS NULL OR file_size >= 0),
  CONSTRAINT fk_files_note
    FOREIGN KEY (note_id)
    REFERENCES public.notes (id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.tags (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public.note_tags (
  note_id BIGINT NOT NULL,
  tag_id BIGINT NOT NULL,
  PRIMARY KEY (note_id, tag_id),
  CONSTRAINT fk_note_tags_note
    FOREIGN KEY (note_id)
    REFERENCES public.notes (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_note_tags_tag
    FOREIGN KEY (tag_id)
    REFERENCES public.tags (id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes (user_id);
CREATE INDEX IF NOT EXISTS idx_notes_course ON public.notes (course);
CREATE INDEX IF NOT EXISTS idx_notes_is_public ON public.notes (is_public);
CREATE INDEX IF NOT EXISTS idx_files_note_id ON public.files (note_id);
CREATE INDEX IF NOT EXISTS idx_note_tags_tag_id ON public.note_tags (tag_id);

COMMIT;
