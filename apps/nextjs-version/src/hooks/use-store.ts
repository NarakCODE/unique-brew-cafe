import { useQuery } from "@tanstack/react-query";
import { getStore } from "@/api/store";

export function useStore(id: string) {
  const query = useQuery({
    queryKey: ["store", id],
    queryFn: () => getStore(id),
    enabled: !!id,
  });

  return {
    store: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}
