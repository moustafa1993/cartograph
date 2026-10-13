-- Development rows only: nothing creates a real analysis yet. Two Clerk
-- organizations from the development instance, each with analyses in every
-- state, so switching organization visibly changes the dashboard. Fixed ids
-- make re-running this a no-op.

insert into public.organizations (id, name) values
  ('org_3KadFiVcFTEfd3pcjSbFuQMhaH5', 'Moustafa''s Organization'),
  ('org_3KcyAC8HLqRW8DLSzsuvFrsLbH2', 'Seed Org B')
on conflict (id) do nothing;

insert into public.analyses
  (id, organization_id, repository, commit_sha, status, error, created_by, created_at, finished_at)
values
  ('00000000-0000-4000-8000-00000000a001', 'org_3KadFiVcFTEfd3pcjSbFuQMhaH5',
   'vercel/next.js', null, 'parsing', null,
   'user_3KadFfGrsq9MXAuo3unXB0pQjXq', now() - interval '4 minutes', null),
  ('00000000-0000-4000-8000-00000000a002', 'org_3KadFiVcFTEfd3pcjSbFuQMhaH5',
   'shadcn-ui/taxonomy', 'ab12cd34ef56ab12cd34ef56ab12cd34ef56ab12', 'ready', null,
   'user_3KadFfGrsq9MXAuo3unXB0pQjXq', now() - interval '3 hours', now() - interval '3 hours' + interval '41 seconds'),
  ('00000000-0000-4000-8000-00000000a003', 'org_3KadFiVcFTEfd3pcjSbFuQMhaH5',
   'seed-example/does-not-exist', null, 'failed', 'Repository not found or not public',
   'user_3KadFfGrsq9MXAuo3unXB0pQjXq', now() - interval '2 days', now() - interval '2 days' + interval '2 seconds'),
  ('00000000-0000-4000-8000-00000000b001', 'org_3KcyAC8HLqRW8DLSzsuvFrsLbH2',
   'nestjs/nest', null, 'queued', null,
   'user_3KadFfGrsq9MXAuo3unXB0pQjXq', now() - interval '30 seconds', null),
  ('00000000-0000-4000-8000-00000000b002', 'org_3KcyAC8HLqRW8DLSzsuvFrsLbH2',
   'facebook/docusaurus', 'cd34ef56ab12cd34ef56ab12cd34ef56ab12cd34', 'ready', null,
   'user_3KadFfGrsq9MXAuo3unXB0pQjXq', now() - interval '6 days', now() - interval '6 days' + interval '2 minutes')
on conflict (id) do nothing;
