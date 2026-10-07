import { z } from 'zod'

/**
 * Shape of the public sign-up form.
 *
 * Note what is absent: there is no `rol` field. The role is decided in
 * ../api/sign-up.ts and is never read from user input, so a tampered payload
 * cannot ask for a different one.
 */
export const signUpSchema = z
  .object({
    nombres: z
      .string()
      .trim()
      .min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
    apellidos: z
      .string()
      .trim()
      .min(2, { message: 'El apellido debe tener al menos 2 caracteres' }),
    usuario: z
      .string()
      .trim()
      .min(3, { message: 'El usuario debe tener al menos 3 caracteres' })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: 'Solo letras, números y guiones bajos',
      }),
    email: z
      .string()
      .trim()
      .min(1, { message: 'El email es requerido' })
      .email({ message: 'Email inválido' }),
    telefono: z
      .string()
      .optional()
      .refine((value) => !value || value.length >= 12, {
        message: 'El teléfono debe incluir código de país y al menos 9 dígitos',
      }),
    password: z
      .string()
      .min(8, { message: 'La contraseña debe tener al menos 8 caracteres' }),
    confirmPassword: z.string(),
    codigoReferido: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export type SignUpFormData = z.infer<typeof signUpSchema>
