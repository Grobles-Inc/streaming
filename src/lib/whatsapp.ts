interface RecargaMessage {
  usuario: string
  monto: number
  id_cliente: string
}

interface RetiroMessage {
  usuario: string
  monto_soles: number
  monto_dolares: number
  monto_neto: number
  comision: number
  id_cliente: string
}

interface CompraMessage {
  producto_nombre: string
  producto_precio: number
  email_cuenta: string
  descripcion: string
  informacion: string
  condiciones: string
  clave_cuenta: string
  perfil?: string
  pin?: string
  fecha_inicio: string
  fecha_expiracion: string | null
  ciclo_facturacion: string
}

interface SoporteMessage {
  usuario: string
  asunto: string
  mensaje: string
  id_producto: number
  id_cliente: string
}


export async function EnviarWhatsAppMessage(
  message: string,
  businessPhone: string,
  device: 'mobile' | 'web' = 'mobile'
) {
  const encodedMessage = encodeURIComponent(message)
  const webUrl = `https://web.whatsapp.com/send?phone=${businessPhone}&text=${encodedMessage}`
  const mobileUrl = `https://wa.me/${businessPhone}?text=${encodedMessage}`

  try {
    // For mobile devices, try to open in the same window first
    if (device === 'mobile') {
      window.location.href = mobileUrl
    } else {
      window.open(webUrl, '_blank')
    }
    return true
  } catch (error) {
    console.error('Error opening WhatsApp URL:', error)
    // Fallback to direct URL if window.open fails
    try {
      window.location.href = webUrl
      return true
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError)
      return false
    }
  }
}

export async function RecargaMessage(
  message: RecargaMessage,
  businessPhone: string,
  device: 'mobile' | 'web' = 'mobile'
) {
  const formattedMessage = `Hola, quiero hacer una *recarga* con los siguientes datos:

*DETALLES DE LA RECARGA:*
- *Usuario:* ${message.usuario}
- *Monto:* S/. ${message.monto.toFixed(2)}
- *ID Cliente:* ${message.id_cliente}`

  return EnviarWhatsAppMessage(formattedMessage, businessPhone, device)
}

export async function SoporteMessage(
  message: SoporteMessage,
  businessPhone: string,
  device: 'mobile' | 'web' = 'mobile'
) {
  const formattedMessage = `Hola, necesito *soporte* con los siguientes datos:

*DETALLES DEL SOPORTE:*
- *Usuario:* ${message.usuario}
- *Asunto:* ${message.asunto}
- *Mensaje:* ${message.mensaje}
- *ID Cliente:* ${message.id_cliente}
- *ID Producto:* ${message.id_producto}`

  return EnviarWhatsAppMessage(formattedMessage, businessPhone, device)
}

export async function CompraMessage(
  message: CompraMessage,
  businessPhone: string,
  device: 'mobile' | 'web' = 'mobile'
) {
  const formattedMessage = `Hola, estos son los datos de tu *compra*:

*DETALLES DE LA COMPRA:*
- *Producto:* ${message.producto_nombre}
- *Precio:* S/. ${message.producto_precio.toFixed(2)}
- *Email:* ${message.email_cuenta}
- *Clave:* ${message.clave_cuenta}
- *Perfil:* ${message.perfil}
- *PIN:* ${message.pin}
- *Fecha de inicio:* ${message.fecha_inicio}
- *Fecha de término:* ${message.fecha_expiracion || 'Sin activar'}
- *Ciclo de facturación:* ${message.ciclo_facturacion}
- *Descripción:* ${message.descripcion}
- *Información:* ${message.informacion}
- *Condiciones:* ${message.condiciones}`

  return EnviarWhatsAppMessage(formattedMessage, businessPhone, device)
}

export async function RetiroMessage(
  message: RetiroMessage,
  businessPhone: string,
  device: 'mobile' | 'web' = 'mobile'
) {
  const formattedMessage = `Hola, quiero hacer un *retiro* con los siguientes datos:

*DETALLES DEL RETIRO:*
- *Usuario:* ${message.usuario}
- *Monto solicitado:* S/. ${message.monto_soles.toFixed(2)}
- *Valor en USD:* $${message.monto_dolares.toFixed(2)}
- *Comisión (10%):* $${message.comision.toFixed(2)}
- *Monto neto a recibir:* $${message.monto_neto.toFixed(2)}
- *ID Cliente:* ${message.id_cliente}`

  return EnviarWhatsAppMessage(formattedMessage, businessPhone, device)
}