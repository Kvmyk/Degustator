import { useState, useCallback, useRef, useEffect } from 'react';
import { API_URL } from '@env';

interface SearchResult {
  id: string;
  name?: string;
  title?: string;
  [key: string]: any;
}

export const useSearch = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const abortController = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      abortController.current?.abort();
    };
  }, []);

  const search = useCallback(
    async (query: string, endpoint: 'posts' | 'users') => {
      // Koniec timeoutu jeśli istnieje
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Jeśli query jest za krótki, wyczyść
      if (!query || query.trim().length < 2) {
        setResults([]);
        setError(null);
        setLoading(false);
        return;
      }

      // Debounce na 500ms
      debounceTimer.current = setTimeout(async () => {
        try {
          setLoading(true);
          setError(null);

          // Abort poprzednie requesty
          abortController.current?.abort();
          abortController.current = new AbortController();

          const url = `${API_URL}/api/search/${endpoint}?query=${encodeURIComponent(
            query.trim()
          )}&limit=20`;

          console.log('📡 Fetching:', url);

          const response = await fetch(url, {
            signal: abortController.current.signal,
          });

          if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
          }

          const data = await response.json();
          console.log('✅ Results:', data.data);

          setResults(data.data || []);
        } catch (err: any) {
          if (err.name !== 'AbortError') {
            console.error('❌ Search error:', err);
            setError(err.message || 'Search failed');
          }
        } finally {
          setLoading(false);
        }
      }, 500);
    },
    []
  );

  const clear = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    abortController.current?.abort();
    setResults([]);
    setError(null);
    setLoading(false);
  }, []);

  return { results, loading, error, search, clear };
};