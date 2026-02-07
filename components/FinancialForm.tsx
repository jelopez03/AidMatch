import React, { useState } from 'react';
import { UserProfile, EmploymentStatus, HardshipType } from '../types';
import { Calculator, DollarSign, Users, AlertTriangle, LucideIcon } from 'lucide-react';

interface FinancialFormProps {
  onSubmit: (data: UserProfile) => void;
  isLoading: boolean;
}

interface InputFieldProps {
  label: string;
  value: string | number;
  onChange: (value: any) => void;
  type?: string;
  icon?: LucideIcon;
  error?: string;
  required?: boolean;
}

const InputField = ({ label, value, onChange, type = "number", icon: Icon, error, required }: InputFieldProps) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Icon size={16} />
        </div>
      )}
      <input
        type={type}
        value={value}
        placeholder={type === "number" ? "0" : ""}
        onChange={(e) => {
          const val = e.target.value;
          if (type === 'number') {
            // Return empty string if empty, otherwise parse float
            onChange(val === '' ? '' : parseFloat(val));
          } else {
            onChange(val);
          }
        }}
        onFocus={(e) => type === "number" && e.target.select()}
        className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${
          error ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'
        }`}
      />
    </div>
    {error && <p className="mt-1 text-sm text-red-500 animate-in fade-in slide-in-from-top-1">{error}</p>}
  </div>
);

// Define a local form state type that allows empty strings for numbers during data entry
type FormState = Omit<UserProfile, 'monthlyIncome' | 'monthlyExpenses' | 'householdSize' | 'dependents'> & {
  monthlyIncome: number | string;
  householdSize: number | string;
  dependents: number | string;
  monthlyExpenses: {
    rentOrMortgage: number | string;
    food: number | string;
    utilities: number | string;
    medical: number | string;
    transportation: number | string;
    debtPayments: number | string;
    other: number | string;
  };
};

const FinancialForm: React.FC<FinancialFormProps> = ({ onSubmit, isLoading }) => {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Initialize mandatory number fields with empty strings to enforce "filled up" validation
  const [formData, setFormData] = useState<FormState>({
    monthlyIncome: '',
    monthlyExpenses: {
      rentOrMortgage: '',
      food: '',
      utilities: '',
      medical: 0,
      transportation: 0,
      debtPayments: 0,
      other: 0,
    },
    householdSize: 1,
    dependents: 0,
    isSingleParent: false,
    employmentStatus: EmploymentStatus.Employed,
    selectedHardships: [],
    vulnerabilities: [],
    zipCode: '',
  });

  const [vulnerabilityInput, setVulnerabilityInput] = useState('');

  const handleChange = (field: keyof FormState, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleExpenseChange = (field: keyof FormState['monthlyExpenses'], value: number | string) => {
    setFormData(prev => ({
      ...prev,
      monthlyExpenses: { ...prev.monthlyExpenses, [field]: value }
    }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const toggleHardship = (hardship: HardshipType) => {
    setFormData(prev => {
      const current = prev.selectedHardships;
      if (current.includes(hardship)) {
        return { ...prev, selectedHardships: current.filter(h => h !== hardship) };
      }
      return { ...prev, selectedHardships: [...current, hardship] };
    });
  };

  const addVulnerability = () => {
    if (vulnerabilityInput.trim()) {
      setFormData(prev => ({
        ...prev,
        vulnerabilities: [...prev.vulnerabilities, vulnerabilityInput.trim()]
      }));
      setVulnerabilityInput('');
    }
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (currentStep === 1) {
      if (formData.monthlyIncome === '') {
        newErrors.monthlyIncome = "Please enter your monthly income";
        isValid = false;
      } else if (typeof formData.monthlyIncome === 'number' && formData.monthlyIncome < 0) {
        newErrors.monthlyIncome = "Income cannot be negative";
        isValid = false;
      }

      if (!formData.zipCode) {
        newErrors.zipCode = "Zip code is required";
        isValid = false;
      } else if (!/^\d{5}$/.test(formData.zipCode)) {
        newErrors.zipCode = "Please enter a valid 5-digit zip code";
        isValid = false;
      }
    }

    if (currentStep === 2) {
       // Validate mandatory expenses (Rent, Food, Utilities)
       if (formData.monthlyExpenses.rentOrMortgage === '') {
         newErrors.rentOrMortgage = "This field is required";
         isValid = false;
       }
       if (formData.monthlyExpenses.food === '') {
         newErrors.food = "This field is required";
         isValid = false;
       }
       if (formData.monthlyExpenses.utilities === '') {
         newErrors.utilities = "This field is required";
         isValid = false;
       }
       
       // Negative check
       if (typeof formData.monthlyExpenses.rentOrMortgage === 'number' && formData.monthlyExpenses.rentOrMortgage < 0) newErrors.rentOrMortgage = "Invalid amount";
       if (typeof formData.monthlyExpenses.food === 'number' && formData.monthlyExpenses.food < 0) newErrors.food = "Invalid amount";
       if (typeof formData.monthlyExpenses.utilities === 'number' && formData.monthlyExpenses.utilities < 0) newErrors.utilities = "Invalid amount";
    }

    if (currentStep === 3) {
      if (formData.householdSize === '' || Number(formData.householdSize) < 1) {
        newErrors.householdSize = "Household size must be at least 1";
        isValid = false;
      }
      if (formData.dependents === '' || Number(formData.dependents) < 0) {
        newErrors.dependents = "Invalid number of dependents";
        isValid = false;
      }
      if (Number(formData.dependents) >= Number(formData.householdSize)) {
        newErrors.dependents = "Dependents cannot exceed or equal total household size";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(s => s + 1);
    }
  };
  
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(step)) {
      // Convert form state to strict UserProfile types (parsing strings to numbers)
      const cleanData: UserProfile = {
        ...formData,
        monthlyIncome: Number(formData.monthlyIncome),
        householdSize: Number(formData.householdSize),
        dependents: Number(formData.dependents),
        monthlyExpenses: {
          rentOrMortgage: Number(formData.monthlyExpenses.rentOrMortgage),
          food: Number(formData.monthlyExpenses.food),
          utilities: Number(formData.monthlyExpenses.utilities),
          medical: Number(formData.monthlyExpenses.medical),
          transportation: Number(formData.monthlyExpenses.transportation),
          debtPayments: Number(formData.monthlyExpenses.debtPayments),
          other: Number(formData.monthlyExpenses.other),
        }
      };
      onSubmit(cleanData);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-2xl mx-auto border border-slate-100">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calculator className="w-6 h-6" />
          Financial Assessment
        </h2>
        <p className="text-blue-100 mt-1 text-sm">Step {step} of 4</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              Income & Employment
            </h3>
            
            <InputField 
              label="Monthly Household Income (Net/Take-home)" 
              value={formData.monthlyIncome} 
              onChange={(val) => handleChange('monthlyIncome', val)}
              icon={DollarSign}
              required
              error={errors.monthlyIncome}
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Employment Status</label>
              <select
                value={formData.employmentStatus}
                onChange={(e) => handleChange('employmentStatus', e.target.value)}
                className="w-full pl-3 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                {Object.values(EmploymentStatus).map(status => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>
            </div>

            <InputField 
              label="Zip Code" 
              value={formData.zipCode} 
              type="text"
              onChange={(val) => handleChange('zipCode', val)}
              required
              error={errors.zipCode}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              Monthly Expenses
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField 
                label="Rent / Mortgage" 
                value={formData.monthlyExpenses.rentOrMortgage} 
                onChange={(v) => handleExpenseChange('rentOrMortgage', v)} 
                icon={DollarSign} 
                required
                error={errors.rentOrMortgage}
              />
              <InputField 
                label="Food & Groceries" 
                value={formData.monthlyExpenses.food} 
                onChange={(v) => handleExpenseChange('food', v)} 
                icon={DollarSign} 
                required
                error={errors.food}
              />
              <InputField 
                label="Utilities (Electric, Water, etc.)" 
                value={formData.monthlyExpenses.utilities} 
                onChange={(v) => handleExpenseChange('utilities', v)} 
                icon={DollarSign} 
                required
                error={errors.utilities}
              />
              <InputField label="Medical / Rx" value={formData.monthlyExpenses.medical} onChange={(v) => handleExpenseChange('medical', v)} icon={DollarSign} />
              <InputField label="Transportation (Gas, Bus, Car)" value={formData.monthlyExpenses.transportation} onChange={(v) => handleExpenseChange('transportation', v)} icon={DollarSign} />
              <InputField label="Debt Payments" value={formData.monthlyExpenses.debtPayments} onChange={(v) => handleExpenseChange('debtPayments', v)} icon={DollarSign} />
              <InputField label="Other Expenses" value={formData.monthlyExpenses.other} onChange={(v) => handleExpenseChange('other', v)} icon={DollarSign} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Household Details
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <InputField 
                label="Total Household Size" 
                value={formData.householdSize} 
                onChange={(v) => handleChange('householdSize', v)} 
                required
                error={errors.householdSize}
              />
              <InputField 
                label="Number of Dependents" 
                value={formData.dependents} 
                onChange={(v) => handleChange('dependents', v)} 
                error={errors.dependents}
              />
            </div>

            <div className="flex items-center space-x-3 p-4 border border-slate-200 rounded-lg">
              <input 
                type="checkbox" 
                id="singleParent"
                checked={formData.isSingleParent}
                onChange={(e) => handleChange('isSingleParent', e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="singleParent" className="text-slate-700 font-medium cursor-pointer">
                I am a single parent
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Household Vulnerabilities (Optional)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={vulnerabilityInput}
                  onChange={(e) => setVulnerabilityInput(e.target.value)}
                  placeholder="e.g. Elderly member, Disability"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addVulnerability())}
                />
                <button 
                  type="button" 
                  onClick={addVulnerability}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.vulnerabilities.map((v, i) => (
                  <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    {v}
                    <button type="button" onClick={() => {
                      const newVulns = [...formData.vulnerabilities];
                      newVulns.splice(i, 1);
                      handleChange('vulnerabilities', newVulns);
                    }} className="hover:text-blue-900 font-bold">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Current Hardships
            </h3>
            <p className="text-sm text-slate-500">Select all that currently apply to your situation.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.values(HardshipType).map((hardship) => (
                <div 
                  key={hardship}
                  onClick={() => toggleHardship(hardship)}
                  className={`cursor-pointer p-3 rounded-lg border flex items-center justify-between transition-all ${
                    formData.selectedHardships.includes(hardship)
                      ? 'border-amber-500 bg-amber-50 text-amber-900'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <span className="text-sm font-medium">{hardship}</span>
                  {formData.selectedHardships.includes(hardship) && (
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-between pt-6 border-t border-slate-100">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="px-6 py-2.5 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Back
            </button>
          ) : (
            <div></div>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-md shadow-blue-200 transition-all transform active:scale-95"
            >
              Next Step
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                'Run Analysis'
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default FinancialForm;