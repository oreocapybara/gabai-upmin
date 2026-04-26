export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      Admin: {
        Row: {
          admin_id: number
          email: string
          password: string
          username: string
        }
        Insert: {
          admin_id?: number
          email?: string
          password?: string
          username: string
        }
        Update: {
          admin_id?: number
          email?: string
          password?: string
          username?: string
        }
        Relationships: []
      }
      Admin_Log: {
        Row: {
          admin_id: number
          listing_id: number
          log_id: number
          status: Database["public"]["Enums"]["status"] | null
        }
        Insert: {
          admin_id: number
          listing_id: number
          log_id?: number
          status?: Database["public"]["Enums"]["status"] | null
        }
        Update: {
          admin_id?: number
          listing_id?: number
          log_id?: number
          status?: Database["public"]["Enums"]["status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "Admin_Log_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "Admin"
            referencedColumns: ["admin_id"]
          },
          {
            foreignKeyName: "Admin_Log_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "Listing"
            referencedColumns: ["listing_id"]
          },
        ]
      }
      Category: {
        Row: {
          category_id: number
          category_name: string
        }
        Insert: {
          category_id?: number
          category_name: string
        }
        Update: {
          category_id?: number
          category_name?: string
        }
        Relationships: []
      }
      Feedback: {
        Row: {
          feedback_date: string
          feedback_id: number
          feedback_message: string | null
          listing_id: number
          nickname: string | null
          rating: number
        }
        Insert: {
          feedback_date?: string
          feedback_id?: number
          feedback_message?: string | null
          listing_id: number
          nickname?: string | null
          rating: number
        }
        Update: {
          feedback_date?: string
          feedback_id?: number
          feedback_message?: string | null
          listing_id?: number
          nickname?: string | null
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "Feedback_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "Listing"
            referencedColumns: ["listing_id"]
          },
        ]
      }
      Listing: {
        Row: {
          category_id: number
          closing_hours: string | null
          coord_latitude: number
          coord_longitude: number
          image_url: string | null
          listing_id: number
          listing_name: string
          opening_hours: string | null
          price: number | null
        }
        Insert: {
          category_id: number
          closing_hours?: string | null
          coord_latitude: number
          coord_longitude: number
          image_url?: string | null
          listing_id?: number
          listing_name: string
          opening_hours?: string | null
          price?: number | null
        }
        Update: {
          category_id?: number
          closing_hours?: string | null
          coord_latitude?: number
          coord_longitude?: number
          image_url?: string | null
          listing_id?: number
          listing_name?: string
          opening_hours?: string | null
          price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Listing_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "Category"
            referencedColumns: ["category_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      status: "CREATED_LISTINGUPDATED_LISTING" | "DELETED_LISTING"
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
    Enums: {
      status: ["CREATED_LISTINGUPDATED_LISTING", "DELETED_LISTING"],
    },
  },
} as const
