
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { UserProfile, AnalysisResult, ApplicationRecord, AppNotification } from '../types';

export const saveAssessment = async (profile: UserProfile, analysis: AnalysisResult) => {
  if (!isSupabaseConfigured() || !supabase) {
    console.log('Supabase not configured, skipping save.');
    return null;
  }

  try {
    // 1. Insert the main Assessment record
    const { data: assessmentData, error: assessmentError } = await supabase
      .from('assessments')
      .insert([
        { 
          monthly_income: profile.monthlyIncome,
          household_size: profile.householdSize,
          zip_code: profile.zipCode,
          primary_hardships: profile.selectedHardships,
          profile_data: profile, 
          analysis_summary: analysis,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (assessmentError) {
      console.error('Error saving assessment parent record:', assessmentError);
      return null;
    }

    const assessmentId = assessmentData.id;

    // 2. Insert detailed Program Eligibility results (if any)
    if (analysis.program_eligibility && analysis.program_eligibility.length > 0) {
      const eligibilityRecords = analysis.program_eligibility.map(p => ({
        assessment_id: assessmentId,
        program_id: p.program_id,
        program_name: p.program_name,
        category: p.category,
        is_eligible: p.eligible,
        confidence_score: p.confidence_score,
        estimated_monthly_benefit: p.estimated_monthly_benefit,
        reason: p.reason_eligible,
        created_at: new Date().toISOString()
      }));

      const { error: resultsError } = await supabase
        .from('eligibility_results')
        .insert(eligibilityRecords);

      if (resultsError) {
        console.error('Error saving eligibility results:', resultsError);
      }
    }

    return assessmentData;
  } catch (err) {
    console.error('Unexpected error saving to Supabase:', err);
    return null;
  }
};

// --- Application Tracker Services ---

export const fetchApplications = async (): Promise<ApplicationRecord[]> => {
  if (!isSupabaseConfigured() || !supabase) return [];

  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('submitted_date', { ascending: false });

  if (error) {
    console.error('Error fetching applications:', error);
    return [];
  }

  // Map DB fields to Frontend types if needed
  return data.map((app: any) => ({
    ...app,
    // Ensure we handle date strings correctly if they come back as different formats
    last_updated: app.updated_at || app.created_at
  })) as ApplicationRecord[];
};

export const createApplication = async (app: ApplicationRecord): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) return false;

  // We omit 'id' to let Supabase generate a UUID, but we store the confirmation number
  const { error } = await supabase
    .from('applications')
    .insert([{
      program_name: app.program_name,
      category: app.category,
      status: app.status,
      submitted_date: app.submitted_date,
      confirmation_number: app.confirmation_number,
      estimated_decision_date: app.estimated_decision_date,
      benefit_amount: app.benefit_amount,
      next_steps: app.next_steps,
      updated_at: new Date().toISOString()
    }]);

  if (error) {
    console.error('Error creating application:', error);
    return false;
  }
  return true;
};

// --- Notification Services ---

export const fetchNotifications = async (): Promise<AppNotification[]> => {
  if (!isSupabaseConfigured() || !supabase) return [];

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }

  return data.map((n: any) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    read: n.is_read,
    date: new Date(n.created_at).toLocaleDateString() // Simplification for UI
  }));
};

export const createNotification = async (notification: Omit<AppNotification, 'id' | 'date' | 'read'>): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) return false;

  const { error } = await supabase
    .from('notifications')
    .insert([{
      type: notification.type,
      title: notification.title,
      message: notification.message,
      is_read: false
    }]);

  if (error) {
    console.error('Error creating notification:', error);
    return false;
  }
  return true;
};

export const markAllNotificationsRead = async (): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) return false;

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('is_read', false);

  if (error) {
    console.error('Error marking notifications read:', error);
    return false;
  }
  return true;
};
