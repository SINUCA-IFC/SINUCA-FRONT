import countries from '@/data/countries.json'

// Source: https://github.com/mledoze/countries (ODbL-1.0), snapshot 2026-11-22.
// Includes countries and territories; names are the source's Portuguese translations.
export const normalizeCountryName = (value = '') =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('pt-BR')
    .trim()

export const countryCatalog = [...countries].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))

export function searchCountries(query, registered = []) {
  const names = new Set(registered.map((country) => normalizeCountryName(country.name)))
  const search = normalizeCountryName(query)
  return countryCatalog.filter(
    (country) =>
      !names.has(normalizeCountryName(country.name)) &&
      normalizeCountryName(`${country.name} ${country.political_name} ${country.code}`).includes(
        search,
      ),
  )
}
