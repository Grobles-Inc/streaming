import type { Json } from '@/types/supabase'

export interface YapeInfo {
  qr_url: string | null
  yape_number: string | null
  yape_name: string | null
  comm_phone: string | null
}

export interface BinanceInfo {
  qr_url: string | null
  binance_id: string | null
  binance_name: string | null
  usdt_rate: number | null
}

export const DEFAULT_YAPE_INFO: YapeInfo = {
  qr_url: null,
  yape_number: '+51 913 190 401',
  yape_name: 'Juan Laura P.',
  comm_phone: '51913190401',
}

export const DEFAULT_BINANCE_INFO: BinanceInfo = {
  qr_url: null,
  binance_id: '1096171177',
  binance_name: 'Melvy L.',
  usdt_rate: 3.2,
}

export function asYapeInfo(raw: unknown): YapeInfo {
  const obj =
    raw && typeof raw === 'object' && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {}
  return {
    qr_url: typeof obj.qr_url === 'string' ? obj.qr_url : DEFAULT_YAPE_INFO.qr_url,
    yape_number:
      typeof obj.yape_number === 'string'
        ? obj.yape_number
        : DEFAULT_YAPE_INFO.yape_number,
    yape_name:
      typeof obj.yape_name === 'string'
        ? obj.yape_name
        : DEFAULT_YAPE_INFO.yape_name,
    comm_phone:
      typeof obj.comm_phone === 'string'
        ? obj.comm_phone
        : DEFAULT_YAPE_INFO.comm_phone,
  }
}

export function asBinanceInfo(raw: unknown): BinanceInfo {
  const obj =
    raw && typeof raw === 'object' && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {}
  return {
    qr_url:
      typeof obj.qr_url === 'string'
        ? obj.qr_url
        : DEFAULT_BINANCE_INFO.qr_url,
    binance_id:
      typeof obj.binance_id === 'string'
        ? obj.binance_id
        : DEFAULT_BINANCE_INFO.binance_id,
    binance_name:
      typeof obj.binance_name === 'string'
        ? obj.binance_name
        : DEFAULT_BINANCE_INFO.binance_name,
    usdt_rate:
      typeof obj.usdt_rate === 'number' && Number.isFinite(obj.usdt_rate)
        ? obj.usdt_rate
        : DEFAULT_BINANCE_INFO.usdt_rate,
  }
}

export function yapeInfoToJson(info: YapeInfo): Json {
  return info as unknown as Json
}

export function binanceInfoToJson(info: BinanceInfo): Json {
  return info as unknown as Json
}