import { Tabs } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import EmployeeReportsSection from './EmployeeReportsSection';
import GpsLogsSection from './GpsLogsSection';

// Field Ops (see docs/12 §M22) — 2 read-only tabs, same shape as InventoryPage.
export default function FieldOpsPage() {
  const { t } = useTranslation();
  return (
    <Tabs.Root defaultValue="reports" variant="line" colorPalette="brand">
      <Tabs.List mb={4} borderColor="line">
        <Tabs.Trigger value="reports">{t('fieldOps.tabReports')}</Tabs.Trigger>
        <Tabs.Trigger value="gps">{t('fieldOps.tabGps')}</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="reports"><EmployeeReportsSection /></Tabs.Content>
      <Tabs.Content value="gps"><GpsLogsSection /></Tabs.Content>
    </Tabs.Root>
  );
}
