import React from 'react';
import { Target, Users, Zap, Flame, Snowflake, Sun } from 'lucide-react';
import { AudienceType } from '../services/geminiService';

interface AudienceSelectorProps {
  value: AudienceType;
  onChange: (value: AudienceType) => void;
  label?: string;
}

const audienceOptions: { value: AudienceType; label: string; icon: React.ReactNode; group: string; description: string }[] = [
  { value: 'none', label: 'None (Default)', icon: <Target className="w-4 h-4" />, group: 'General', description: 'Standard AI generation without specific audience targeting.' },
  
  // Cold Audience
  { value: 'cold-unaware', label: 'Unaware (Cold)', icon: <Snowflake className="w-4 h-4 text-blue-400" />, group: 'Cold Audience', description: "Don't know they have a problem yet." },
  { value: 'cold-problem', label: 'Problem-Aware (Cold)', icon: <Snowflake className="w-4 h-4 text-blue-400" />, group: 'Cold Audience', description: 'Know the problem, but no solution.' },
  { value: 'cold-solution', label: 'Solution-Aware (Cold)', icon: <Snowflake className="w-4 h-4 text-blue-400" />, group: 'Cold Audience', description: 'Know solutions exist, but not YOU.' },
  { value: 'cold-content', label: 'Content-Aware (Cold)', icon: <Snowflake className="w-4 h-4 text-blue-400" />, group: 'Cold Audience', description: 'Seen your content, but no trust yet.' },
  
  // Warm Audience
  { value: 'warm-engaged', label: 'Engaged (Warm)', icon: <Sun className="w-4 h-4 text-orange-400" />, group: 'Warm Audience', description: 'Interacting with your content.' },
  { value: 'warm-lead', label: 'Lead (Warm)', icon: <Sun className="w-4 h-4 text-orange-400" />, group: 'Warm Audience', description: 'Gave contact details (Opt-ins).' },
  { value: 'warm-consideration', label: 'Consideration (Warm)', icon: <Sun className="w-4 h-4 text-orange-400" />, group: 'Warm Audience', description: 'Actively comparing you to others.' },
  { value: 'warm-community', label: 'Community (Warm)', icon: <Sun className="w-4 h-4 text-orange-400" />, group: 'Warm Audience', description: 'Part of your group/newsletter.' },
  
  // Hot Audience
  { value: 'hot-intent', label: 'High Intent (Hot)', icon: <Flame className="w-4 h-4 text-red-500" />, group: 'Hot Audience', description: 'Ready to buy, just need a nudge.' },
  { value: 'hot-abandoner', label: 'Cart Abandoner (Hot)', icon: <Flame className="w-4 h-4 text-red-500" />, group: 'Hot Audience', description: 'Left at checkout.' },
  { value: 'hot-objection', label: 'Objection-Heavy (Hot)', icon: <Flame className="w-4 h-4 text-red-500" />, group: 'Hot Audience', description: 'Interested but has specific doubts.' },
  { value: 'hot-repeat', label: 'Repeat Buyer (Hot)', icon: <Flame className="w-4 h-4 text-red-500" />, group: 'Hot Audience', description: 'Already bought, ready for more.' },
];

export const AudienceSelector: React.FC<AudienceSelectorProps> = ({ value, onChange, label = "Target Audience Type" }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
        <Users className="w-4 h-4" />
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as AudienceType)}
        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
      >
        <optgroup label="General">
          <option value="none">None (Default)</option>
        </optgroup>
        <optgroup label="❄️ Cold Audience (Strangers)">
          <option value="cold-unaware">Completely Unaware</option>
          <option value="cold-problem">Problem-Aware</option>
          <option value="cold-solution">Solution-Aware</option>
          <option value="cold-content">Content-Aware</option>
        </optgroup>
        <optgroup label="🌤 Warm Audience (Followers/Leads)">
          <option value="warm-engaged">Engaged Audience</option>
          <option value="warm-lead">Lead Audience</option>
          <option value="warm-consideration">Consideration Audience</option>
          <option value="warm-community">Community/Group Audience</option>
        </optgroup>
        <optgroup label="🔥 Hot Audience (Ready to Buy)">
          <option value="hot-intent">High Intent Audience</option>
          <option value="hot-abandoner">Cart Abandoners</option>
          <option value="hot-objection">Objection-Heavy Audience</option>
          <option value="hot-repeat">Repeat Buyers</option>
        </optgroup>
      </select>
      <p className="text-xs text-gray-500 dark:text-gray-400 italic">
        {audienceOptions.find(opt => opt.value === value)?.description}
      </p>
    </div>
  );
};
