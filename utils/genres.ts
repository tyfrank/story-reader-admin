// Add new genres here — they'll appear everywhere automatically
export const GENRES = [
  { value: 'WEREWOLF', label: 'Werewolf' },
  { value: 'VAMPIRE', label: 'Vampire' },
  { value: 'SHIFTER', label: 'Shifter' },
  { value: 'FAE_FANTASY', label: 'Fae / Fantasy' },
  { value: 'BILLIONAIRE_CEO', label: 'Billionaire / CEO' },
  { value: 'OFFICE_ROMANCE', label: 'Office Romance' },
  { value: 'SMALL_TOWN', label: 'Small Town' },
  { value: 'SPORTS_ROMANCE', label: 'Sports Romance' },
  { value: 'MAFIA', label: 'Mafia' },
  { value: 'CONTEMPORARY', label: 'Contemporary' },
  { value: 'ENEMIES_TO_LOVERS', label: 'Enemies to Lovers' },
  { value: 'SECOND_CHANCE', label: 'Second Chance' },
  { value: 'FORBIDDEN', label: 'Forbidden' },
  { value: 'HISTORICAL', label: 'Historical' },
] as const

export type GenreValue = (typeof GENRES)[number]['value']

export const DEFAULT_GENRE: GenreValue = 'CONTEMPORARY'
