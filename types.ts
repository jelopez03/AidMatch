
export enum EmploymentStatus {
  Employed = "employed",
  Unemployed = "unemployed",
  Disabled = "disabled",
  Retired = "retired"
}

export enum HardshipType {
  FoodInsecurity = "Food Insecurity",
  HousingCostBurden = "Housing Cost Burden",
  MedicalDebt = "Medical Debt",
  UtilitiesArrears = "Utilities Arrears",
  TransportationIssues = "Transportation Issues",
  ChildcareCost = "Childcare Cost"
}

export interface UserProfile {
  monthlyIncome: number;
  monthlyExpenses: {
    rentOrMortgage: number;
    food: number;
    utilities: number;
    medical: number;
    transportation: number;
    debtPayments: number;
    other: number;
  };
  householdSize: number;
  dependents: number;
  isSingleParent: boolean;
  employmentStatus: EmploymentStatus;
  selectedHardships: HardshipType[];
  vulnerabilities: string[]; // e.g., "Elderly member", "Chronic illness"
  zipCode: string;
}

export interface ProgramEligibility {
  program_id: string;
  program_name: string;
  category: string;
  eligible: boolean;
  confidence_score: number;
  reason_eligible: string;
  estimated_monthly_benefit: number | null;
  estimated_annual_benefit: number | null;
  processing_days: number;
  approval_likelihood_percent: number;
}

export interface AnalysisResult {
  poverty_level_percent: number;
  poverty_classification: 'very_low' | 'low' | 'moderate';
  monthly_deficit: number;
  primary_hardships: string[];
  household_size: number;
  dependents: number;
  family_vulnerabilities: string[];
  is_single_parent: boolean;
  working_status: string;
  estimated_eligibility_categories: string[];
  program_eligibility?: ProgramEligibility[];
}

// --- Tracker Types ---

export type ApplicationStatus = 'approved' | 'under_review' | 'waitlisted' | 'action_required' | 'denied';

export interface ApplicationRecord {
  id: string;
  program_name: string;
  category: string;
  status: ApplicationStatus;
  submitted_date: string;
  last_updated: string;
  confirmation_number: string;
  estimated_decision_date?: string;
  benefit_amount?: string;
  next_steps?: string;
}

export interface AppNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'action';
  title: string;
  message: string;
  date: string;
  read: boolean;
}
