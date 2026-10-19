create table public.reports (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
 created_at timestamptz not null default now(),
 data jsonb not null,
 content text not null,
 constraint report_required check (data ?& array['processo','interessado','municipio','data','objetivo','observacoes'])
);
create index reports_user_created on public.reports(user_id,created_at desc);
alter table public.reports enable row level security;
grant select,insert,update,delete on public.reports to authenticated;
revoke all on public.reports from anon;
create policy reports_select on public.reports for select to authenticated using ((select auth.uid())=user_id);
create policy reports_insert on public.reports for insert to authenticated with check ((select auth.uid())=user_id);
create policy reports_update on public.reports for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy reports_delete on public.reports for delete to authenticated using ((select auth.uid())=user_id);
insert into storage.buckets(id,name,public,file_size_limit) values('evidencias','evidencias',false,20971520);
create policy evidence_select on storage.objects for select to authenticated using(bucket_id='evidencias' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy evidence_insert on storage.objects for insert to authenticated with check(bucket_id='evidencias' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy evidence_delete on storage.objects for delete to authenticated using(bucket_id='evidencias' and (storage.foldername(name))[1]=(select auth.uid())::text);
