-- =============================================================================
-- Add redirect_landing_url to configuracion table
-- =============================================================================
ALTER TABLE public.configuracion
ADD COLUMN redirect_landing_url text NULL;

-- =============================================================================
-- Update RLS policy to allow redirect_landing_url field
-- =============================================================================