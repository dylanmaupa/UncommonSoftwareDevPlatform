import { Badge } from '../../../../components/ui/badge';
import type { StudentRiskLevel } from '../../types/instructor.types';

interface StatusBadgeProps {
  riskLevel: StudentRiskLevel;
}

const levelClasses: Record<StudentRiskLevel, string> = {
  'on-track': 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  'needs-attention': 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  'at-risk': 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
};

const labelByLevel: Record<StudentRiskLevel, string> = {
  'on-track': 'On Track',
  'needs-attention': 'Needs Attention',
  'at-risk': 'At Risk',
};

export default function StatusBadge({ riskLevel }: StatusBadgeProps) {
  return (
    <Badge className={`border text-xs font-medium ${levelClasses[riskLevel]}`}>
      {labelByLevel[riskLevel]}
    </Badge>
  );
}
