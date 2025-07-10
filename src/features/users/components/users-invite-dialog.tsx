import { useState, useEffect, useCallback } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconMailPlus, IconCopy, IconCheck, IconEye, IconLink, IconX, IconLoader, IconRefresh, IconAlertTriangle } from '@tabler/icons-react'
import { ConfigurationService } from '@/services/configuration.service'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useReferralValidation } from '../hooks/use-referral-validation'

const formSchema = z.object({
  referralCode: z.string().optional(),
})
type UserInviteForm = z.infer<typeof formSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Función para generar el link de invitación seguro con token de validación
async function generateSecureInviteLink(referralCode?: string): Promise<string | null> {
  console.log("Generando link seguro" + (referralCode ? ` con referido: ${referralCode}` : " sin referido"));
  
  try {
    // Obtener el token de validación actual o generar uno nuevo
    let validationToken;
    
    // Primero intentar obtener el token existente
    const config = await ConfigurationService.getConfiguration();
    
    if (config && config.register_link && config.register_link.trim() !== '') {
      // Verificar que el token actual siga siendo válido
      const isValid = await ConfigurationService.validateRegistrationToken(config.register_link);
      if (isValid) {
        validationToken = config.register_link;
        console.log("Usando token existente:", validationToken);
      } else {
        // Si no es válido, generar uno nuevo
        validationToken = ConfigurationService.generateRegistrationToken();
        console.log("Token existente inválido, generando nuevo:", validationToken);
      }
    } else {
      // Si no hay token o está vacío, generar uno nuevo
      validationToken = ConfigurationService.generateRegistrationToken();
      console.log("No hay token existente, generando nuevo:", validationToken);
    }
    
    // Si generamos un nuevo token, almacenarlo
    if (!config || !config.register_link || config.register_link !== validationToken) {
      // Almacenar el token en la base de datos - Este paso guarda el token en configuracion.register_link
      const tokenStored = await ConfigurationService.storeRegistrationToken(validationToken);
      console.log("¿Token almacenado correctamente?", tokenStored);
      
      if (!tokenStored) {
        console.error('No se pudo almacenar el token de validación');
        throw new Error('No se pudo almacenar el token de validación');
      }
    }

    const baseUrl = window.location.origin;
    
    // Crear la URL con los parámetros necesarios
    let finalUrl = `${baseUrl}/register?token=${validationToken}`;
    
    // Si hay código de referido, agregarlo como parámetro adicional
    if (referralCode) {
      finalUrl = `${finalUrl}&ref=${encodeURIComponent(referralCode)}`;
    }
    
    console.log("URL final generada:", finalUrl);
    
    // Verificar que el token sea válido
    const isValid = await ConfigurationService.validateRegistrationToken(validationToken);
    console.log("¿Token validado correctamente?", isValid);
    
    if (!isValid) {
      console.error("El token generado no pasa la validación");
      throw new Error('El token generado no pasa la validación');
    }
    
    return finalUrl;
  } catch (error) {
    console.error('Error generando link seguro:', error);
    return null;
  }
}

