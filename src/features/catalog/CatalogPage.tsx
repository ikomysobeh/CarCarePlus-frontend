import { Tabs } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import CategoriesSection from './CategoriesSection';
import ServicesSection from './ServicesSection';
import SubServicesSection from './SubServicesSection';
import CarTypesSection from './CarTypesSection';
import CarBrandsSection from './CarBrandsSection';

// The 5 catalog resources as tabs, each a self-contained CRUD section.
export default function CatalogPage() {
  const { t } = useTranslation();
  return (
    <Tabs.Root defaultValue="categories" variant="line" colorPalette="brand">
      <Tabs.List mb={4} borderColor="line">
        <Tabs.Trigger value="categories">{t('catalog.categories')}</Tabs.Trigger>
        <Tabs.Trigger value="services">{t('catalog.services')}</Tabs.Trigger>
        <Tabs.Trigger value="subServices">{t('catalog.subServices')}</Tabs.Trigger>
        <Tabs.Trigger value="carTypes">{t('catalog.carTypes')}</Tabs.Trigger>
        <Tabs.Trigger value="carBrands">{t('catalog.carBrands')}</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="categories"><CategoriesSection /></Tabs.Content>
      <Tabs.Content value="services"><ServicesSection /></Tabs.Content>
      <Tabs.Content value="subServices"><SubServicesSection /></Tabs.Content>
      <Tabs.Content value="carTypes"><CarTypesSection /></Tabs.Content>
      <Tabs.Content value="carBrands"><CarBrandsSection /></Tabs.Content>
    </Tabs.Root>
  );
}
