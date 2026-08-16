REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.grant_owner_admin_role() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.notify_opportunity_event() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.documents_source_guard() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.prospecting_events_guard() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;