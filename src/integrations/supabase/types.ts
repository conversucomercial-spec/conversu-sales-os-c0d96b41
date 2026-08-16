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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          company_id: string | null
          completed_at: string | null
          contact_id: string | null
          created_at: string
          description: string
          due_at: string | null
          id: string
          opportunity_id: string | null
          owner_id: string
          priority: string
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          description?: string
          due_at?: string | null
          id?: string
          opportunity_id?: string | null
          owner_id: string
          priority?: string
          status?: string
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          description?: string
          due_at?: string | null
          id?: string
          opportunity_id?: string | null
          owner_id?: string
          priority?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          city: string | null
          created_at: string
          employees: number | null
          id: string
          legacy_key: string | null
          mrr: number
          name: string
          note: string | null
          origin: string
          owner_id: string
          partner: string | null
          segment: string
          site: string | null
          status: string
          updated_at: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          employees?: number | null
          id?: string
          legacy_key?: string | null
          mrr?: number
          name: string
          note?: string | null
          origin?: string
          owner_id: string
          partner?: string | null
          segment?: string
          site?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          city?: string | null
          created_at?: string
          employees?: number | null
          id?: string
          legacy_key?: string | null
          mrr?: number
          name?: string
          note?: string | null
          origin?: string
          owner_id?: string
          partner?: string | null
          segment?: string
          site?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "companies_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_tags: {
        Row: {
          company_id: string
          created_at: string
          id: string
          owner_id: string
          tag_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          owner_id: string
          tag_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          owner_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_tags_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_tags_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_tags: {
        Row: {
          contact_id: string
          created_at: string
          id: string
          owner_id: string
          tag_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          id?: string
          owner_id: string
          tag_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          id?: string
          owner_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_tags_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_tags_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          company_id: string | null
          created_at: string
          email: string | null
          id: string
          influence: string
          last_interaction: string | null
          legacy_key: string | null
          linkedin: string | null
          name: string
          owner_id: string
          phone: string | null
          relationship: string
          role: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          influence?: string
          last_interaction?: string | null
          legacy_key?: string | null
          linkedin?: string | null
          name: string
          owner_id: string
          phone?: string | null
          relationship?: string
          role?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          influence?: string
          last_interaction?: string | null
          legacy_key?: string | null
          linkedin?: string | null
          name?: string
          owner_id?: string
          phone?: string | null
          relationship?: string
          role?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      discoveries: {
        Row: {
          bottlenecks: string
          channels: string
          conversu_fit: string
          created_at: string
          current_scenario: string
          id: string
          impacts: string
          integrations: string
          journeys: string
          next_steps: string
          objective: string
          opportunities_found: string
          opportunity_id: string
          owner_id: string
          pains: string
          processes: string
          status: string
          systems: string
          team: string
          updated_at: string
          validated_scope: string
          volume: string
        }
        Insert: {
          bottlenecks?: string
          channels?: string
          conversu_fit?: string
          created_at?: string
          current_scenario?: string
          id?: string
          impacts?: string
          integrations?: string
          journeys?: string
          next_steps?: string
          objective?: string
          opportunities_found?: string
          opportunity_id: string
          owner_id: string
          pains?: string
          processes?: string
          status?: string
          systems?: string
          team?: string
          updated_at?: string
          validated_scope?: string
          volume?: string
        }
        Update: {
          bottlenecks?: string
          channels?: string
          conversu_fit?: string
          created_at?: string
          current_scenario?: string
          id?: string
          impacts?: string
          integrations?: string
          journeys?: string
          next_steps?: string
          objective?: string
          opportunities_found?: string
          opportunity_id?: string
          owner_id?: string
          pains?: string
          processes?: string
          status?: string
          systems?: string
          team?: string
          updated_at?: string
          validated_scope?: string
          volume?: string
        }
        Relationships: [
          {
            foreignKeyName: "discoveries_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: true
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discoveries_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      discovery_documents: {
        Row: {
          created_at: string
          doc_date: string | null
          id: string
          kind: string
          name: string
          opportunity_id: string
          owner_id: string
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          doc_date?: string | null
          id?: string
          kind?: string
          name: string
          opportunity_id: string
          owner_id: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          doc_date?: string | null
          id?: string
          kind?: string
          name?: string
          opportunity_id?: string
          owner_id?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discovery_documents_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discovery_documents_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string
          company_id: string | null
          created_at: string
          id: string
          meeting_id: string | null
          mime_type: string
          name: string
          opportunity_id: string | null
          owner_id: string
          size_bytes: number
          storage_path: string
          updated_at: string
        }
        Insert: {
          category?: string
          company_id?: string | null
          created_at?: string
          id?: string
          meeting_id?: string | null
          mime_type?: string
          name: string
          opportunity_id?: string | null
          owner_id: string
          size_bytes?: number
          storage_path: string
          updated_at?: string
        }
        Update: {
          category?: string
          company_id?: string | null
          created_at?: string
          id?: string
          meeting_id?: string | null
          mime_type?: string
          name?: string
          opportunity_id?: string | null
          owner_id?: string
          size_bytes?: number
          storage_path?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string
          id: string
          level: string
          metric: string
          owner_id: string
          period_end: string
          period_start: string
          subject_id: string | null
          target: number
          team: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          level?: string
          metric: string
          owner_id: string
          period_end: string
          period_start: string
          subject_id?: string | null
          target?: number
          team?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          level?: string
          metric?: string
          owner_id?: string
          period_end?: string
          period_start?: string
          subject_id?: string | null
          target?: number
          team?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          agenda: string
          attendees: Json
          company_id: string | null
          contact_id: string | null
          created_at: string
          ends_at: string | null
          id: string
          location: string
          next_steps: string
          opportunity_id: string | null
          owner_id: string
          recording_url: string | null
          source: string
          starts_at: string
          status: string
          summary: string
          title: string
          transcript_url: string | null
          updated_at: string
        }
        Insert: {
          agenda?: string
          attendees?: Json
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          location?: string
          next_steps?: string
          opportunity_id?: string | null
          owner_id: string
          recording_url?: string | null
          source?: string
          starts_at: string
          status?: string
          summary?: string
          title: string
          transcript_url?: string | null
          updated_at?: string
        }
        Update: {
          agenda?: string
          attendees?: Json
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          location?: string
          next_steps?: string
          opportunity_id?: string | null
          owner_id?: string
          recording_url?: string | null
          source?: string
          starts_at?: string
          status?: string
          summary?: string
          title?: string
          transcript_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          detail: string
          entity_id: string | null
          entity_type: string | null
          id: string
          kind: string
          link: string | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          detail?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          kind?: string
          link?: string | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          detail?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          kind?: string
          link?: string | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          checklist: Json
          close_date: string | null
          company_id: string
          contact_id: string | null
          created_at: string
          custom: Json
          days_in_stage: number
          files: Json
          health: number | null
          id: string
          last_contact: string | null
          legacy_key: string | null
          linkedin_last_action_at: string | null
          linkedin_next_action: string | null
          linkedin_next_action_at: string | null
          linkedin_status: string
          linkedin_step: string
          linkedin_url: string | null
          loss_reason: string | null
          meeting: Json
          meetings: Json
          next_activity: string | null
          next_activity_date: string | null
          next_step: string | null
          notes: Json
          objections: Json
          origin: string
          owner_id: string
          owner_label: string | null
          pains: Json
          partner: string | null
          pipeline_id: string
          priority: string
          probability: number
          proposals: Json
          risks: Json
          sales_arguments: Json
          segment: string | null
          setup_value: number | null
          source: string | null
          stage_changed_at: string
          stage_id: string
          suggestions: Json
          summary: string | null
          temperature: string
          timeline: Json
          title: string
          updated_at: string
          value: number
        }
        Insert: {
          checklist?: Json
          close_date?: string | null
          company_id: string
          contact_id?: string | null
          created_at?: string
          custom?: Json
          days_in_stage?: number
          files?: Json
          health?: number | null
          id?: string
          last_contact?: string | null
          legacy_key?: string | null
          linkedin_last_action_at?: string | null
          linkedin_next_action?: string | null
          linkedin_next_action_at?: string | null
          linkedin_status?: string
          linkedin_step?: string
          linkedin_url?: string | null
          loss_reason?: string | null
          meeting?: Json
          meetings?: Json
          next_activity?: string | null
          next_activity_date?: string | null
          next_step?: string | null
          notes?: Json
          objections?: Json
          origin?: string
          owner_id: string
          owner_label?: string | null
          pains?: Json
          partner?: string | null
          pipeline_id: string
          priority?: string
          probability?: number
          proposals?: Json
          risks?: Json
          sales_arguments?: Json
          segment?: string | null
          setup_value?: number | null
          source?: string | null
          stage_changed_at?: string
          stage_id: string
          suggestions?: Json
          summary?: string | null
          temperature?: string
          timeline?: Json
          title: string
          updated_at?: string
          value?: number
        }
        Update: {
          checklist?: Json
          close_date?: string | null
          company_id?: string
          contact_id?: string | null
          created_at?: string
          custom?: Json
          days_in_stage?: number
          files?: Json
          health?: number | null
          id?: string
          last_contact?: string | null
          legacy_key?: string | null
          linkedin_last_action_at?: string | null
          linkedin_next_action?: string | null
          linkedin_next_action_at?: string | null
          linkedin_status?: string
          linkedin_step?: string
          linkedin_url?: string | null
          loss_reason?: string | null
          meeting?: Json
          meetings?: Json
          next_activity?: string | null
          next_activity_date?: string | null
          next_step?: string | null
          notes?: Json
          objections?: Json
          origin?: string
          owner_id?: string
          owner_label?: string | null
          pains?: Json
          partner?: string | null
          pipeline_id?: string
          priority?: string
          probability?: number
          proposals?: Json
          risks?: Json
          sales_arguments?: Json
          segment?: string | null
          setup_value?: number | null
          source?: string | null
          stage_changed_at?: string
          stage_id?: string
          suggestions?: Json
          summary?: string | null
          temperature?: string
          timeline?: Json
          title?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_events: {
        Row: {
          created_at: string
          detail: string
          id: string
          kind: string
          occurred_at: string
          opportunity_id: string
          owner_id: string
          payload: Json
          title: string
        }
        Insert: {
          created_at?: string
          detail?: string
          id?: string
          kind: string
          occurred_at?: string
          opportunity_id: string
          owner_id: string
          payload?: Json
          title: string
        }
        Update: {
          created_at?: string
          detail?: string
          id?: string
          kind?: string
          occurred_at?: string
          opportunity_id?: string
          owner_id?: string
          payload?: Json
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_events_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_events_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_tags: {
        Row: {
          created_at: string
          id: string
          opportunity_id: string
          owner_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          opportunity_id: string
          owner_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          id?: string
          opportunity_id?: string
          owner_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_tags_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_tags_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      pipelines: {
        Row: {
          card_fields: string[]
          created_at: string
          description: string
          id: string
          key: string
          name: string
          position: number
          updated_at: string
        }
        Insert: {
          card_fields?: string[]
          created_at?: string
          description?: string
          id?: string
          key: string
          name: string
          position?: number
          updated_at?: string
        }
        Update: {
          card_fields?: string[]
          created_at?: string
          description?: string
          id?: string
          key?: string
          name?: string
          position?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          job_title: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          job_title?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          job_title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      proposals: {
        Row: {
          created_at: string
          decided_at: string | null
          discount: number
          id: string
          items: Json
          notes: string
          number: string
          opportunity_id: string
          owner_id: string
          sent_at: string | null
          setup_value: number
          status: string
          terms: string
          updated_at: string
          valid_until: string | null
          value: number
        }
        Insert: {
          created_at?: string
          decided_at?: string | null
          discount?: number
          id?: string
          items?: Json
          notes?: string
          number?: string
          opportunity_id: string
          owner_id: string
          sent_at?: string | null
          setup_value?: number
          status?: string
          terms?: string
          updated_at?: string
          valid_until?: string | null
          value?: number
        }
        Update: {
          created_at?: string
          decided_at?: string | null
          discount?: number
          id?: string
          items?: Json
          notes?: string
          number?: string
          opportunity_id?: string
          owner_id?: string
          sent_at?: string | null
          setup_value?: number
          status?: string
          terms?: string
          updated_at?: string
          valid_until?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "proposals_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      prospecting_events: {
        Row: {
          channel: string
          company_id: string | null
          created_at: string
          id: string
          note: string | null
          occurred_at: string
          opportunity_id: string
          owner_id: string
          type: string
        }
        Insert: {
          channel?: string
          company_id?: string | null
          created_at?: string
          id?: string
          note?: string | null
          occurred_at?: string
          opportunity_id: string
          owner_id: string
          type: string
        }
        Update: {
          channel?: string
          company_id?: string | null
          created_at?: string
          id?: string
          note?: string | null
          occurred_at?: string
          opportunity_id?: string
          owner_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "prospecting_events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospecting_events_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospecting_events_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stages: {
        Row: {
          created_at: string
          id: string
          key: string
          name: string
          pipeline_id: string
          position: number
          probability: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          name: string
          pipeline_id: string
          position?: number
          probability?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          name?: string
          pipeline_id?: string
          position?: number
          probability?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stages_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          owner_id: string
          slug: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          owner_id: string
          slug: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      opportunity_days_in_stage: {
        Args: { _stage_changed_at: string }
        Returns: number
      }
    }
    Enums: {
      app_role: "gestor" | "vendedor"
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
      app_role: ["gestor", "vendedor"],
    },
  },
} as const
