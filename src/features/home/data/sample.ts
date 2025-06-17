import { Service } from "./types"


export const categorias: Service[] = [
  { name: 'Max', subtitle: 'Max', icon: 'https://img.icons8.com/?size=400&id=9tVdlpWe1F9k&format=png&color=000000', tab: 'max' },
  { name: 'Netflix', subtitle: 'Netflix', icon: 'https://img.icons8.com/?size=400&id=20519&format=png&color=000000', tab: 'netflix' },
  { name: 'Disney+', subtitle: 'Disney+', icon: 'https://img.icons8.com/?size=400&id=rrtOAHJcHL38&format=png&color=000000', tab: 'disney' },
  { name: 'Prime Video', subtitle: 'Prime Video', icon: 'https://img.icons8.com/?size=400&id=Rs68BrhxH0XZ&format=png&color=000000', tab: 'prime_video' },
  { name: 'Chat GPT', subtitle: 'Chat GPT', icon: 'https://img.icons8.com/?size=400&id=FBO05Dys9QCg&format=png&color=000000', tab: 'chatgpt' },

]



export const productos = [
  {
    titulo: "CHATGPT PLUS X3 MESES",
    subtitulo: "ARTHURPLAY STREAMING",
    nuevo: true,
    aPedido: true,
    stock: 4,
    precioSoles: 75.04,
    precioUSD: 20.28,
    proveedor: "ARTHURPL",
    categoria: "chatgpt",
    precioRenovable: 20.29,
    imagen: "https://streamingwolff.com/medio/756/catalogo/3%20MESES.png?tamanio=256",
    textoBoton: "COMPRAR AHORA",
    detalles: "Suscripción de ChatGPT Plus por 3 meses.",
    informacionDelProducto: "Acceso premium a ChatGPT con funciones avanzadas y prioridad en el uso.",
    condicionesDeUso: "El servicio es válido por 3 meses desde la activación. No reembolsable.",
  },
  
  {
    titulo: "NETFLIX PREMIUM 1 MES",
    subtitulo: "STREAMING ILIMITADO",
    nuevo: false,
    aPedido: false,
    stock: 10,
    precioSoles: 35.00,
    categoria: "netflix",
    precioUSD: 9.50,
    proveedor: "NETSTREAM",
    precioRenovable: 9.00,
    imagen: "https://streamingwolff.com/medio/79/catalogo/PERFIL%20%288%29.gif?tamanio=256",
    textoBoton: "COMPRAR AHORA",
    detalles: "Cuenta Netflix Premium válida por 1 mes.",
    informacionDelProducto: "Disfruta de todo el contenido de Netflix en calidad 4K UHD.",
    condicionesDeUso: "Solo para uso personal. No compartir fuera del hogar.",
  },
  {
    titulo: "DISNEY+ FAMILIAR 6 MESES",
    subtitulo: "ENTRETENIMIENTO PARA TODOS",
    nuevo: true,
    aPedido: false,
    stock: 0,
    precioSoles: 60.00,
    categoria: "disney",
    precioUSD: 16.50,
    proveedor: "DISNEYPRO",
    precioRenovable: 16.00,
    imagen: "https://streamingwolff.com/medio/97/catalogo/1737840100293-images%20%2815%29%20%282%29.jpg?tamanio=256",
    textoBoton: "COMPRAR AHORA",
    detalles: "Suscripción Disney+ para toda la familia por 6 meses.",
    informacionDelProducto: "Acceso a películas, series y estrenos exclusivos de Disney, Pixar, Marvel y más.",
    condicionesDeUso: "Incluye hasta 4 perfiles. No transferible.",
  },
]

export const destacados = [
  productos[1],
  
]

export const masVendidos = [
  productos[0],
  productos[2],
 
]
