
create table public.church_entries (
 id uuid primary key default gen_random_uuid(),
 kind text not null check(kind in ('album','event')),
 title text not null check(char_length(trim(title)) between 1 and 120),
 description text not null default '' check(char_length(description)<=3000),
 date timestamptz,
 location text not null default '' check(char_length(location)<=240),
 status text not null default 'draft' check(status in ('draft','published','ended','archived')),
 created_by uuid default auth.uid() references auth.users(id) on delete set null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check(kind <> 'event' or (date is not null and char_length(trim(location))>0))
);
create index church_entries_status_created on public.church_entries(status,created_at desc);
create index church_entries_creator on public.church_entries(created_by);
create table public.church_photos (
 id uuid primary key default gen_random_uuid(),
 entry_id uuid not null references public.church_entries(id) on delete cascade,
 object_key text not null unique,
 mime text not null check(mime in ('image/jpeg','image/png','image/webp')),
 size integer not null check(size>0 and size<=8388608),
 caption text not null default '' check(char_length(caption)<=240),
 sort_order integer not null default 0,
 created_at timestamptz not null default now(),
 check(object_key = entry_id::text || '/' || id::text)
);
create index church_photos_entry_order on public.church_photos(entry_id,sort_order,created_at,id);
create table public.church_settings (
 id text primary key check(id='church'),
 value jsonb not null check(jsonb_typeof(value)='object')
);
alter table public.church_entries enable row level security;
alter table public.church_photos enable row level security;
alter table public.church_settings enable row level security;
revoke all on public.church_entries,public.church_photos,public.church_settings from anon,authenticated;
grant select on public.church_entries,public.church_photos to anon,authenticated;
grant insert on public.church_entries,public.church_photos to authenticated;
grant update(title,description,date,location,status) on public.church_entries to authenticated;
grant update(caption,sort_order) on public.church_photos to authenticated;
grant delete on public.church_photos to authenticated;
grant select,insert,update on public.church_settings to authenticated;
grant all on public.church_entries,public.church_photos,public.church_settings to service_role;

create policy entries_public on public.church_entries for select to anon using(status in ('published','ended'));
create policy entries_read on public.church_entries for select to authenticated using(status in ('published','ended') or exists(select 1 from church_private.current_account()));
create policy entries_insert on public.church_entries for insert to authenticated with check(created_by=(select auth.uid()) and exists(select 1 from church_private.current_account()));
create policy entries_update on public.church_entries for update to authenticated using(exists(select 1 from church_private.current_account())) with check(exists(select 1 from church_private.current_account()));
create policy photos_public on public.church_photos for select to anon using(exists(select 1 from public.church_entries e where e.id=entry_id and e.status in ('published','ended')));
create policy photos_read on public.church_photos for select to authenticated using(exists(select 1 from public.church_entries e where e.id=entry_id));
create policy photos_insert on public.church_photos for insert to authenticated with check(exists(select 1 from church_private.current_account()));
create policy photos_update on public.church_photos for update to authenticated using(exists(select 1 from church_private.current_account())) with check(exists(select 1 from church_private.current_account()));
create policy photos_delete on public.church_photos for delete to authenticated using(exists(select 1 from church_private.current_account()));
create policy settings_read on public.church_settings for select to authenticated using(exists(select 1 from church_private.current_account() a where a.role='owner'));
create policy settings_insert on public.church_settings for insert to authenticated with check(exists(select 1 from church_private.current_account() a where a.role='owner'));
create policy settings_update on public.church_settings for update to authenticated using(exists(select 1 from church_private.current_account() a where a.role='owner')) with check(exists(select 1 from church_private.current_account() a where a.role='owner'));

-- Serialize photo inserts and enforce the limit even for concurrent requests.
create function church_private.validate_photo() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 perform 1 from public.church_entries where id=new.entry_id for update;
 if not found then raise exception 'Publicação não encontrada'; end if;
 if (select count(*) from public.church_photos where entry_id=new.entry_id)>=40 then raise exception 'Cada publicação permite até 40 fotos' using errcode='23514'; end if;
 select coalesce(max(sort_order),-1)+1 into new.sort_order from public.church_photos where entry_id=new.entry_id;
 return new;
end;
$$;
revoke all on function church_private.validate_photo() from public,anon,authenticated;
create trigger validate_photo before insert on public.church_photos for each row execute function church_private.validate_photo();
create function church_private.validate_entry() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if tg_op='UPDATE' and old.kind<>new.kind then raise exception 'O tipo não pode mudar' using errcode='23514'; end if;
 if new.kind='album' and new.status='published' and not exists(select 1 from public.church_photos where entry_id=new.id) then raise exception 'Adicione uma foto antes de publicar' using errcode='23514'; end if;
 new.updated_at=now();
 return new;
end;
$$;
revoke all on function church_private.validate_entry() from public,anon,authenticated;
create trigger validate_entry before insert or update on public.church_entries for each row execute function church_private.validate_entry();

