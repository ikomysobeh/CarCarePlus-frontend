import { Tabs } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import ProblemTypesSection from './ProblemTypesSection';
import SuggestedProblemsSection from './SuggestedProblemsSection';
import SystemSettingsSection from './SystemSettingsSection';
import AiRulesSection from './AiRulesSection';

// Settings group (see docs/10 §9, updated by docs/11 §4). 4 tabs. Read access is no longer
// split by tab — admin now has `show.*` on all four (problem_types/suggested_problems were
// always read-only for admin; system_settings/ai_rules gained `show.*` for admin in the
// 2026-08-06 pull, so those two are no longer hidden entirely). Write stays super_admin-only
// on all four — each section gates its own Add/Edit/Delete via `canManageSettings`.
export default function SettingsPage() {
  const { t } = useTranslation();

  return (
    <Tabs.Root defaultValue="problemTypes" variant="line" colorPalette="brand">
      <Tabs.List mb={4} borderColor="line">
        <Tabs.Trigger value="problemTypes">{t('settings.problemTypes')}</Tabs.Trigger>
        <Tabs.Trigger value="suggestedProblems">{t('settings.suggestedProblems')}</Tabs.Trigger>
        <Tabs.Trigger value="systemSettings">{t('settings.systemSettings')}</Tabs.Trigger>
        <Tabs.Trigger value="aiRules">{t('settings.aiRules')}</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="problemTypes"><ProblemTypesSection /></Tabs.Content>
      <Tabs.Content value="suggestedProblems"><SuggestedProblemsSection /></Tabs.Content>
      <Tabs.Content value="systemSettings"><SystemSettingsSection /></Tabs.Content>
      <Tabs.Content value="aiRules"><AiRulesSection /></Tabs.Content>
    </Tabs.Root>
  );
}
