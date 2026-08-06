import { Tabs } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import PricingRuleTypesSection from './PricingRuleTypesSection';
import PricingRulesSection from './PricingRulesSection';

// Dynamic pricing engine — rule types (categories) + rules (adjustments), same tabbed
// CRUD shape as CatalogPage. See docs/09.
export default function PricingPage() {
  const { t } = useTranslation();
  return (
    <Tabs.Root defaultValue="ruleTypes" variant="line" colorPalette="brand">
      <Tabs.List mb={4} borderColor="line">
        <Tabs.Trigger value="ruleTypes">{t('pricing.ruleTypes')}</Tabs.Trigger>
        <Tabs.Trigger value="rules">{t('pricing.rules')}</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="ruleTypes"><PricingRuleTypesSection /></Tabs.Content>
      <Tabs.Content value="rules"><PricingRulesSection /></Tabs.Content>
    </Tabs.Root>
  );
}
