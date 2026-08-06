import { Tabs } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import MaterialUnitsSection from './MaterialUnitsSection';
import MaterialsSection from './MaterialsSection';
import InventoriesSection from './InventoriesSection';
import InventoryTransactionsSection from './InventoryTransactionsSection';

// Materials & Inventory (see docs/10 §5) — 4 tabs, same shape as CatalogPage/PricingPage.
export default function InventoryPage() {
  const { t } = useTranslation();
  return (
    <Tabs.Root defaultValue="units" variant="line" colorPalette="brand">
      <Tabs.List mb={4} borderColor="line">
        <Tabs.Trigger value="units">{t('inventory.units')}</Tabs.Trigger>
        <Tabs.Trigger value="materials">{t('inventory.materials')}</Tabs.Trigger>
        <Tabs.Trigger value="stock">{t('inventory.stock')}</Tabs.Trigger>
        <Tabs.Trigger value="transactions">{t('inventory.transactions')}</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="units"><MaterialUnitsSection /></Tabs.Content>
      <Tabs.Content value="materials"><MaterialsSection /></Tabs.Content>
      <Tabs.Content value="stock"><InventoriesSection /></Tabs.Content>
      <Tabs.Content value="transactions"><InventoryTransactionsSection /></Tabs.Content>
    </Tabs.Root>
  );
}
