"use client"

import { useState, useEffect, useCallback } from "react"

interface Provincia {
  id: string
  nombre: string
}

interface Municipio {
  id: string
  nombre: string
}

interface GeorefProvinciasResponse {
  provincias: Provincia[]
}

interface GeorefMunicipiosResponse {
  municipios: Municipio[]
}

interface GeorefLocalidadesResponse {
  localidades: { id: string; nombre: string }[]
}

const GEOREF_BASE_URL = "https://apis.datos.gob.ar/georef/api"

export function useArgentinaGeo(selectedProvincia?: string) {
  const [provincias, setProvincias] = useState<Provincia[]>([])
  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [isLoadingProvincias, setIsLoadingProvincias] = useState(true)
  const [isLoadingMunicipios, setIsLoadingMunicipios] = useState(false)
  const [errorProvincias, setErrorProvincias] = useState<string | null>(null)
  const [errorMunicipios, setErrorMunicipios] = useState<string | null>(null)

  // Fetch provincias on mount
  useEffect(() => {
    const fetchProvincias = async () => {
      setIsLoadingProvincias(true)
      setErrorProvincias(null)

      try {
        const response = await fetch(`${GEOREF_BASE_URL}/provincias?orden=nombre&max=100`)

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const data: GeorefProvinciasResponse = await response.json()
        setProvincias(data.provincias || [])
      } catch (error) {
        console.error("Error fetching provincias:", error)
        setErrorProvincias("No se pudieron cargar las provincias")
        // Fallback to static list if API fails
        setProvincias([
          { id: "1", nombre: "Buenos Aires" },
          { id: "2", nombre: "Catamarca" },
          { id: "3", nombre: "Chaco" },
          { id: "4", nombre: "Chubut" },
          { id: "5", nombre: "Ciudad Autónoma de Buenos Aires" },
          { id: "6", nombre: "Córdoba" },
          { id: "7", nombre: "Corrientes" },
          { id: "8", nombre: "Entre Ríos" },
          { id: "9", nombre: "Formosa" },
          { id: "10", nombre: "Jujuy" },
          { id: "11", nombre: "La Pampa" },
          { id: "12", nombre: "La Rioja" },
          { id: "13", nombre: "Mendoza" },
          { id: "14", nombre: "Misiones" },
          { id: "15", nombre: "Neuquén" },
          { id: "16", nombre: "Río Negro" },
          { id: "17", nombre: "Salta" },
          { id: "18", nombre: "San Juan" },
          { id: "19", nombre: "San Luis" },
          { id: "20", nombre: "Santa Cruz" },
          { id: "21", nombre: "Santa Fe" },
          { id: "22", nombre: "Santiago del Estero" },
          { id: "23", nombre: "Tierra del Fuego, Antártida e Islas del Atlántico Sur" },
          { id: "24", nombre: "Tucumán" },
        ])
      } finally {
        setIsLoadingProvincias(false)
      }
    }

    fetchProvincias()
  }, [])

  const fetchMunicipios = useCallback(async (provincia: string) => {
    if (!provincia) {
      setMunicipios([])
      return
    }

    setIsLoadingMunicipios(true)
    setErrorMunicipios(null)
    setMunicipios([])

    try {
      const encodedProvincia = encodeURIComponent(provincia)
      const response = await fetch(`${GEOREF_BASE_URL}/municipios?provincia=${encodedProvincia}&orden=nombre&max=1000`)

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data: GeorefMunicipiosResponse = await response.json()

      // If no municipios found, try with localidades as fallback
      if (!data.municipios || data.municipios.length === 0) {
        const localidadesResponse = await fetch(
          `${GEOREF_BASE_URL}/localidades?provincia=${encodedProvincia}&orden=nombre&max=1000`,
        )
        if (localidadesResponse.ok) {
          const localidadesData: GeorefLocalidadesResponse = await localidadesResponse.json()
          setMunicipios(localidadesData.localidades || [])
        }
      } else {
        setMunicipios(data.municipios)
      }
    } catch (error) {
      console.error("Error fetching municipios:", error)
      setErrorMunicipios("No se pudieron cargar los municipios")
    } finally {
      setIsLoadingMunicipios(false)
    }
  }, [])

  useEffect(() => {
    if (selectedProvincia) {
      fetchMunicipios(selectedProvincia)
    } else {
      setMunicipios([])
    }
  }, [selectedProvincia, fetchMunicipios])

  return {
    provincias,
    municipios,
    isLoadingProvincias,
    isLoadingMunicipios,
    // Keep old names for backwards compatibility
    loadingProvincias: isLoadingProvincias,
    loadingMunicipios: isLoadingMunicipios,
    errorProvincias,
    errorMunicipios,
    fetchMunicipios,
  }
}
