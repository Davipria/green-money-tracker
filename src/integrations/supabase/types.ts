export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      bet_selections: {
        Row: {
          bet_id: string
          created_at: string
          event: string
          id: string
          individual_status: string | null
          odds: number
          payout: number | null
          selection: string | null
          sport: string | null
          status: string | null
        }
        Insert: {
          bet_id: string
          created_at?: string
          event: string
          id?: string
          individual_status?: string | null
          odds: number
          payout?: number | null
          selection?: string | null
          sport?: string | null
          status?: string | null
        }
        Update: {
          bet_id?: string
          created_at?: string
          event?: string
          id?: string
          individual_status?: string | null
          odds?: number
          payout?: number | null
          selection?: string | null
          sport?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bet_selections_bet_id_fkey"
            columns: ["bet_id"]
            isOneToOne: false
            referencedRelation: "bets"
            referencedColumns: ["id"]
          },
        ]
      }
      bets: {
        Row: {
          bet_type: string
          bonus: number | null
          bookmaker: string | null
          cashout_amount: number | null
          commission: number | null
          created_at: string
          date: string
          event: string
          exchange_type: string | null
          id: string
          liability: number | null
          manifestation: string | null
          multiple_title: string | null
          notes: string | null
          odds: number
          payout: number | null
          profit: number | null
          selection: string | null
          sport: string | null
          stake: number
          status: string
          system_type: string | null
          timing: string | null
          tipster: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bet_type: string
          bonus?: number | null
          bookmaker?: string | null
          cashout_amount?: number | null
          commission?: number | null
          created_at?: string
          date: string
          event: string
          exchange_type?: string | null
          id?: string
          liability?: number | null
          manifestation?: string | null
          multiple_title?: string | null
          notes?: string | null
          odds: number
          payout?: number | null
          profit?: number | null
          selection?: string | null
          sport?: string | null
          stake: number
          status: string
          system_type?: string | null
          timing?: string | null
          tipster?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bet_type?: string
          bonus?: number | null
          bookmaker?: string | null
          cashout_amount?: number | null
          commission?: number | null
          created_at?: string
          date?: string
          event?: string
          exchange_type?: string | null
          id?: string
          liability?: number | null
          manifestation?: string | null
          multiple_title?: string | null
          notes?: string | null
          odds?: number
          payout?: number | null
          profit?: number | null
          selection?: string | null
          sport?: string | null
          stake?: number
          status?: string
          system_type?: string | null
          timing?: string | null
          tipster?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      monthly_reports_log: {
        Row: {
          id: string
          report_month: string
          report_type: string
          sent_at: string
          user_id: string
        }
        Insert: {
          id?: string
          report_month: string
          report_type: string
          sent_at?: string
          user_id: string
        }
        Update: {
          id?: string
          report_month?: string
          report_type?: string
          sent_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bankroll: number | null
          bio: string | null
          created_at: string
          dark_mode: boolean | null
          favorite_sport: string | null
          first_name: string | null
          id: string
          instagram_url: string | null
          last_name: string | null
          monthly_budget: number | null
          monthly_reports_enabled: boolean | null
          notifications_email: boolean | null
          notifications_reminders: boolean | null
          profile_type: string | null
          risk_level: string | null
          show_balance: boolean | null
          telegram_url: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bankroll?: number | null
          bio?: string | null
          created_at?: string
          dark_mode?: boolean | null
          favorite_sport?: string | null
          first_name?: string | null
          id: string
          instagram_url?: string | null
          last_name?: string | null
          monthly_budget?: number | null
          monthly_reports_enabled?: boolean | null
          notifications_email?: boolean | null
          notifications_reminders?: boolean | null
          profile_type?: string | null
          risk_level?: string | null
          show_balance?: boolean | null
          telegram_url?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bankroll?: number | null
          bio?: string | null
          created_at?: string
          dark_mode?: boolean | null
          favorite_sport?: string | null
          first_name?: string | null
          id?: string
          instagram_url?: string | null
          last_name?: string | null
          monthly_budget?: number | null
          monthly_reports_enabled?: boolean | null
          notifications_email?: boolean | null
          notifications_reminders?: boolean | null
          profile_type?: string | null
          risk_level?: string | null
          show_balance?: boolean | null
          telegram_url?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
