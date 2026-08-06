import { Box, Flex, Icon, SimpleGrid, Text } from '@chakra-ui/react';
import {
  MdOutlineDirectionsCar,
  MdOutlineCategory,
  MdOutlineBuild,
  MdOutlineLayers,
  MdOutlineDirectionsCarFilled,
  MdOutlineSell,
  MdInfoOutline,
} from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import StatCard from '../../components/StatCard';
import FeatureStatCard from '../../components/FeatureStatCard';
import { useAuth } from '../../auth/AuthContext';
import { useCars } from '../cars/api';
import { useCategories, useServices, useSubServices, useCarTypes, useCarBrands } from '../catalog/api';

// Dashboard landing — real counts from the endpoints we already have (catalog + cars).
export default function DashboardHome() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const cars = useCars();
  const categories = useCategories();
  const services = useServices();
  const subServices = useSubServices();
  const carTypes = useCarTypes();
  const carBrands = useCarBrands();
  const len = (d: unknown[] | undefined) => d?.length ?? 0;

  return (
    <Box>
      <Text fontSize="2xl" fontWeight="800">
        {t('dashboard.welcome', { name: user?.name ?? '' })} 👋
      </Text>
      <Text color="fgMuted" mb={6}>
        {t('dashboard.subtitle')}
      </Text>

      {/* Headline metrics — gradient "hero" cards with a backlight glow. Gradients stay in a
          cohesive cool family (blue → violet → purple) so they read as one set, not a rainbow. */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, xl: 5 }} gap={4} maxW="1200px">
        <FeatureStatCard label={t('nav.cars')} value={len(cars.data)} loading={cars.isLoading}
          icon={<MdOutlineDirectionsCar />} tint="#4F6BE6" />
        <FeatureStatCard label={t('catalog.categories')} value={len(categories.data)} loading={categories.isLoading}
          icon={<MdOutlineCategory />} tint="#635BE4" />
        <FeatureStatCard label={t('catalog.services')} value={len(services.data)} loading={services.isLoading}
          icon={<MdOutlineBuild />} tint="#7857E2" />
        <FeatureStatCard label={t('catalog.subServices')} value={len(subServices.data)} loading={subServices.isLoading}
          icon={<MdOutlineLayers />} tint="#8D53DF" />
        <FeatureStatCard label={t('catalog.carTypes')} value={len(carTypes.data)} loading={carTypes.isLoading}
          icon={<MdOutlineDirectionsCarFilled />} tint="#A24FDA" />
      </SimpleGrid>

      {/* The remaining metric as a plain card, sitting next to the KPI info panel. */}
      <Flex mt={4} gap={4} maxW="1200px" wrap="wrap" align="stretch">
        <Box w={{ base: 'full', md: '224px' }} flexShrink={0}>
          <StatCard label={t('catalog.carBrands')} value={len(carBrands.data)} loading={carBrands.isLoading}
            icon={<MdOutlineSell />} accent="cyan" />
        </Box>
        <Flex
          flex="1"
          minW="280px"
          bg="surface"
          borderWidth="1px"
          borderColor="line"
          rounded="card"
          p={4}
          gap={3}
          align="flex-start"
          color="fgMuted"
        >
          <Icon as={MdInfoOutline} boxSize={5} color="brand.400" mt={0.5} />
          <Text fontSize="sm">{t('dashboard.kpiNote')}</Text>
        </Flex>
      </Flex>
    </Box>
  );
}
