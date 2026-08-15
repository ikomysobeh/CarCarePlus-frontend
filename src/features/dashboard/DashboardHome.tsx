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

      {/* Headline metrics — gradient "hero" cards. Tints step along the logo's own transition,
          carcare (blue) → plus (green), so they read as one cohesive brand set. */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, xl: 5 }} gap={4} maxW="1200px">
        <FeatureStatCard label={t('nav.cars')} value={len(cars.data)} loading={cars.isLoading}
          icon={<MdOutlineDirectionsCar />} tint="#1E40AF" />
        <FeatureStatCard label={t('catalog.categories')} value={len(categories.data)} loading={categories.isLoading}
          icon={<MdOutlineCategory />} tint="#1D4ED8" />
        <FeatureStatCard label={t('catalog.services')} value={len(services.data)} loading={services.isLoading}
          icon={<MdOutlineBuild />} tint="#0E7490" />
        <FeatureStatCard label={t('catalog.subServices')} value={len(subServices.data)} loading={subServices.isLoading}
          icon={<MdOutlineLayers />} tint="#0D9488" />
        <FeatureStatCard label={t('catalog.carTypes')} value={len(carTypes.data)} loading={carTypes.isLoading}
          icon={<MdOutlineDirectionsCarFilled />} tint="#059669" />
      </SimpleGrid>

      {/* Car brands as a matching gradient card, next to the KPI info panel. */}
      <Flex mt={4} gap={4} maxW="1200px" wrap="wrap" align="stretch">
        <Box w={{ base: 'full', md: '224px' }} flexShrink={0}>
          <FeatureStatCard label={t('catalog.carBrands')} value={len(carBrands.data)} loading={carBrands.isLoading}
            icon={<MdOutlineSell />} tint="#0D9488" />
        </Box>
        <Flex
          flex="1"
          minW="280px"
          borderWidth="1px"
          borderColor="line"
          rounded="card"
          p={5}
          gap={3}
          align="center"
          style={{
            background:
              'linear-gradient(145deg, rgba(37,99,235,0.16), rgba(13,148,136,0.10)), var(--ccp-colors-surface)',
          }}
        >
          <Icon as={MdInfoOutline} boxSize={5} color="accent.500" mt={0.5} />
          <Box>
            <Text fontSize="sm" fontWeight="700" color="fg">
              {t('dashboard.kpiTitle')}
            </Text>
            <Text fontSize="xs" color="fgMuted" mt={0.5} lineHeight="1.6">
              {t('dashboard.kpiNote')}
            </Text>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
}
