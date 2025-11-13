-- Create venues table
CREATE TABLE IF NOT EXISTS public.venues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_zh TEXT,
    description_en TEXT,
    description_zh TEXT,
    country TEXT NOT NULL,
    city TEXT NOT NULL,
    location TEXT,
    picture_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Venues are viewable by everyone" ON venues
    FOR SELECT USING (true);

CREATE POLICY "Only admins can insert venues" ON venues
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can update venues" ON venues
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can delete venues" ON venues
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Add comments for documentation
COMMENT ON TABLE public.venues IS 'Venues showcasing MoMing Kombucha brand presence';
COMMENT ON COLUMN public.venues.name_en IS 'Venue name in English';
COMMENT ON COLUMN public.venues.name_zh IS 'Venue name in Chinese';
COMMENT ON COLUMN public.venues.description_en IS 'Venue description in English';
COMMENT ON COLUMN public.venues.description_zh IS 'Venue description in Chinese';
COMMENT ON COLUMN public.venues.country IS 'Country where the venue is located';
COMMENT ON COLUMN public.venues.city IS 'City where the venue is located';
COMMENT ON COLUMN public.venues.location IS 'Specific location/address of the venue';
COMMENT ON COLUMN public.venues.picture_url IS 'URL to venue picture';
COMMENT ON COLUMN public.venues.active IS 'Whether the venue is currently active/displayed';