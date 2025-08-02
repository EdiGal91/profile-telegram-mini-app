import { useEffect, useState } from "react";
import { api } from "../services/api";
import { LocationsResponse, LocationCountry, LocationCity } from "../types/api";

export function useLocations() {
  const [data, setData] = useState<LocationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get<LocationsResponse>("/telegram/profiles/locations")
      .then((res) => {
        if (!cancelled) {
          setData(res.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Helpers
  const getCountriesForEscort = (): LocationCountry[] =>
    data?.countries.filter((c) => c.forEscort) ?? [];

  const getCountriesForClient = (): LocationCountry[] =>
    data?.countries.filter((c) => c.forClient) ?? [];

  const getCitiesForCountry = (iso: string): LocationCity[] =>
    data?.countries.find((c) => c.iso === iso)?.cities ?? [];

  return {
    data,
    loading,
    error,
    getCountriesForEscort,
    getCountriesForClient,
    getCitiesForCountry,
  };
}
