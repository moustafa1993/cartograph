-- Development rows for two Clerk organizations, so switching organization
-- visibly changes the dashboard. Every analysis is queued and older than the
-- stale threshold: nothing here pretends to be a finished map, and each one
-- can be re-run from its page into a real one. Fixed ids make re-running
-- this a no-op.

insert into public.organizations (id) values
  ('org_3KadFiVcFTEfd3pcjSbFuQMhaH5'),
  ('org_3KcyAC8HLqRW8DLSzsuvFrsLbH2')
on conflict (id) do nothing;

insert into public.projects (id, organization_id, repo_owner, repo_name) values
  ('00000000-0000-4000-8000-0000000000a1', 'org_3KadFiVcFTEfd3pcjSbFuQMhaH5', 'shadcn-ui', 'taxonomy'),
  ('00000000-0000-4000-8000-0000000000a2', 'org_3KadFiVcFTEfd3pcjSbFuQMhaH5', 'pmndrs', 'zustand'),
  ('00000000-0000-4000-8000-0000000000b1', 'org_3KcyAC8HLqRW8DLSzsuvFrsLbH2', 'react-hook-form', 'react-hook-form')
on conflict (id) do nothing;

insert into public.analyses (id, organization_id, project_id, created_at) values
  ('00000000-0000-4000-8000-00000000a001', 'org_3KadFiVcFTEfd3pcjSbFuQMhaH5',
   '00000000-0000-4000-8000-0000000000a1', now() - interval '1 hour'),
  ('00000000-0000-4000-8000-00000000a002', 'org_3KadFiVcFTEfd3pcjSbFuQMhaH5',
   '00000000-0000-4000-8000-0000000000a2', now() - interval '2 hours'),
  ('00000000-0000-4000-8000-00000000b001', 'org_3KcyAC8HLqRW8DLSzsuvFrsLbH2',
   '00000000-0000-4000-8000-0000000000b1', now() - interval '1 hour')
on conflict (id) do nothing;
