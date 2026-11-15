-- Execute no SQL Editor do projeto da igreja, depois de cadastrar church_members.
-- Não apaga contas nem altera senhas. Pode ser executado novamente.
begin;
create schema if not exists church_private;
revoke all on schema church_private from public, anon;
grant usage on schema church_private to authenticated;

create or replace function church_private.current_account()
returns table(user_id uuid, name text, role text)
language sql stable security definer set search_path = '' as $$
 select m.user_id, m.name, m.role
 from public.church_members m
 join auth.users u on u.id = m.user_id
 where m.user_id = auth.uid() and m.enabled and u.email_confirmed_at is not null
 and exists (
   select 1 from auth.sessions s
   where s.user_id = auth.uid()
     and s.id::text = (auth.jwt()->>'session_id')
     and (s.not_after is null or s.not_after > now())
 );
$$;
revoke all on function church_private.current_account() from public, anon;
grant execute on function church_private.current_account() to authenticated;

create or replace function public.church_current_account()
returns table(user_id uuid, name text, role text)
language sql stable security invoker set search_path = '' as $$
 select * from church_private.current_account();
$$;
revoke all on function public.church_current_account() from public, anon;
grant execute on function public.church_current_account() to authenticated;

create or replace function church_private.list_members()
returns table(id uuid, email text, name text, role text, enabled boolean)
language plpgsql stable security definer set search_path = '' as $$
begin
 if not exists(select 1 from church_private.current_account() a where a.role='owner') then
  raise exception 'Acesso restrito ao administrador' using errcode='42501';
 end if;
 return query select m.user_id,u.email::text,m.name,m.role,m.enabled
 from public.church_members m join auth.users u on u.id=m.user_id order by m.created_at;
end;
$$;
revoke all on function church_private.list_members() from public, anon;
grant execute on function church_private.list_members() to authenticated;
create or replace function public.church_list_members()
returns table(id uuid,email text,name text,role text,enabled boolean)
language sql stable security invoker set search_path = '' as $$
 select * from church_private.list_members();
$$;
revoke all on function public.church_list_members() from public, anon;
grant execute on function public.church_list_members() to authenticated;

create or replace function church_private.authorize_editor(editor_email text, editor_name text)
returns void language plpgsql security definer set search_path = '' as $$
declare target uuid;
begin
 if not exists(select 1 from church_private.current_account() a where a.role='owner') then
  raise exception 'Acesso restrito ao administrador' using errcode='42501';
 end if;
 if char_length(trim(editor_name)) not between 1 and 80 then raise exception 'Nome inválido'; end if;
 select u.id into target from auth.users u where lower(u.email)=lower(trim(editor_email));
 if target is null then raise exception 'Cadastre a conta em Authentication / Users antes de autorizar'; end if;
 insert into public.church_members(user_id,name,role,enabled) values(target,trim(editor_name),'editor',true);
end;
$$;
revoke all on function church_private.authorize_editor(text,text) from public, anon;
grant execute on function church_private.authorize_editor(text,text) to authenticated;
create or replace function public.church_authorize_editor(editor_email text, editor_name text)
returns void language sql security invoker set search_path = '' as $$
 select church_private.authorize_editor(editor_email,editor_name);
$$;
revoke all on function public.church_authorize_editor(text,text) from public, anon;
grant execute on function public.church_authorize_editor(text,text) to authenticated;

create or replace function church_private.set_editor_access(editor_id uuid, allow_access boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
 if not exists(select 1 from church_private.current_account() a where a.role='owner') then
  raise exception 'Acesso restrito ao administrador' using errcode='42501';
 end if;
 update public.church_members set enabled=allow_access where user_id=editor_id and role='editor';
 if not found then raise exception 'Conta de editora não encontrada'; end if;
 -- Reativar uma conta não deve reativar suas sessões antigas.
 delete from auth.sessions where user_id=editor_id;
end;
$$;
revoke all on function church_private.set_editor_access(uuid,boolean) from public, anon;
grant execute on function church_private.set_editor_access(uuid,boolean) to authenticated;
create or replace function public.church_set_editor_access(editor_id uuid, allow_access boolean)
returns void language sql security invoker set search_path = '' as $$
 select church_private.set_editor_access(editor_id,allow_access);
$$;
revoke all on function public.church_set_editor_access(uuid,boolean) from public, anon;
grant execute on function public.church_set_editor_access(uuid,boolean) to authenticated;
commit;

-- Resultado esperado: quatro funções; anon_execute=false; authenticated_execute=true.
select p.proname,
 has_function_privilege('anon',p.oid,'execute') as anon_execute,
 has_function_privilege('authenticated',p.oid,'execute') as authenticated_execute
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname in
 ('church_current_account','church_list_members','church_authorize_editor','church_set_editor_access')
order by p.proname;
