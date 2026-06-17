-- =====================================================
-- Supabase SQL Editor で実行してください
-- =====================================================

-- profiles: ユーザーのロール管理
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users PRIMARY KEY,
  role text NOT NULL DEFAULT 'free' CHECK (role IN ('free', 'paid')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ユーザー登録時に自動でprofileを作成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (new.id, 'free')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- daily_usage: 日次利用回数（日本時間の日付で管理）
CREATE TABLE IF NOT EXISTS public.daily_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  usage_date date NOT NULL,
  count integer NOT NULL DEFAULT 0,
  CONSTRAINT unique_user_date UNIQUE (user_id, usage_date)
);

-- RLS（行レベルセキュリティ）
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_usage ENABLE ROW LEVEL SECURITY;

-- profiles: 自分のデータのみ参照可能
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- daily_usage: 自分のデータのみ参照・操作可能
CREATE POLICY "Users can read own usage"
  ON public.daily_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage"
  ON public.daily_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage"
  ON public.daily_usage FOR UPDATE
  USING (auth.uid() = user_id);

-- 利用回数をアトミックにインクリメントする関数
CREATE OR REPLACE FUNCTION public.increment_usage(p_user_id uuid, p_date date)
RETURNS integer AS $$
DECLARE
  new_count integer;
BEGIN
  INSERT INTO public.daily_usage (user_id, usage_date, count)
  VALUES (p_user_id, p_date, 1)
  ON CONFLICT (user_id, usage_date)
  DO UPDATE SET count = public.daily_usage.count + 1
  RETURNING count INTO new_count;
  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
