alter table public.tour_members
  add column if not exists person_id uuid references public.people(id) on delete restrict;

create index if not exists tour_members_person_id_idx
  on public.tour_members(person_id);
