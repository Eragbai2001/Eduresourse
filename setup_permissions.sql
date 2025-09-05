-- Enable RLS on the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to select their own profile
CREATE POLICY select_own_profile ON public.profiles 
    FOR SELECT 
    TO authenticated 
    USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own profile
CREATE POLICY insert_own_profile ON public.profiles 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own profile
CREATE POLICY update_own_profile ON public.profiles 
    FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = user_id);

-- Grant necessary permissions to the authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
