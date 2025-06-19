-- Seed data for the database
-- Using user ID: e5b63d58-eab6-4628-a427-d86ee703d304

-- Insert user data
INSERT INTO usuarios (id, email, nombre, apellido, telefono, rol, balance) VALUES
('e5b63d58-eab6-4628-a427-d86ee703d304', 'admin@streaming.com', 'Admin', 'Principal', '+1234567890', 'admin', 10000.00);

-- Insert wallet for the admin user
INSERT INTO billeteras (usuario_id, saldo) VALUES
('e5b63d58-eab6-4628-a427-d86ee703d304', 10000.00);

-- Insert categories
INSERT INTO categorias (nombre, descripcion, imagen_url) VALUES
('Netflix', 'Plataforma de streaming con series y películas', 'https://example.com/netflix.png'),
('Disney+', 'Contenido de Disney, Marvel, Star Wars y National Geographic', 'https://example.com/disney.png'),
('HBO Max', 'Series y películas premium de Warner Bros', 'https://example.com/hbo.png'),
('Amazon Prime', 'Streaming, música y beneficios de Amazon', 'https://example.com/prime.png'),
('Apple TV+', 'Contenido original de Apple', 'https://example.com/appletv.png'),
('Paramount+', 'Contenido de CBS, MTV, Nickelodeon y más', 'https://example.com/paramount.png'),
('Hulu', 'Series de TV y películas', 'https://example.com/hulu.png'),
('Crunchyroll', 'Anime y contenido asiático', 'https://example.com/crunchyroll.png');

-- Insert sample products (assuming the admin is also a provider for demo purposes)
INSERT INTO productos (nombre, descripcion, informacion, condiciones, precio, stock, categoria_id, proveedor_id, imagen_url) VALUES
('Netflix Premium 4K', 'Cuenta Netflix Premium con 4 pantallas y calidad 4K', 'Incluye acceso a todo el catálogo de Netflix en máxima calidad', 'No compartir la cuenta con más de 4 personas', 15.99, 50, 
 (SELECT id FROM categorias WHERE nombre = 'Netflix'), 'e5b63d58-eab6-4628-a427-d86ee703d304', 'https://example.com/netflix-premium.png'),

('Disney+ Standard', 'Cuenta Disney+ con acceso a todo el contenido', 'Marvel, Star Wars, Disney Classics, National Geographic', 'Uso personal, no compartir', 7.99, 30,
 (SELECT id FROM categorias WHERE nombre = 'Disney+'), 'e5b63d58-eab6-4628-a427-d86ee703d304', 'https://example.com/disney-standard.png'),

('HBO Max Ad-Free', 'HBO Max sin anuncios con contenido premium', 'Game of Thrones, Succession, The Last of Us y más', 'Cuenta individual, no transferible', 14.99, 25,
 (SELECT id FROM categorias WHERE nombre = 'HBO Max'), 'e5b63d58-eab6-4628-a427-d86ee703d304', 'https://example.com/hbo-max.png'),

('Amazon Prime Video', 'Acceso a Prime Video con envíos gratis', 'The Boys, The Marvelous Mrs. Maisel, contenido exclusivo', 'Incluye beneficios de Amazon Prime', 12.99, 40,
 (SELECT id FROM categorias WHERE nombre = 'Amazon Prime'), 'e5b63d58-eab6-4628-a427-d86ee703d304', 'https://example.com/prime-video.png'),

('Apple TV+', 'Contenido original de Apple', 'Ted Lasso, The Morning Show, Foundation', 'Calidad 4K HDR, sin anuncios', 4.99, 20,
 (SELECT id FROM categorias WHERE nombre = 'Apple TV+'), 'e5b63d58-eab6-4628-a427-d86ee703d304', 'https://example.com/apple-tv.png'),

('Paramount+ Premium', 'Paramount+ sin anuncios con Showtime', 'Star Trek, Yellowstone, contenido de CBS', 'Incluye Showtime, sin anuncios', 11.99, 35,
 (SELECT id FROM categorias WHERE nombre = 'Paramount+'), 'e5b63d58-eab6-4628-a427-d86ee703d304', 'https://example.com/paramount-premium.png'),

('Hulu No Ads', 'Hulu sin anuncios con contenido exclusivo', 'The Handmaid''s Tale, Only Murders in the Building', 'Sin anuncios, contenido exclusivo', 12.99, 30,
 (SELECT id FROM categorias WHERE nombre = 'Hulu'), 'e5b63d58-eab6-4628-a427-d86ee703d304', 'https://example.com/hulu-noads.png'),

('Crunchyroll Mega Fan', 'Crunchyroll con simulcast y sin anuncios', 'Anime subtitulado y doblado, simulcast', 'Sin anuncios, simulcast, manga digital', 9.99, 45,
 (SELECT id FROM categorias WHERE nombre = 'Crunchyroll'), 'e5b63d58-eab6-4628-a427-d86ee703d304', 'https://example.com/crunchyroll-mega.png');

-- Insert sample purchases (for demonstration)
INSERT INTO compras (proveedor_id, producto_id, email_cuenta, clave_cuenta, pin_cuenta, perfil_usuario, nombre_cliente, telefono_cliente, precio, estado) VALUES
('e5b63d58-eab6-4628-a427-d86ee703d304', 
 (SELECT id FROM productos WHERE nombre = 'Netflix Premium 4K' LIMIT 1),
 'cliente1@example.com', 'password123', '1234', 'Cliente Principal', 'Juan Pérez', '+1234567891', 15.99, 'completado'),

('e5b63d58-eab6-4628-a427-d86ee703d304',
 (SELECT id FROM productos WHERE nombre = 'Disney+ Standard' LIMIT 1),
 'cliente2@example.com', 'password456', '5678', 'Usuario Principal', 'María García', '+1234567892', 7.99, 'pendiente'),

('e5b63d58-eab6-4628-a427-d86ee703d304',
 (SELECT id FROM productos WHERE nombre = 'HBO Max Ad-Free' LIMIT 1),
 'cliente3@example.com', 'password789', '9012', 'Perfil 1', 'Carlos López', '+1234567893', 14.99, 'en_proceso');

-- Insert sample recharges
INSERT INTO recargas (usuario_id, monto, metodo_pago, estado) VALUES
('e5b63d58-eab6-4628-a427-d86ee703d304', 100.00, 'tarjeta_credito', 'completado'),
('e5b63d58-eab6-4628-a427-d86ee703d304', 50.00, 'paypal', 'completado'),
('e5b63d58-eab6-4628-a427-d86ee703d304', 200.00, 'transferencia_bancaria', 'pendiente');

-- Insert additional sample users (you can create these in Supabase Auth first)
-- Note: Replace these UUIDs with actual user IDs from Supabase Auth
-- INSERT INTO usuarios (id, email, nombre, apellido, telefono, rol, balance) VALUES
-- ('uuid-provider-1', 'provider1@example.com', 'Proveedor', 'Uno', '+1234567894', 'provider', 5000.00),
-- ('uuid-seller-1', 'seller1@example.com', 'Vendedor', 'Uno', '+1234567895', 'seller', 1000.00);

-- Insert wallets for additional users (uncomment when you have more users)
-- INSERT INTO billeteras (usuario_id, saldo) VALUES
-- ('uuid-provider-1', 5000.00),
-- ('uuid-seller-1', 1000.00); 