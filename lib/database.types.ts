// Stub manual gerado pra Fatia 1 — substituir por `npm run db:types`
// assim que o projeto Supabase remoto estiver linkado.
//
// Formato compatível com `supabase gen types typescript`.

export type Json = string | number | boolean | null | { [k: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      client_companies: {
        Row: {
          id: string;
          name: string;
          cnpj: string | null;
          contact_phone: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          cnpj?: string | null;
          contact_phone?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          cnpj?: string | null;
          contact_phone?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: Database['public']['Enums']['user_role'];
          client_company_id: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role: Database['public']['Enums']['user_role'];
          client_company_id?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: Database['public']['Enums']['user_role'];
          client_company_id?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_client_company_id_fkey';
            columns: ['client_company_id'];
            isOneToOne: false;
            referencedRelation: 'client_companies';
            referencedColumns: ['id'];
          },
        ];
      };
      reports: {
        Row: {
          id: string;
          numero: number | null;
          status: Database['public']['Enums']['report_status'];
          mechanic_id: string;
          cliente_nome: string;
          client_company_id: string | null;
          titulo: string;
          maquina_identificador: string;
          horimetro: number;
          is_preventiva: boolean;
          is_corretiva: boolean;
          maquina_parada: boolean;
          sumario_defeitos: string;
          produtos: string | null;
          responsavel_nome: string | null;
          assinatura_path: string | null;
          preco_servicos: number | null;
          preco_pecas: number | null;
          preco_total: number | null;
          submitted_at: string | null;
          approved_by: string | null;
          approved_at: string | null;
          rejected_reason: string | null;
          rejected_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          numero?: number | null;
          status?: Database['public']['Enums']['report_status'];
          mechanic_id: string;
          cliente_nome: string;
          client_company_id?: string | null;
          titulo: string;
          maquina_identificador: string;
          horimetro: number;
          is_preventiva?: boolean;
          is_corretiva?: boolean;
          maquina_parada: boolean;
          sumario_defeitos: string;
          produtos?: string | null;
          responsavel_nome?: string | null;
          assinatura_path?: string | null;
          preco_servicos?: number | null;
          preco_pecas?: number | null;
          preco_total?: number | null;
          submitted_at?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          rejected_reason?: string | null;
          rejected_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          numero?: number | null;
          status?: Database['public']['Enums']['report_status'];
          mechanic_id?: string;
          cliente_nome?: string;
          client_company_id?: string | null;
          titulo?: string;
          maquina_identificador?: string;
          horimetro?: number;
          is_preventiva?: boolean;
          is_corretiva?: boolean;
          maquina_parada?: boolean;
          sumario_defeitos?: string;
          produtos?: string | null;
          responsavel_nome?: string | null;
          assinatura_path?: string | null;
          preco_servicos?: number | null;
          preco_pecas?: number | null;
          preco_total?: number | null;
          submitted_at?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          rejected_reason?: string | null;
          rejected_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reports_mechanic_id_fkey';
            columns: ['mechanic_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reports_client_company_id_fkey';
            columns: ['client_company_id'];
            isOneToOne: false;
            referencedRelation: 'client_companies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reports_approved_by_fkey';
            columns: ['approved_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      report_intervals: {
        Row: {
          id: string;
          report_id: string;
          ordem: number;
          inicio: string;
          fim: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          report_id: string;
          ordem: number;
          inicio: string;
          fim?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          report_id?: string;
          ordem?: number;
          inicio?: string;
          fim?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'report_intervals_report_id_fkey';
            columns: ['report_id'];
            isOneToOne: false;
            referencedRelation: 'reports';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: 'admin' | 'mechanic' | 'client';
      report_status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];
