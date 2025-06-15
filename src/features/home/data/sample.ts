import { Service } from "./types"

export const menuTabs = [
  { key: 'max', label: 'Max' },
  { key: 'disney', label: 'Disney' },
  { key: 'netflix', label: 'Netflix' },
  { key: 'busca_personas', label: 'Busca Personas' },
  { key: 'descanso_med', label: 'DESCANSO MED' },
  { key: 'drambox', label: 'DramBox' },
  { key: 'duolingo', label: 'Duolingo' },
  { key: 'free_fire', label: 'Free Fire' },
  { key: 'google', label: 'Google' },
  { key: 'licencias', label: 'Licencias' },
  { key: 'liga_1_max', label: 'LIGA 1 MAX' },
  { key: 'prime_video', label: 'Prime Video' },
  { key: 'redes_sociales', label: 'Redes Sociales' },
  { key: 'sentinel', label: 'Sentinel' },
]

export const services: Service[] = [
  { name: 'Max', subtitle: 'Max', icon: '🔵', tab: 'max' },
  { name: 'Netflix', subtitle: 'Netflix', icon: '🔴', tab: 'netflix' },
  { name: 'Disney+', subtitle: 'Disney+', icon: '🔷', tab: 'disney' },
  { name: 'Prime Video', subtitle: 'Prime Video', icon: '🔵', tab: 'prime_video' },
  { name: 'Google', subtitle: 'Google', icon: '🟢', tab: 'google' },
  { name: 'Busca Personas', subtitle: 'Busca Personas', icon: '🧑‍💼', tab: 'busca_personas' },
  { name: 'DramBox', subtitle: 'DramBox', icon: '🟣', tab: 'drambox' },
  { name: 'Vix', subtitle: 'Vix', icon: '🟠', tab: 'max' },
  { name: 'Redes Sociales', subtitle: 'Redes Sociales', icon: '🎉', tab: 'redes_sociales' },
  { name: 'Licencias', subtitle: 'Licencias', icon: '💻', tab: 'licencias' },
  { name: 'Tinder', subtitle: 'Tinder', icon: '❤️', tab: 'redes_sociales' },
  { name: 'Duolingo', subtitle: 'Duolingo', icon: '🟩', tab: 'duolingo' },
  { name: 'Viki Rakuten', subtitle: 'Viki Rakuten', icon: '🔵', tab: 'max' },
  { name: 'Free Fire', subtitle: 'Free Fire', icon: '🎮', tab: 'free_fire' },
  { name: 'Sentinel-Equifax', subtitle: 'Sentinel-Equifax', icon: '🟢', tab: 'sentinel' },
  { name: 'LIGA 1 MAX', subtitle: 'LIGA 1 MAX', icon: '🔴', tab: 'liga_1_max' },
  { name: 'DESCANSO MED', subtitle: 'DESCANSO MED', icon: '👨‍⚕️', tab: 'descanso_med' },
  { name: 'IPTV Smarters', subtitle: 'IPTV Smarters', icon: '📺', tab: 'max' },
  { name: 'Youtube Premium', subtitle: 'Youtube Premium', icon: '▶️', tab: 'max' },
  { name: 'Flujo Tv', subtitle: 'Flujo Tv', icon: '🟠', tab: 'max' },
  { name: 'Movistar Play', subtitle: 'Movistar Play', icon: '🔵', tab: 'max' },
  { name: 'Directv Go', subtitle: 'Directv Go', icon: '🔵', tab: 'max' },
  { name: 'Crunchyroll', subtitle: 'Crunchyroll', icon: '🟠', tab: 'max' },
  { name: 'Paramount', subtitle: 'Paramount', icon: '🔷', tab: 'max' },
]

export const destacados = [
  services[1],
  services[3],
  services[5],
  services[7],
  services[9],
]

export const masVendidos = [
  services[0],
  services[2],
  services[4],
  services[6],
  services[8],
]