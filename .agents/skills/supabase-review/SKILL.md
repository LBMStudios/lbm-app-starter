---
name: supabase-review
description: Review Supabase schema, auth, RLS, SSR clients, and migrations before shipping.
---

# Supabase review

1. Identify every table, storage bucket, function, and role touched by the change.
2. Confirm RLS is enabled and policies express the intended owner/member/admin boundaries.
3. Confirm Data API grants are explicit. Test unauthenticated and cross-tenant access.
4. Use publishable credentials in clients. Keep service-role use server-only and minimal.
5. For server identity, verify with `auth.getClaims()`; do not authorize from unverified session data.
6. Review migrations for safe forward and rollback paths, then report concrete risks.
