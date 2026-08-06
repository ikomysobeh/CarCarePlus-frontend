import { Tabs } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import PackagesSection from './PackagesSection';
import PackageServicesSection from './PackageServicesSection';
import PackageServiceSubServicesSection from './PackageServiceSubServicesSection';

// The 3 package resources as tabs, each a self-contained CRUD section — same shape as CatalogPage.
export default function PackagesPage() {
  const { t } = useTranslation();
  return (
    <Tabs.Root defaultValue="packages" variant="line" colorPalette="brand">
      <Tabs.List mb={4} borderColor="line">
        <Tabs.Trigger value="packages">{t('packages.tabPackages')}</Tabs.Trigger>
        <Tabs.Trigger value="services">{t('packages.tabServices')}</Tabs.Trigger>
        <Tabs.Trigger value="subServices">{t('packages.tabSubServices')}</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="packages"><PackagesSection /></Tabs.Content>
      <Tabs.Content value="services"><PackageServicesSection /></Tabs.Content>
      <Tabs.Content value="subServices"><PackageServiceSubServicesSection /></Tabs.Content>
    </Tabs.Root>
  );
}
