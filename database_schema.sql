-- Create usuarios table (references auth.users)
CREATE TABLE usuarios (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    telefono TEXT,
    rol TEXT NOT NULL DEFAULT 'seller' CHECK (rol IN ('provider', 'admin', 'seller')),
    balance DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create billeteras table
CREATE TABLE billeteras (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    saldo DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categorias table
CREATE TABLE categorias (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    imagen_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create productos table
CREATE TABLE productos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    informacion TEXT,
    condiciones TEXT,
    precio_publico DECIMAL(10,2) NOT NULL,
    precio_vendedor DECIMAL(10,2) NOT NULL DEFAULT 0,
    precio_renovacion DECIMAL(10,2),
    stock INTEGER NOT NULL DEFAULT 0,
    categoria_id UUID NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
    proveedor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    imagen_url TEXT,
    stock_de_productos JSONB DEFAULT '[]'::jsonb,
    tiempo_uso INTEGER NOT NULL DEFAULT 0,
    a_pedido BOOLEAN NOT NULL DEFAULT false,
    nuevo BOOLEAN NOT NULL DEFAULT false,
    destacado BOOLEAN NOT NULL DEFAULT false,
    mas_vendido BOOLEAN NOT NULL DEFAULT false,
    descripcion_completa TEXT,
    disponibilidad TEXT NOT NULL DEFAULT 'en_stock' CHECK (disponibilidad IN ('en_stock', 'a_pedido', 'activacion')),
    renovable BOOLEAN NOT NULL DEFAULT false,
    solicitud TEXT,
    muestra_disponibilidad_stock BOOLEAN NOT NULL DEFAULT false,
    deshabilitar_boton_comprar BOOLEAN NOT NULL DEFAULT false,
    url_cuenta TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stock_productos table (cuentas/credenciales de productos)
CREATE TABLE stock_productos (
    id SERIAL PRIMARY KEY,
    email TEXT,
    clave TEXT,
    pin TEXT,
    perfil TEXT,
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('cuenta', 'perfiles', 'combo')),
    url TEXT,
    estado TEXT NOT NULL DEFAULT 'disponible' CHECK (estado IN ('disponible', 'vendido')),
    publicado BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create compras table
CREATE TABLE compras (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    proveedor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    stock_producto_id INTEGER REFERENCES stock_productos(id) ON DELETE SET NULL,
    email_cuenta TEXT NOT NULL,
    clave_cuenta TEXT NOT NULL,
    pin_cuenta TEXT,
    perfil_usuario TEXT,
    nombre_cliente TEXT NOT NULL,
    telefono_cliente TEXT NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    estado TEXT NOT NULL DEFAULT 'pendiente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recargas table
CREATE TABLE recargas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    monto DECIMAL(10,2) NOT NULL,
    metodo_pago TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'pendiente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_billeteras_usuario_id ON billeteras(usuario_id);
CREATE INDEX idx_productos_categoria_id ON productos(categoria_id);
CREATE INDEX idx_productos_proveedor_id ON productos(proveedor_id);
CREATE INDEX idx_stock_productos_producto_id ON stock_productos(producto_id);
CREATE INDEX idx_stock_productos_estado ON stock_productos(estado);
CREATE INDEX idx_stock_productos_tipo ON stock_productos(tipo);
CREATE INDEX idx_compras_proveedor_id ON compras(proveedor_id);
CREATE INDEX idx_compras_producto_id ON compras(producto_id);
CREATE INDEX idx_compras_stock_producto_id ON compras(stock_producto_id);
CREATE INDEX idx_compras_estado ON compras(estado);
CREATE INDEX idx_recargas_usuario_id ON recargas(usuario_id);
CREATE INDEX idx_recargas_estado ON recargas(estado);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_billeteras_updated_at BEFORE UPDATE ON billeteras FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON categorias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON productos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stock_productos_updated_at BEFORE UPDATE ON stock_productos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_compras_updated_at BEFORE UPDATE ON compras FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recargas_updated_at BEFORE UPDATE ON recargas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE billeteras ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE recargas ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for usuarios
CREATE POLICY "Users can view their own profile" ON usuarios
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON usuarios
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON usuarios
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- Create RLS policies for billeteras
CREATE POLICY "Users can view their own wallet" ON billeteras
    FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Users can update their own wallet" ON billeteras
    FOR UPDATE USING (usuario_id = auth.uid());

-- Create RLS policies for categorias (public read access)
CREATE POLICY "Anyone can view categories" ON categorias
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage categories" ON categorias
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- Create RLS policies for productos
CREATE POLICY "Anyone can view products" ON productos
    FOR SELECT USING (true);

CREATE POLICY "Providers can manage their own products" ON productos
    FOR ALL USING (
        proveedor_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND rol = 'provider'
        )
    );

-- Create RLS policies for stock_productos
CREATE POLICY "Providers can view their own product stock" ON stock_productos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM productos 
            WHERE productos.id = stock_productos.producto_id 
            AND productos.proveedor_id = auth.uid()
        )
    );

CREATE POLICY "Providers can manage their own product stock" ON stock_productos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM productos 
            WHERE productos.id = stock_productos.producto_id 
            AND productos.proveedor_id = auth.uid()
            AND EXISTS (
                SELECT 1 FROM usuarios 
                WHERE id = auth.uid() AND rol = 'provider'
            )
        )
    );

-- Create RLS policies for compras
CREATE POLICY "Users can view their own purchases" ON compras
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND rol = 'seller'
        )
    );

CREATE POLICY "Providers can view purchases of their products" ON compras
    FOR SELECT USING (
        proveedor_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND rol = 'provider'
        )
    );

CREATE POLICY "Sellers can create purchases" ON compras
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND rol = 'seller'
        )
    );

-- Create RLS policies for recargas
CREATE POLICY "Users can view their own recharges" ON recargas
    FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Users can create their own recharges" ON recargas
    FOR INSERT WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Admins can view all recharges" ON recargas
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND rol = 'admin'
        )
    ); 