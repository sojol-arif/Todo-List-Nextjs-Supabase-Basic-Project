// Types for the `todos` table (Supabase todo-list quickstart schema).
// Regenerate with `npx supabase gen types typescript` if the schema changes.
export type Database = {
  public: {
    Tables: {
      todos: {
        Row: {
          id: number
          user_id: string
          task: string | null
          is_complete: boolean | null
          inserted_at: string
        }
        Insert: {
          id?: number
          user_id: string
          task?: string | null
          is_complete?: boolean | null
          inserted_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          task?: string | null
          is_complete?: boolean | null
          inserted_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
