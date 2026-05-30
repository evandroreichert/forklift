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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: 'admin' | 'mechanic' | 'client';
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];
