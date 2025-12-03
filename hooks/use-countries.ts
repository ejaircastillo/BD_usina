"use client"

import { useState, useEffect } from "react"

interface Country {
  name: string
  nameSpanish: string
}

interface UseCountriesReturn {
  countries: Country[]
  isLoading: boolean
  error: string | null
}

// Fallback list of common countries in Spanish (used if API fails)
const FALLBACK_COUNTRIES = [
  "Afganistán",
  "Albania",
  "Alemania",
  "Andorra",
  "Angola",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaiyán",
  "Bangladesh",
  "Bélgica",
  "Belice",
  "Benín",
  "Bielorrusia",
  "Bolivia",
  "Bosnia y Herzegovina",
  "Brasil",
  "Bulgaria",
  "Camboya",
  "Camerún",
  "Canadá",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Corea del Norte",
  "Corea del Sur",
  "Costa Rica",
  "Croacia",
  "Cuba",
  "Dinamarca",
  "Ecuador",
  "Egipto",
  "El Salvador",
  "Emiratos Árabes Unidos",
  "Eslovaquia",
  "Eslovenia",
  "España",
  "Estados Unidos",
  "Estonia",
  "Etiopía",
  "Filipinas",
  "Finlandia",
  "Francia",
  "Georgia",
  "Ghana",
  "Grecia",
  "Guatemala",
  "Haití",
  "Honduras",
  "Hungría",
  "India",
  "Indonesia",
  "Irak",
  "Irán",
  "Irlanda",
  "Islandia",
  "Israel",
  "Italia",
  "Jamaica",
  "Japón",
  "Jordania",
  "Kazajistán",
  "Kenia",
  "Kuwait",
  "Letonia",
  "Líbano",
  "Libia",
  "Lituania",
  "Luxemburgo",
  "Macedonia del Norte",
  "Malasia",
  "Marruecos",
  "México",
  "Moldavia",
  "Mónaco",
  "Mongolia",
  "Montenegro",
  "Mozambique",
  "Nepal",
  "Nicaragua",
  "Nigeria",
  "Noruega",
  "Nueva Zelanda",
  "Países Bajos",
  "Pakistán",
  "Panamá",
  "Paraguay",
  "Perú",
  "Polonia",
  "Portugal",
  "Reino Unido",
  "República Checa",
  "República Dominicana",
  "Rumania",
  "Rusia",
  "Senegal",
  "Serbia",
  "Singapur",
  "Siria",
  "Sudáfrica",
  "Suecia",
  "Suiza",
  "Tailandia",
  "Taiwán",
  "Tanzania",
  "Túnez",
  "Turquía",
  "Ucrania",
  "Uganda",
  "Uruguay",
  "Venezuela",
  "Vietnam",
  "Yemen",
]

export function useCountries(): UseCountriesReturn {
  const [countries, setCountries] = useState<Country[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCountries = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch("https://restcountries.com/v3.1/all?fields=name,translations")

        if (!response.ok) {
          throw new Error("Error al cargar países")
        }

        const data = await response.json()

        const countryList: Country[] = data
          .map((country: any) => ({
            name: country.name?.common || "",
            nameSpanish: country.translations?.spa?.common || country.name?.common || "",
          }))
          .filter((c: Country) => c.nameSpanish)
          .sort((a: Country, b: Country) => a.nameSpanish.localeCompare(b.nameSpanish, "es"))

        setCountries(countryList)
      } catch (err) {
        console.error("Error fetching countries:", err)
        setError("No se pudieron cargar los países. Usando lista local.")
        // Use fallback list
        setCountries(FALLBACK_COUNTRIES.map((name) => ({ name, nameSpanish: name })))
      } finally {
        setIsLoading(false)
      }
    }

    fetchCountries()
  }, [])

  return { countries, isLoading, error }
}