create function public.church_reorder_photos(target_entry uuid, items jsonb)
returns void language plpgsql security invoker set search_path='' as $$
declare total integer;
begin
 if not exists(select 1 from church_private.current_account()) then raise exception 'Acesso negado' using errcode='42501'; end if;
 perform 1 from public.church_entries where id=target_entry for update;
 if not found then raise exception 'Publicação não encontrada'; end if;
 if jsonb_typeof(items)<>'array' or jsonb_array_length(items)>40 then raise exception 'Lista inválida' using errcode='23514'; end if;
 select count(*) into total from public.church_photos where entry_id=target_entry;
 if total<>jsonb_array_length(items)
 or (select count(distinct x->>'id') from jsonb_array_elements(items) x)<>total
 or exists(select 1 from jsonb_array_elements(items) x where jsonb_typeof(x->'caption') is distinct from 'string' or char_length(x->>'caption')>240 or not exists(select 1 from public.church_photos p where p.entry_id=target_entry and p.id::text=x->>'id'))
 then raise exception 'A lista de fotos mudou. Reabra a edição' using errcode='40001'; end if;
 update public.church_photos p set caption=x.item->>'caption',sort_order=x.n-1
 from jsonb_array_elements(items) with ordinality x(item,n)
 where p.entry_id=target_entry and p.id::text=x.item->>'id';
end;
$$;
revoke all on function public.church_reorder_photos(uuid,jsonb) from public,anon;
grant execute on function public.church_reorder_photos(uuid,jsonb) to authenticated;

-- Public readers receive sanitized settings, never an unpublished notice.
create function church_private.public_settings() returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
 select value into result from public.church_settings where id='church';
 if result is null then return null; end if;
 if coalesce((result#>>'{notice,enabled}')::boolean,false)=false or
 (nullif(result#>>'{notice,expiresAt}','') is not null and (result#>>'{notice,expiresAt}')::timestamptz<=now())
 then result=jsonb_set(result,'{notice}','{"enabled":false,"title":"","message":"","expiresAt":""}'::jsonb); end if;
 return result;
end;
$$;
revoke all on function church_private.public_settings() from public;
grant usage on schema church_private to anon;
grant execute on function church_private.public_settings() to anon,authenticated;
create function public.church_public_settings() returns jsonb language sql stable security invoker set search_path='' as $$select church_private.public_settings();$$;
revoke all on function public.church_public_settings() from public;
grant execute on function public.church_public_settings() to anon,authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('church-photos','church-photos',false,8388608,array['image/jpeg','image/png','image/webp']);
create policy church_media_public on storage.objects for select to anon using(
 bucket_id='church-photos' and exists(select 1 from public.church_photos p join public.church_entries e on e.id=p.entry_id where p.object_key=name and e.status in ('published','ended')));
create policy church_media_read on storage.objects for select to authenticated using(
 bucket_id='church-photos' and (exists(select 1 from church_private.current_account()) or exists(select 1 from public.church_photos p join public.church_entries e on e.id=p.entry_id where p.object_key=name and e.status in ('published','ended'))));
create policy church_media_upload on storage.objects for insert to authenticated with check(
 bucket_id='church-photos' and exists(select 1 from church_private.current_account())
 and exists(select 1 from public.church_entries e where e.id::text=split_part(name,'/',1))
 and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}$');
create policy church_media_delete on storage.objects for delete to authenticated using(bucket_id='church-photos' and exists(select 1 from church_private.current_account()));

create table church_private.request_limits (
 user_id uuid not null references auth.users(id) on delete cascade,
 action text not null,
 count integer not null,
 expires_at timestamptz not null,
 primary key(user_id,action)
);
alter table church_private.request_limits enable row level security;
revoke all on church_private.request_limits from public,anon,authenticated;
create function church_private.consume_limit(action_name text) returns boolean language plpgsql security definer set search_path='' as $$
declare amount integer; threshold integer;
begin
 if not exists(select 1 from church_private.current_account()) then return false; end if;
 threshold=case action_name when 'password' then 8 when 'invite' then 20 when 'users' then 40 else 0 end;
 if threshold=0 then return false; end if;
 insert into church_private.request_limits(user_id,action,count,expires_at) values(auth.uid(),action_name,1,now()+interval '15 minutes')
 on conflict(user_id,action) do update set count=case when request_limits.expires_at<=now() then 1 else request_limits.count+1 end,
 expires_at=case when request_limits.expires_at<=now() then now()+interval '15 minutes' else request_limits.expires_at end
 returning count into amount;
 return amount<=threshold;
end;
$$;
revoke all on function church_private.consume_limit(text) from public,anon;
grant execute on function church_private.consume_limit(text) to authenticated;
create function public.church_consume_limit(action_name text) returns boolean language sql security invoker set search_path='' as $$select church_private.consume_limit(action_name);$$;
revoke all on function public.church_consume_limit(text) from public,anon;
grant execute on function public.church_consume_limit(text) to authenticated;

