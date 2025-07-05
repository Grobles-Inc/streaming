// Función simple de encriptación para códigos de referido
// Usa base64 y un salt simple para hacer los códigos menos memorizables

function simpleEncrypt(text: string): string {
  // Agregar timestamp y salt para hacer el código único
  const timestamp = Date.now().toString(36)
  const salt = Math.random().toString(36).substring(2, 8)
  
  // Combinar el texto original con timestamp y salt
  const combined = `${text}:${timestamp}:${salt}`
  
  // Convertir a base64 y hacer algunas transformaciones
  let encoded = btoa(combined)
  
  // Reemplazar caracteres comunes para hacer menos obvio que es base64
  encoded = encoded
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
  
  return encoded
}

// Nueva función para encriptar código de referido y rol juntos
function encryptReferralData(referralCode: string, role: string): string {
  // Agregar timestamp y salt para hacer el código único
  const timestamp = Date.now().toString(36)
  const salt = Math.random().toString(36).substring(2, 8)
  
  // Combinar código de referido, rol, timestamp y salt
  const combined = `${referralCode}|${role}:${timestamp}:${salt}`
  
  // Convertir a base64 y hacer algunas transformaciones
  let encoded = btoa(combined)
  
  // Reemplazar caracteres comunes para hacer menos obvio que es base64
  encoded = encoded
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
  
  return encoded
}

function simpleDecrypt(encryptedText: string): string | null {
  try {
    // Revertir las transformaciones
    let decoded = encryptedText
      .replace(/-/g, '+')
      .replace(/_/g, '/')
    
    // Agregar padding si es necesario
    while (decoded.length % 4) {
      decoded += '='
    }
    
    // Decodificar de base64
    const combined = atob(decoded)
    
    // Extraer el texto original (antes del primer ':')
    const parts = combined.split(':')
    if (parts.length >= 3) {
      return parts[0] // Retornar solo el código original
    }
    
    return null
  } catch (error) {
    console.error('Error al desencriptar:', error)
    return null
  }
}

// Nueva función para desencriptar datos de referido (código + rol)
function decryptReferralData(encryptedText: string): { referralCode: string; role: string } | null {
  try {
    // Revertir las transformaciones
    let decoded = encryptedText
      .replace(/-/g, '+')
      .replace(/_/g, '/')
    
    // Agregar padding si es necesario
    while (decoded.length % 4) {
      decoded += '='
    }
    
    // Decodificar de base64
    const combined = atob(decoded)
    
    // Separar por ':'
    const parts = combined.split(':')
    if (parts.length >= 3) {
      // La primera parte contiene "referralCode|role"
      const dataPart = parts[0]
      const [referralCode, role] = dataPart.split('|')
      
      if (referralCode && role) {
        return { referralCode, role }
      }
    }
    
    return null
  } catch (error) {
    console.error('Error al desencriptar datos de referido:', error)
    return null
  }
}

export { simpleEncrypt, simpleDecrypt, encryptReferralData, decryptReferralData }
