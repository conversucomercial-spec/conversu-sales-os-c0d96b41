import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications.functions";

export const NOTIFICATIONS_QUERY_KEY = ["notifications"] as const;

/** Caixa de notificações persistida no banco, com contador de não lidas. */
export function useNotifications() {
  const fetchAll = useServerFn(listNotifications);
  const markRead = useServerFn(markNotificationRead);
  const markAll = useServerFn(markAllNotificationsRead);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: () => fetchAll(),
    refetchOnWindowFocus: true,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });

  const read = useMutation({
    mutationFn: (id: string) => markRead({ data: { id } }),
    onSuccess: refresh,
  });
  const readAll = useMutation({ mutationFn: () => markAll(), onSuccess: refresh });

  const items = query.data ?? [];
  return {
    items,
    isLoading: query.isLoading,
    unread: items.filter((n) => !n.readAt).length,
    markRead: read.mutate,
    markAllRead: readAll.mutate,
  };
}