export function UsersInviteDialog({ open, onOpenChange }: Props) {
  const { isValid, isLoading, referentName, validateCode, reset } = useReferralValidation()
  
  // Estados para el link general (sin referido)
  const [generalInviteLink, setGeneralInviteLink] = useState<string>('')
  
  // Estados para el link con referido
  const [referralInviteLink, setReferralInviteLink] = useState<string>('')
  
  // Estados compartidos
  const [copied, setCopied] = useState<string>('') // Guarda el tipo de link copiado: 'general' o 'referral'
  const [generatingGeneralLink, setGeneratingGeneralLink] = useState(false)
  const [generatingReferralLink, setGeneratingReferralLink] = useState(false)
  
  // Estados para el modal de confirmación
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<'general' | 'referral'>('general')
  
  const form = useForm<UserInviteForm>({
    resolver: zodResolver(formSchema),
    defaultValues: { referralCode: '' },
  })

  const watchedReferralCode = form.watch('referralCode')
  const hasReferralCode = watchedReferralCode && watchedReferralCode.trim() !== ''
  
  // Objeto para guardar los links generados por código de referido
  const [referralLinksMap, setReferralLinksMap] = useState<Record<string, string>>({})

  // Función para cargar o generar el link general (sin referido)
  const generateGeneralLink = useCallback(async (forceRegenerate = false) => {
    if (generatingGeneralLink) return;
    
    // Si no estamos forzando la regeneración, intentar cargar del localStorage
    if (!forceRegenerate) {
      const savedGeneralLink = localStorage.getItem('generalInviteLink');
      if (savedGeneralLink) {
        setGeneralInviteLink(savedGeneralLink);
        return;
      }
    }
    
    // Si llegamos aquí, necesitamos generar un nuevo link
    setGeneratingGeneralLink(true);
    try {
      // Generar link sin referido
      const link = await generateSecureInviteLink();
      
      if (link) {
        setGeneralInviteLink(link);
        localStorage.setItem('generalInviteLink', link);
        if (forceRegenerate) {
          toast.success('Link de invitación general regenerado');
        } else {
          toast.success('Link de invitación general generado');
        }
      }
    } catch (error) {
      console.error('Error generando link general:', error);
      toast.error('Error al generar el link de invitación general');
    } finally {
      setGeneratingGeneralLink(false);
    }
  }, [generatingGeneralLink]);

  // Función para cargar o generar un link específico para un código de referido
  const generateReferralLink = useCallback(async (referralCode: string, forceRegenerate = false) => {
    if (generatingReferralLink || !referralCode) return;
    
    // Si no estamos forzando la regeneración, intentar cargar del localStorage
    if (!forceRegenerate) {
      // Primero verificamos en nuestro estado local
      if (referralLinksMap[referralCode]) {
        setReferralInviteLink(referralLinksMap[referralCode]);
        return;
      }
      
      // Si no está en el estado, buscamos en localStorage
      const savedReferralLinksJSON = localStorage.getItem('referralInviteLinks');
      if (savedReferralLinksJSON) {
        try {
          const savedReferralLinks = JSON.parse(savedReferralLinksJSON) as Record<string, string>;
          if (savedReferralLinks[referralCode]) {
            // Actualizar tanto el link actual como el mapa de links
            setReferralInviteLink(savedReferralLinks[referralCode]);
            setReferralLinksMap(prev => ({
              ...prev,
              [referralCode]: savedReferralLinks[referralCode]
            }));
            return;
          }
        } catch (e) {
          console.error('Error parsing saved referral links:', e);
        }
      }
    }
    
    // Si llegamos aquí, necesitamos generar un nuevo link para este código
    setGeneratingReferralLink(true);
    try {
      const link = await generateSecureInviteLink(referralCode);
      
      if (link) {
        // Actualizar el link actual
        setReferralInviteLink(link);
        
        // Actualizar el mapa de links en el estado
        const updatedMap = { ...referralLinksMap, [referralCode]: link };
        setReferralLinksMap(updatedMap);
        
        // Guardar en localStorage
        localStorage.setItem('referralInviteLinks', JSON.stringify(updatedMap));
        
        if (forceRegenerate) {
          toast.success(`Link con referido ${referralCode} regenerado`);
        } else {
          toast.success(`Link con referido ${referralCode} generado`);
        }
      }
    } catch (error) {
      console.error('Error generando link con referido:', error);
      toast.error(`Error al generar el link para el código ${referralCode}`);
    } finally {
      setGeneratingReferralLink(false);
    }
  }, [generatingReferralLink, referralLinksMap]);
  
  // Validar código cuando cambie
  useEffect(() => {
    // Si no hay código de referido, resetear la validación
    if (!hasReferralCode) {
      reset();
      return;
    }
    
    // Debounce para la validación del código
    const timeoutId = setTimeout(() => {
      validateCode(watchedReferralCode!);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchedReferralCode, hasReferralCode, validateCode, reset]);
  
  // Función para verificar si un token es válido
  const verifyTokenValidity = useCallback(async (tokenUrl: string): Promise<boolean> => {
    try {
      console.log("Verificando validez del token:", tokenUrl);
      
      // Extraer el token de la URL
      const url = new URL(tokenUrl);
      const tokenParam = url.searchParams.get('token');
      if (!tokenParam) {
        console.error("URL no contiene parámetro token");
        return false;
      }
      
      // En el nuevo formato, el token es el valor directo del parámetro token
      // (ya no necesita ser desencriptado)
      console.log("Token a verificar:", tokenParam);
      
      // Validar el token contra la base de datos
      const isValid = await ConfigurationService.validateRegistrationToken(tokenParam);
      
      console.log("Token validado:", isValid);
      return isValid;
    } catch (error) {
      console.error("Error verificando token:", error);
      return false;
    }
  }, []);
  
  // Efecto para cargar todos los links guardados al abrir el diálogo
  useEffect(() => {
    if (open) {
      // 1. Cargar link general
      const savedGeneralLink = localStorage.getItem('generalInviteLink');
      if (savedGeneralLink) {
        console.log("Validando link general guardado:", savedGeneralLink);
        // Verificar si el token sigue siendo válido
        verifyTokenValidity(savedGeneralLink).then(isValid => {
          if (isValid) {
            console.log("Token general en localStorage es válido, usándolo");
            setGeneralInviteLink(savedGeneralLink);
          } else {
            console.log("Token general no válido, generando uno nuevo");
            localStorage.removeItem('generalInviteLink');
            generateGeneralLink();
          }
        }).catch(error => {
          console.error("Error validando token general:", error);
          localStorage.removeItem('generalInviteLink');
          generateGeneralLink();
        });
      } else {
        // Si no existe, generarlo
        console.log("No hay link general guardado, generando uno nuevo");
        generateGeneralLink();
      }
      
      // 2. Cargar mapa de links por referido
      const savedReferralLinksJSON = localStorage.getItem('referralInviteLinks');
      if (savedReferralLinksJSON) {
        try {
          console.log("Cargando links de referido guardados");
          const savedReferralLinks = JSON.parse(savedReferralLinksJSON) as Record<string, string>;
          // No validamos todos los tokens de referido automáticamente para no sobrecargar
          // Solo validaremos el token específico cuando se ingrese el código
          setReferralLinksMap(savedReferralLinks);
        } catch (e) {
          console.error('Error parsing saved referral links:', e);
          localStorage.removeItem('referralInviteLinks');
        }
      }
    }
  }, [open, generateGeneralLink, verifyTokenValidity]);

  // Este efecto maneja los cambios en la validez del código
  useEffect(() => {
    // Si hay código y es inválido, mostrar mensaje
    if (hasReferralCode && isValid === false) {
      toast.warning('Código de referido inválido')
      // Limpiar el link de referido actual cuando el código es inválido
      setReferralInviteLink('');
    } 
    // Si el código es válido, intentar cargar o generar el link correspondiente
    else if (hasReferralCode && isValid === true) {
      console.log("Código de referido válido:", watchedReferralCode);
      
      // Buscar si ya tenemos un link para este código
      if (referralLinksMap[watchedReferralCode!]) {
        console.log("Link existente encontrado para código:", watchedReferralCode);
        console.log("Link:", referralLinksMap[watchedReferralCode!]);
        
        // Verificar si el token existente es válido
        verifyTokenValidity(referralLinksMap[watchedReferralCode!]).then(isValid => {
          if (isValid) {
            console.log("Token de referido es válido, usándolo");
            setReferralInviteLink(referralLinksMap[watchedReferralCode!]);
          } else {
            console.log("Token de referido no válido, generando uno nuevo");
            generateReferralLink(watchedReferralCode!, true); // Forzar regeneración
          }
        }).catch(error => {
          console.error("Error verificando validez del token de referido:", error);
          generateReferralLink(watchedReferralCode!, true);
        });
      } else {
        // Si no existe, generarlo
        console.log("No hay link existente para este código, generando uno nuevo");
        generateReferralLink(watchedReferralCode!);
      }
    }
  }, [isValid, hasReferralCode, watchedReferralCode, referralLinksMap, verifyTokenValidity, generateReferralLink]);
  
  // Funciones para solicitar la regeneración de los links (mostrar confirmación)
  const requestRegenerateGeneralLink = useCallback(() => {
    setConfirmAction('general');
    setConfirmDialogOpen(true);
  }, []);
  
  const requestRegenerateReferralLink = useCallback(() => {
    if (hasReferralCode && isValid) {
      setConfirmAction('referral');
      setConfirmDialogOpen(true);
    } else {
      toast.error('No hay un código válido para regenerar el link');
    }
  }, [hasReferralCode, isValid]);
  
  // Función para confirmar la regeneración después de la confirmación
  const handleConfirmRegenerate = useCallback(() => {
    if (confirmAction === 'general') {
      generateGeneralLink(true); // true indica forzar regeneración
    } else if (confirmAction === 'referral' && hasReferralCode && isValid) {
      generateReferralLink(watchedReferralCode!, true); // true indica forzar regeneración
    }
    setConfirmDialogOpen(false);
  }, [confirmAction, generateGeneralLink, hasReferralCode, isValid, watchedReferralCode, generateReferralLink]);
  
  // Función para copiar link general
  const handleCopyGeneralLink = async () => {
    if (generalInviteLink) {
      try {
        await navigator.clipboard.writeText(generalInviteLink);
        setCopied('general');
        toast.success('Link general copiado al portapapeles');
        setTimeout(() => setCopied(''), 2000);
      } catch (error) {
        toast.error('Error al copiar el link');
      }
    }
  };
  
  // Función para copiar link con referido
  const handleCopyReferralLink = async () => {
    if (referralInviteLink) {
      try {
        await navigator.clipboard.writeText(referralInviteLink);
        setCopied('referral');
        toast.success('Link con referido copiado al portapapeles');
        setTimeout(() => setCopied(''), 2000);
      } catch (error) {
        toast.error('Error al copiar el link');
      }
    }
  };

  // Función para abrir link general
  const handleOpenGeneralLink = () => {
    if (generalInviteLink) {
      window.open(generalInviteLink, '_blank');
    }
  };
  
  // Función para abrir link con referido
  const handleOpenReferralLink = () => {
    if (referralInviteLink) {
      window.open(referralInviteLink, '_blank');
    }
  };

  /* 
  // Función para limpiar el link general - Comentada porque se eliminó el botón correspondiente
  const clearGeneralLink = () => {
    setGeneralInviteLink('');
    if (copied === 'general') setCopied('');
    localStorage.removeItem('generalInviteLink');
    toast.info('Link de invitación general eliminado');
  };
  
  // Función para limpiar el link con referido actual - Comentada porque se eliminó el botón correspondiente
  const clearReferralLink = () => {
    if (!hasReferralCode || !isValid) {
      toast.error('No hay un código válido para eliminar');
      return;
    }
    
    // Eliminar solo el link del código actual
    const newMap = { ...referralLinksMap };
    delete newMap[watchedReferralCode!];
    setReferralLinksMap(newMap);
    
    // Actualizar localStorage
    localStorage.setItem('referralInviteLinks', JSON.stringify(newMap));
    
    setReferralInviteLink('');
    if (copied === 'referral') setCopied('');
    
    toast.info(`Link con referido ${watchedReferralCode} eliminado`);
  };
  */

  // Función para limpiar todos los links con referido
  const clearAllReferralLinks = () => {
    setReferralLinksMap({});
    setReferralInviteLink('');
    if (copied === 'referral') setCopied('');
    localStorage.removeItem('referralInviteLinks');
    toast.info('Todos los links con referido han sido eliminados');
  }

  const onSubmit = () => {
    if (hasReferralCode && !isValid) {
      form.setError('referralCode', {
        message: 'Código de referido inválido'
      })
      return
    }

    // Si hay un código válido, asegurarse de que existe un link
    if (hasReferralCode && isValid && !referralInviteLink) {
      generateReferralLink(watchedReferralCode!);
    }
    
    // Siempre asegurarse de que existe un link general
    if (!generalInviteLink) {
      generateGeneralLink();
    }

    toast.success('Links de invitación confirmados');
    onOpenChange(false);
  }

  return (
    <>
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!state) { // Solo resetear algunos estados cuando se cierra el diálogo
          form.reset()
          reset()
          setCopied('')
          // NO resetear: 
          // - linkGenerated ni inviteLink para que persistan
          // - lastValidCode para recordar el último código válido usado
          // - NO eliminar el link de localStorage para que se mantenga entre recargas
        }
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader className='text-left'>
          <DialogTitle className='flex items-center gap-2'>
            <IconMailPlus className="h-5 w-5" />
            Generar Link de Invitación
          </DialogTitle>
          <DialogDescription>
            Crea un link personalizado para invitar usuarios. El código de referido es opcional.
            El nuevo usuario se registrará automáticamente con rol de "registered".
          </DialogDescription>
        </DialogHeader>
          <Form {...form}>
            <form
              id='user-invite-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-6'
            >
              

              {/* Sección 1: Link General (Sin Referido) */}
              <>
                <Separator className="my-4" />
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <IconLink className="h-4 w-4" />
                      Link de Invitación General
                    </CardTitle>
                    <CardDescription>
                      Comparte este link para que cualquier usuario se registre (sin referido).
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {generatingGeneralLink ? (
                      <div className="flex items-center justify-center py-8">
                        <IconLoader className="h-6 w-6 animate-spin mr-2" />
                        <span className="text-sm text-muted-foreground">Generando link general...</span>
                      </div>
                    ) : (
                      <>
                        {/* Link input y acciones principales */}
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Input
                              value={generalInviteLink}
                              readOnly
                              className="flex-1 font-mono text-sm"
                              placeholder="Generando link seguro..."
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={handleCopyGeneralLink}
                              className="shrink-0 flex items-center gap-1"
                              disabled={!generalInviteLink || generatingGeneralLink}
                            >
                              {copied === 'general' ? (
                                <IconCheck className="h-4 w-4 text-green-600" />
                              ) : (
                                <IconCopy className="h-4 w-4" />
                              )}
                              {copied === 'general' ? 'Copiado' : 'Copiar'}
                            </Button>
                          </div>
                          
                          {/* Botones secundarios */}
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={handleOpenGeneralLink}
                              className="flex items-center gap-1"
                              disabled={!generalInviteLink || generatingGeneralLink}
                            >
                              <IconEye className="h-4 w-4" />
                              Ver Link
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={requestRegenerateGeneralLink}
                              className="flex items-center gap-1"
                              disabled={generatingGeneralLink}
                            >
                              <IconRefresh className="h-4 w-4" />
                              Regenerar Token
                            </Button>
                            {/* <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={clearGeneralLink}
                              className="flex items-center gap-1"
                              disabled={!generalInviteLink || generatingGeneralLink}
                            >
                              <IconX className="h-4 w-4" />
                              Eliminar Link
                            </Button> */}
                          </div>
                        </div>
                        
                        {/* Información del link general */}
                        <div className="space-y-2">
                          <Badge variant="secondary" className="text-xs w-full justify-center py-1">
                            Invitación General - Sin Referido
                          </Badge>
                          
                          <p className="text-xs text-muted-foreground mt-2">
                            Este link permanecerá válido hasta que se regenere uno nuevo. Si regeneras el token, los links anteriores dejarán de funcionar.
                          </p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
                <FormField
                control={form.control}
                name='referralCode'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código de referido (opcional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder='Ej: ABC123 (opcional)'
                          {...field}
                          className={`pr-10 ${
                            hasReferralCode && isValid === true 
                              ? 'border-green-500 focus:border-green-500' 
                              : hasReferralCode && isValid === false 
                              ? 'border-red-500 focus:border-red-500' 
                              : ''
                          }`}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          {hasReferralCode && isLoading ? (
                            <IconLoader className="h-4 w-4 text-gray-400 animate-spin" />
                          ) : hasReferralCode && isValid === true ? (
                            <IconCheck className="h-4 w-4 text-green-500" />
                          ) : hasReferralCode && isValid === false ? (
                            <IconX className="h-4 w-4 text-red-500" />
                          ) : null}
                        </div>
                      </div>
                    </FormControl>
                    {referentName && isValid && hasReferralCode && (
                      <p className="text-sm text-green-600">
                        Referente: {referentName}
                      </p>
                    )}
                    {!hasReferralCode && (
                      <p className="text-sm text-blue-600">
                        Sin código de referido - Invitación general
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
                {/* Sección 2: Link con Referido */}
                <Separator className="my-4" />
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <IconLink className="h-4 w-4" />
                          Link de Invitación con Referido
                        </CardTitle>
                        <CardDescription>
                          Ingresa un código de referido para generar un link personalizado. Cada código tendrá su propio link único.
                        </CardDescription>
                      </div>
                      {Object.keys(referralLinksMap).length > 1 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={clearAllReferralLinks}
                          className="flex items-center gap-1 text-xs"
                        >
                          <IconX className="h-3 w-3" />
                          Eliminar Todos
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {hasReferralCode && isValid ? (
                      generatingReferralLink ? (
                        <div className="flex items-center justify-center py-8">
                          <IconLoader className="h-6 w-6 animate-spin mr-2" />
                          <span className="text-sm text-muted-foreground">Generando link con referido...</span>
                        </div>
                      ) : (
                        <>
                          {/* Link input y acciones principales */}
                          <div className="space-y-3">
                            <div className="flex gap-2">
                              <Input
                                value={referralInviteLink}
                                readOnly
                                className="flex-1 font-mono text-sm"
                                placeholder="Generando link seguro..."
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={handleCopyReferralLink}
                                className="shrink-0 flex items-center gap-1"
                                disabled={!referralInviteLink || generatingReferralLink}
                              >
                                {copied === 'referral' ? (
                                  <IconCheck className="h-4 w-4 text-green-600" />
                                ) : (
                                  <IconCopy className="h-4 w-4" />
                                )}
                                {copied === 'referral' ? 'Copiado' : 'Copiar'}
                              </Button>
                            </div>
                            
                            {/* Botones secundarios */}
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={handleOpenReferralLink}
                                className="flex items-center gap-1"
                                disabled={!referralInviteLink || generatingReferralLink}
                              >
                                <IconEye className="h-4 w-4" />
                                Ver Link
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={requestRegenerateReferralLink}
                                className="flex items-center gap-1"
                                disabled={generatingReferralLink}
                              >
                                <IconRefresh className="h-4 w-4" />
                                Regenerar Token
                              </Button>
                              {/* <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={clearReferralLink}
                                className="flex items-center gap-1"
                                disabled={!referralInviteLink || generatingReferralLink}
                              >
                                <IconX className="h-4 w-4" />
                                Eliminar Link
                              </Button> */}
                            </div>
                          </div>
                          
                          {/* Información del link con referido */}
                          <div className="space-y-2">
                            {/* <div className="grid grid-cols-2 gap-2">
                              <Badge variant="outline" className="text-xs justify-center py-1">
                                Código: {watchedReferralCode}
                              </Badge>
                              <Badge variant="secondary" className="text-xs justify-center py-1">
                                Rol: registered
                              </Badge>
                              {referentName && (
                                <Badge variant="default" className="text-xs justify-center py-1 col-span-2">
                                  Por: {referentName}
                                </Badge>
                              )}
                            </div> */}
                            
                            <p className="text-xs text-muted-foreground mt-2">
                              Los links de invitación (con o sin código de referido) comparten el mismo token base y permanecerán válidos durante 7 días. Si regeneras el token, todos los links anteriores dejarán de funcionar.
                            </p>
                          </div>
                        </>
                      )
                    ) : (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        {hasReferralCode && isValid === false ? (
                          <p>El código ingresado no es válido. Por favor ingresa un código válido.</p>
                        ) : (
                          <p>Ingresa un código de referido válido para generar un link con referido.</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            </form>
          </Form>
        <DialogFooter className='gap-y-2'>
          <DialogClose asChild>
            <Button variant='outline'>Cancelar</Button>
          </DialogClose>
          <Button 
            type='submit' 
            form='user-invite-form'
            disabled={(hasReferralCode && !isValid) || isLoading}
          >
            <IconCheck className="mr-2 h-4 w-4" />
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <IconAlertTriangle className="h-5 w-5 text-amber-500" />
            Confirmación - Regenerar Token
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            <p className="mb-2">
              Al regenerar este token, <strong className="text-amber-600">todos los links anteriores dejarán de funcionar</strong>, tanto los generales como los que incluyen código de referido. Solo serán válidos los nuevos links que generes.
            </p>
            <p className="mb-2">
              Cualquier usuario que intente registrarse con un link anterior recibirá un mensaje de "Acceso Denegado".
            </p>
            <p>
              Los tokens de registro están configurados para expirar después de <strong>7 días</strong>. Si un link no funciona, 
              es posible que haya caducado o que se haya generado uno nuevo que lo invalidó.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmRegenerate}>
            Regenerar de todos modos
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}
