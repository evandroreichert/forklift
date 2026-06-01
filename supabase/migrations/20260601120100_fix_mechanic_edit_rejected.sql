-- Fix: a policy "mechanic updates own editable reports" exigia novo status
-- em ('draft','pending_approval'), bloqueando edição que mantenha status='rejected'
-- (mecânico vendo o motivo + corrigindo antes de re-submeter).
-- Solução: permitir 'rejected' também no with check (transições permitidas:
-- draft↔draft, draft→pending_approval, rejected↔rejected, rejected→pending_approval,
-- rejected→draft via reopenRejected).

drop policy if exists "mechanic updates own editable reports" on reports;

create policy "mechanic updates own editable reports"
  on reports for update
  using (
    private.user_role() = 'mechanic'
    and mechanic_id = auth.uid()
    and status in ('draft', 'rejected')
  )
  with check (
    private.user_role() = 'mechanic'
    and mechanic_id = auth.uid()
    and status in ('draft', 'pending_approval', 'rejected')
    and numero is null
    and client_company_id is null
    and approved_by is null
    and approved_at is null
    and preco_servicos is null
    and preco_pecas is null
    and preco_total is null
  );
