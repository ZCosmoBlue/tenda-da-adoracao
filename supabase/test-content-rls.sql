
begin;
do $$
declare u uuid:=gen_random_uuid(); s uuid:=gen_random_uuid(); outsider uuid:=gen_random_uuid(); os uuid:=gen_random_uuid();
begin
 perform set_config('test.editor',u::text,true);perform set_config('test.session',s::text,true);
 perform set_config('test.outsider',outsider::text,true);perform set_config('test.outsession',os::text,true);
 perform set_config('test.entry',gen_random_uuid()::text,true);perform set_config('test.photo',gen_random_uuid()::text,true);
 insert into auth.users(id,email,email_confirmed_at) values(u,'migration-'||u||'@example.invalid',now()),(outsider,'migration-'||outsider||'@example.invalid',now());
 insert into auth.sessions(id,user_id) values(s,u),(os,outsider);
 insert into public.church_members(user_id,name,role) values(u,'Temporary rollback-only editor','editor');
end $$;
set local role authenticated;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.editor'),'session_id',current_setting('test.session'),'role','authenticated')::text,true);
do $$
declare e uuid:=current_setting('test.entry')::uuid; p uuid:=current_setting('test.photo')::uuid; n integer; extra uuid;
begin
 if (select role from public.church_current_account())<>'editor' then raise exception 'Editor membership failed'; end if;
 insert into public.church_entries(id,kind,title) values(e,'album','Rollback-only test');
 begin
  update public.church_entries set status='published' where id=e;
  raise exception 'FAIL: empty album published';
 exception when check_violation then null; end;
 insert into public.church_photos(id,entry_id,object_key,mime,size) values(p,e,e||'/'||p,'image/png',68);
 insert into storage.objects(bucket_id,name) values('church-photos',e||'/'||p);
 begin
  perform public.church_reorder_photos(e,'[]'::jsonb);
  raise exception 'FAIL: incomplete reorder accepted';
 exception when serialization_failure then null; end;
 perform public.church_reorder_photos(e,jsonb_build_array(jsonb_build_object('id',p,'caption','Verified caption')));
 if (select caption from public.church_photos where id=p)<>'Verified caption' then raise exception 'Caption was not saved'; end if;
 for n in 2..40 loop
  extra=gen_random_uuid();
  insert into public.church_photos(id,entry_id,object_key,mime,size) values(extra,e,e||'/'||extra,'image/png',68);
 end loop;
 begin
  extra=gen_random_uuid();
  insert into public.church_photos(id,entry_id,object_key,mime,size) values(extra,e,e||'/'||extra,'image/png',68);
  raise exception 'FAIL: photo cap bypassed';
 exception when check_violation then null; end;
 begin
  insert into public.church_settings(id,value) values('church','{}');
  raise exception 'FAIL: editor can write settings';
 exception when insufficient_privilege then null; end;
 begin
  perform public.church_list_members();
  raise exception 'FAIL: editor can list accounts';
 exception when insufficient_privilege then null; end;
end $$;
set local role anon;
select set_config('request.jwt.claims','{"role":"anon"}',true);
do $$begin
 if exists(select 1 from public.church_entries where id=current_setting('test.entry')::uuid) then raise exception 'Draft entry leaked'; end if;
 if exists(select 1 from public.church_photos where entry_id=current_setting('test.entry')::uuid) then raise exception 'Draft metadata leaked'; end if;
 if exists(select 1 from storage.objects where bucket_id='church-photos' and name=current_setting('test.entry')||'/'||current_setting('test.photo')) then raise exception 'Draft storage leaked'; end if;
end $$;
set local role authenticated;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.editor'),'session_id',current_setting('test.session'),'role','authenticated')::text,true);
update public.church_entries set status='published' where id=current_setting('test.entry')::uuid;
set local role anon;
select set_config('request.jwt.claims','{"role":"anon"}',true);
do $$begin
 if not exists(select 1 from public.church_entries where id=current_setting('test.entry')::uuid) then raise exception 'Published entry hidden'; end if;
 if not exists(select 1 from storage.objects where bucket_id='church-photos' and name=current_setting('test.entry')||'/'||current_setting('test.photo')) then raise exception 'Published storage hidden'; end if;
 begin
  insert into public.church_entries(kind,title) values('album','Unauthorized');
  raise exception 'FAIL: anonymous write allowed';
 exception when insufficient_privilege then null; end;
end $$;
set local role authenticated;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.outsider'),'session_id',current_setting('test.outsession'),'role','authenticated','user_metadata',json_build_object('role','owner'))::text,true);
do $$begin
 if exists(select 1 from public.church_current_account()) then raise exception 'Unlisted account accepted'; end if;
 begin
  insert into public.church_entries(kind,title) values('album','Unauthorized');
  raise exception 'FAIL: unlisted account write allowed';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
update public.church_members set enabled=false where user_id=current_setting('test.editor')::uuid;
set local role authenticated;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.editor'),'session_id',current_setting('test.session'),'role','authenticated')::text,true);
do $$begin
 if exists(select 1 from public.church_current_account()) then raise exception 'Blocked account accepted'; end if;
 update public.church_entries set title='Unauthorized' where id=current_setting('test.entry')::uuid;
 if found then raise exception 'Blocked account write allowed'; end if;
end $$;
reset role;
update public.church_members set enabled=true where user_id=current_setting('test.editor')::uuid;
delete from auth.sessions where id=current_setting('test.session')::uuid;
set local role authenticated;
do $$begin if exists(select 1 from public.church_current_account()) then raise exception 'Revoked session accepted'; end if; end $$;
reset role;

update public.church_members set role='owner' where user_id=current_setting('test.editor')::uuid;
insert into auth.sessions(id,user_id) values(current_setting('test.session')::uuid,current_setting('test.editor')::uuid);
set local role authenticated;
do $$
declare target_email text;
begin
 update public.church_settings set value=jsonb_set(value,'{notice}','{"enabled":false,"title":"PRIVATE TEST","message":"PRIVATE TEST","expiresAt":""}'::jsonb) where id='church';
 if not found then raise exception 'Owner cannot update settings'; end if;
 target_email='migration-'||current_setting('test.outsider')||'@example.invalid';
 perform public.church_authorize_editor(target_email,'Temporary editor');
 if not exists(select 1 from public.church_list_members() where id=current_setting('test.outsider')::uuid) then raise exception 'Owner cannot manage members'; end if;
 perform public.church_set_editor_access(current_setting('test.outsider')::uuid,false);
end $$;
set local role anon;
select set_config('request.jwt.claims','{"role":"anon"}',true);
do $$begin
 if public.church_public_settings()#>>'{notice,title}'<>'' then raise exception 'Inactive notice leaked'; end if;
end $$;
reset role;

rollback;
select 'PASS: draft privacy, publication, storage RLS, editor restrictions, account blocking, session revocation, photo cap and atomic reorder. All fixtures rolled back.' as result;

