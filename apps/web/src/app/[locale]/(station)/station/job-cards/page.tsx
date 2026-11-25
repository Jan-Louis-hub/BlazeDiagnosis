import type { Route } from 'next';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

import { AppShell } from '@/components/common/appShell';
import {
  FeatureChecklist,
  FeatureMetricGrid,
  FeatureRecordList,
} from '@/components/common/featureDashboard';
import { DefectSeverityBadge } from '@/components/job-cards/DefectSeverityBadge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { JobWorkPanel } from '@/features/job-cards/components/jobWorkPanel';
import { StaffingPanel } from '@/features/job-cards/components/staffingPanel';
import { stationChecklist, stationJobRecords } from '@/lib/sampleWorkflows';

const SEVERITY_EXAMPLES: Array<{
  id: string;
  finding: string;
  severity: unknown;
}> = [
  {
    id: 'sev-normal',
    finding: 'Battery voltage and terminal torque within spec',
    severity: 'normal',
  },
  {
    id: 'sev-advisory',
    finding: 'Front brake pads at 4 mm — monitor or plan replacement',
    severity: 'advisory',
  },
  {
    id: 'sev-critical',
    finding: 'Brake line leak — hold vehicle from release',
    severity: 'critical',
  },
  {
    id: 'sev-unknown',
    finding: 'Unrecognized severity code from legacy import',
    severity: 'legacy_code',
  },
];

export default function StationJobCardsPage() {
  return (
    <AppShell
      actions={
        <Button asChild variant="accent">
          <Link href={'/en/station/customers/new' as Route}>
            <PlusCircle className="size-4" />
            Start intake
          </Link>
        </Button>
      }
      description="Workshop job cards, assignments, blockers, diagnostics, and service status tracking."
      surface="station"
      title="Job cards"
    >
      <FeatureMetricGrid
        items={[
          { description: 'All active workshop jobs', label: 'Open jobs', value: '18' },
          { description: 'No mechanic assigned yet', label: 'Unassigned', value: '3' },
          { description: 'Parts or customer blockers', label: 'Blocked', value: '5' },
          { description: 'Ready for final review', label: 'Ready for QC', value: '4' },
        ]}
      />

      <FeatureRecordList
        description="A practical job queue that lets floor managers move work forward without relying on demo placeholders."
        items={stationJobRecords}
        title="Workshop action queue"
      />

      <FeatureChecklist
        description="These checks define the next production implementation work for job cards."
        items={stationChecklist}
        title="Job-card implementation checklist"
      />

      <Card>
        <CardHeader>
          <CardTitle>Defect severity classification</CardTitle>
          <CardDescription>
            Accessible severity badges pairing icons, labels, and guidance across
            light and dark mode; unknown values never default to normal.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {SEVERITY_EXAMPLES.map((item) => (
            <div className="rounded-lg border p-3 space-y-2" key={item.id}>
              <p className="text-sm font-medium">{item.finding}</p>
              <DefectSeverityBadge severity={item.severity} showDescription />
            </div>
          ))}
        </CardContent>
      </Card>

      <StaffingPanel />

      <JobWorkPanel />
    </AppShell>
  );
}