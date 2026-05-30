-- Mudança de escopo: cadastro de máquinas removido.
-- Identificador da máquina e horímetro vão como texto livre no relatório
-- (Fatia 2). Não precisamos de tabela machines nem enum fuel_type.

drop table if exists public.machines;
drop type if exists public.fuel_type;
