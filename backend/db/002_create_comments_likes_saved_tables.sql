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

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read comments" ON public.comments;
CREATE POLICY "Anyone can read comments" ON public.comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.comments;
CREATE POLICY "Authenticated users can insert comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;
CREATE POLICY "Users can delete their own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can read likes" ON public.likes;
CREATE POLICY "Anyone can read likes" ON public.likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can insert likes" ON public.likes;
CREATE POLICY "Authenticated users can insert likes" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own likes" ON public.likes;
CREATE POLICY "Users can delete their own likes" ON public.likes FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can read saved notes" ON public.saved_notes;
CREATE POLICY "Anyone can read saved notes" ON public.saved_notes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can save notes" ON public.saved_notes;
CREATE POLICY "Authenticated users can save notes" ON public.saved_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can unsave their own notes" ON public.saved_notes;
CREATE POLICY "Users can unsave their own notes" ON public.saved_notes FOR DELETE USING (auth.uid() = user_id);

COMMIT;
