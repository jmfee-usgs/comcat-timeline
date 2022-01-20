import { useEffect, useState } from "react";

export interface FetchProps {
  url?: string;
}

export interface FetchState<T> {
  error?: Error;
  data?: T;
  loading?: boolean;
}

/**
 * Hook to load JSON data from url.
 *
 * @param props.url
 *     URL with JSON data.
 * @returns
 *     fetch state with:
 *         data if loaded,
 *         error if errors occurred loading,
 *         loading flag.
 */
export function useFetch<T>({ url }: FetchProps): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({});

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function loadData() {
      // no data to load
      if (!url) {
        return;
      }

      setState({ loading: true });

      fetch(url, { signal })
        .then((response) => response.json())
        .then((data) => {
          if (!signal.aborted) {
            setState({ data: data as T });
          }
        })
        .catch((e) => {
          if (!signal.aborted) {
            setState({ error: e });
          }
        });
    }
    loadData();

    // method called if render cancelled
    return () => {
      controller.abort();
    };
  }, [url]);

  return state;
}
