export function normalize(text: string, lang: 'en' | 'he'): string {
  return lang === 'he' ? text.trim() : text.trim().toLowerCase()
}
