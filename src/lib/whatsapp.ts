interface RecargaMessage {
  nombre_cliente: string
  monto: number
  metodo: string
  id_cliente: string
}

interface PublicacionMessage {
  nombre_cliente: string
  nombre_producto: string
  metodo: string
  id_cliente: string
  id_producto: string
}

interface DesembolsoMessage {
  nombre_cliente: string
  monto: number
  metodo: string
  id_cliente: string
}


export async function EnviarWhatsAppMessage(
  message: string,
  businessPhone: string,
  device: 'mobile' | 'web' = 'mobile'
) {
  const encodedMessage = encodeURIComponent(message)
  const webUrl = `https://web.whatsapp.com/send?phone=+51${businessPhone}&text=${encodedMessage}`
  const mobileUrl = `https://wa.me/+51${businessPhone}?text=${encodedMessage}`

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
- *Cliente:* ${message.nombre_cliente}
- *Monto:* S/. ${message.monto.toFixed(2)}
- *Comisión:* S/. ${(message.monto * 0.03).toFixed(2)}
- *Método:* ${message.metodo}
- *ID Cliente:* ${message.id_cliente}`

  return EnviarWhatsAppMessage(formattedMessage, businessPhone, device)
}

export async function PublicacionMessage(
  message: PublicacionMessage,
  businessPhone: string,
  device: 'mobile' | 'web' = 'mobile'
) {
  const formattedMessage = `Hola, quiero publicar un *producto* con los siguientes datos:

*DETALLES DE LA PUBLICACIÓN:*
- *Cliente:* ${message.nombre_cliente}
- *Producto:* ${message.nombre_producto}
- *Método:* ${message.metodo}
- *Comisión:* S/. 5.00
- *ID Cliente:* ${message.id_cliente}
- *ID Producto:* ${message.id_producto}`

  return EnviarWhatsAppMessage(formattedMessage, businessPhone, device)
}

export async function DesembolsoMessage(
  message: DesembolsoMessage,
  businessPhone: string,
  device: 'mobile' | 'web' = 'mobile'
) {
  const formattedMessage = `Hola, quiero hacer un *desembolso* con los siguientes datos:

*DETALLES DEL DESEMBOLSO:*
- *Cliente:* ${message.nombre_cliente}
- *Monto:* S/. ${message.monto.toFixed(2)}
- *Comisión:* S/. ${(message.monto * 0.05).toFixed(2)}
- *Método:* ${message.metodo}
- *ID Cliente:* ${message.id_cliente}`

  return EnviarWhatsAppMessage(formattedMessage, businessPhone, device)
}