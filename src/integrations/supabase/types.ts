export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bet_selections: {
        Row: {
          bet_id: string
          created_at: string
          event: string
          id: string
          odds: number
          selection: string | null
          sport: string | null
        }
        Insert: {
          bet_id: string
          created_at?: string
          event: string
          id?: string
          odds: number
          selection?: string | null
          sport?: string | null
        }
        Update: {
          bet_id?: string
          created_at?: string
          event?: string
          id?: string
          odds?: number
          selection?: string | null
          sport?: string | null
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
          nickname: string | null
          notifications_email: boolean | null
          notifications_reminders: boolean | null
          profile_type: string | null
          risk_level: string | null
          show_balance: boolean | null
          telegram_url: string | null
          updated_at: string
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
          nickname?: string | null
          notifications_email?: boolean | null
          notifications_reminders?: boolean | null
          profile_type?: string | null
          risk_level?: string | null
          show_balance?: boolean | null
          telegram_url?: string | null
          updated_at?: string
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
          nickname?: string | null
          notifications_email?: boolean | null
          notifications_reminders?: boolean | null
          profile_type?: string | null
          risk_level?: string | null
          show_balance?: boolean | null
          telegram_url?: string | null
          updated_at?: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
