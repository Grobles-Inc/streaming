import { supabase } from '@/lib/supabase'

export type DeleteUserSmartAction = 'hard_delete' | 'soft_delete'

export interface DeleteUserSmartResult {
  success: boolean
  action: DeleteUserSmartAction
  message: string
  reasons: string[]
  saldoRestante: number
}

/**
 * Calls `public.delete_user_smart(p_user_id uuid)`.
 * The RPC decides atomically: no activity -> hard delete,
 * any FK activity / balance -> soft delete (estado_habilitado = false).
 */
export async function deleteUserSmart(
  userId: string
): Promise<DeleteUserSmartResult> {
  const { data, error } = await supabase.rpc('delete_user_smart', {
    p_user_id: userId,
  })

  if (error) throw error

  return data as DeleteUserSmartResult
}
