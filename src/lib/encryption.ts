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

// Nueva función para encriptar código de referido, rol y token de validación
function encryptReferralData(referralCode: string, role: string, validationToken: string): string {
  console.log("Encriptando datos con referido:", { referralCode, role, validationToken });
  
  // Agregar timestamp y salt para hacer el código único
  const timestamp = Date.now().toString()
  const salt = Math.random().toString(36).substring(2, 8)
  
  // Combinar código de referido, rol, token de validación, timestamp y salt
  const combined = `${referralCode}|${role}|${validationToken}:${timestamp}:${salt}`
  console.log("Cadena combinada antes de codificar:", combined);
  
  // Convertir a base64 y hacer algunas transformaciones
  let encoded = btoa(combined)
  
  // Reemplazar caracteres comunes para hacer menos obvio que es base64
  encoded = encoded
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
  
  console.log("Token encriptado:", encoded);
  return encoded
}

// Nueva función para encriptar solo el token de validación (para registros sin referido)
function encryptValidationToken(validationToken: string, role: string = 'registered'): string {
  console.log("Encriptando datos sin referido:", { role, validationToken });
  
  // Agregar timestamp y salt para hacer el código único
  const timestamp = Date.now().toString()
  const salt = Math.random().toString(36).substring(2, 8)
  
  // Combinar token de validación, rol, timestamp y salt (sin código de referido)
  // Usamos un pipe vacío al principio para mantener la estructura consistente
  const combined = `|${role}|${validationToken}:${timestamp}:${salt}`
  console.log("Cadena combinada antes de codificar:", combined);
  
  // Convertir a base64 y hacer algunas transformaciones
  let encoded = btoa(combined)
  
  // Reemplazar caracteres comunes para hacer menos obvio que es base64
  encoded = encoded
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
  
  console.log("Token encriptado:", encoded);
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

// Nueva función para desencriptar datos de referido (código + rol + token)
function decryptReferralData(encryptedText: string): { 
  referralCode?: string; 
  role: string; 
  validationToken: string 
} | null {
  console.log("Desencriptando token:", encryptedText);
  
  if (!encryptedText || encryptedText.trim() === '') {
    console.error("Token de encriptación vacío o nulo");
    return null;
  }
  
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
    console.log("Token decodificado:", combined);
    
    // Separar por ':'
    const parts = combined.split(':')
    console.log("Partes del token:", parts);
    
    if (parts.length >= 3) {
      // La primera parte contiene "referralCode|role|validationToken"
      const dataPart = parts[0]
      console.log("Parte de datos:", dataPart);
      
      const dataElements = dataPart.split('|')
      console.log("Elementos de datos:", dataElements);
      
      // Verificar la estructura del token basada en si tiene o no código de referido
      let referralCode, role, validationToken;
      
      if (dataElements.length === 3) {
        // Formato con código de referido
        [referralCode, role, validationToken] = dataElements;
      } else if (dataElements.length === 2) {
        // Formato sin código de referido (primer elemento vacío)
        [, role, validationToken] = ['', ...dataElements];
      } else {
        console.error("Formato de token no reconocido");
        return null;
      }
      
      console.log("Código de referido:", referralCode);
      console.log("Rol:", role);
      console.log("Token de validación:", validationToken);
      
      if (role && validationToken) {
        return { 
          referralCode: referralCode || undefined, 
          role, 
          validationToken 
        }
      }
    }
    
    console.error("Formato de token inválido");
    return null
  } catch (error) {
    console.error('Error al desencriptar datos de referido:', error)
    return null
  }
}

export { simpleEncrypt, simpleDecrypt, encryptReferralData, encryptValidationToken, decryptReferralData }
