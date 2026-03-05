import {
  keepPreviousData,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { getUsers, getUser, updateUserStatus } from "@/api/user";
import { UserFilters, UpdateUserStatusRequest } from "@/types/user";
import { ApiErrorResponse } from "@/types/api";

export function useUsers(filters?: UserFilters) {
  const query = useQuery({
    queryKey: ["users", filters],
    queryFn: () => getUsers(filters),
    placeholderData: keepPreviousData,
  });

  return {
    users: query.data?.data.data ?? [],
    pagination: query.data?.data.pagination,
    isLoading: query.isLoading,
    error: query.error as ApiErrorResponse | null,
    refetch: query.refetch,
    isError: query.isError,
  };
}

export function useUser(userId: string | null) {
  const query = useQuery({
    queryKey: ["users", userId],
    queryFn: () => getUser(userId!),
    enabled: !!userId,
  });

  return {
    user: query.data?.data,
    isLoading: query.isLoading,
    error: query.error as ApiErrorResponse | null,
    isError: query.isError,
  };
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: UpdateUserStatusRequest;
    }) => updateUserStatus(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
