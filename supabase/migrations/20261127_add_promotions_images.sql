-- =============================================================================
-- Add promotions_images to configuracion table
-- =============================================================================
ALTER TABLE public.configuracion
ADD COLUMN promotions_images jsonb NULL;
