BEGIN;

CREATE TABLE IF NOT EXISTS public.comments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  note_id BIGINT NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_comments_note FOREIGN KEY (note_id) REFERENCES public.notes (id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.likes (
  user_id UUID NOT NULL,
  note_id BIGINT NOT NULL,
  PRIMARY KEY (user_id, note_id),
  CONSTRAINT fk_likes_user FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE,
  CONSTRAINT fk_likes_note FOREIGN KEY (note_id) REFERENCES public.notes (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.saved_notes (
  user_id UUID NOT NULL,
  note_id BIGINT NOT NULL,
  PRIMARY KEY (user_id, note_id),
  CONSTRAINT fk_saved_user FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE,
  CONSTRAINT fk_saved_note FOREIGN KEY (note_id) REFERENCES public.notes (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_comments_note_id ON public.comments (note_id);
CREATE INDEX IF NOT EXISTS idx_likes_note_id ON public.likes (note_id);
CREATE INDEX IF NOT EXISTS idx_saved_notes_user_id ON public.saved_notes (user_id);

COMMIT;
