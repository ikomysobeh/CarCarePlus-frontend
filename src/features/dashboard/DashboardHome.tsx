import { Box, SimpleGrid, Text } from '@chakra-ui/react';
import {
  MdOutlineDirectionsCar,
  MdOutlineCategory,
  MdOutlineBuild,
  MdOutlineLayers,
  MdOutlineDirectionsCarFilled,
  MdOutlineSell,
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
      {/* Blue gradient welcome banner — echoes the customer app's header. */}
      <Box
        mb={6}
        p={{ base: 5, md: 6 }}
        rounded="card"
        color="white"
        style={{ background: 'linear-gradient(120deg, #0052CC 0%, #0066FF 60%, #3385FF 100%)' }}
        boxShadow="0 14px 34px -16px rgba(37,99,235,0.65)"
      >
        <Text fontSize="2xl" fontWeight="800">
          {t('dashboard.welcome', { name: user?.name ?? '' })} 👋
        </Text>
        <Text color="whiteAlpha.900" mt={1}>
          {t('dashboard.subtitle')}
        </Text>
      </Box>

      {/* Headline metrics — gradient "hero" cards. Blue-only ramp (deep navy → bright #0066FF)
          to match the logo, which dropped the green. */}
      {/* Car brands used to sit on its own row beside a "coming soon" KPI notice. The notice
          is gone, so the sixth card joins the grid instead of floating alone. */}
      {/* Three across, never six. The card is a horizontal layout whose icon + gap + padding
          reserve a fixed 108px before any text, so six-in-a-row only has room on screens wider
          than ~1800px — at 1280 and 1440, the two commonest laptop widths, it left 41px and
          67px for the label, which is what made "Sub-services" wrap. Column counts stay
          divisors of 6 so the last row is never half-empty. */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={4} maxW="1200px">
        <FeatureStatCard label={t('nav.cars')} value={len(cars.data)} loading={cars.isLoading}
          icon={<MdOutlineDirectionsCar />} tint="#1E3A8A" />
        <FeatureStatCard label={t('catalog.categories')} value={len(categories.data)} loading={categories.isLoading}
          icon={<MdOutlineCategory />} tint="#1E40AF" />
        <FeatureStatCard label={t('catalog.services')} value={len(services.data)} loading={services.isLoading}
          icon={<MdOutlineBuild />} tint="#1D4ED8" />
        <FeatureStatCard label={t('catalog.subServices')} value={len(subServices.data)} loading={subServices.isLoading}
          icon={<MdOutlineLayers />} tint="#2563EB" />
        <FeatureStatCard label={t('catalog.carTypes')} value={len(carTypes.data)} loading={carTypes.isLoading}
          icon={<MdOutlineDirectionsCarFilled />} tint="#0066FF" />
        <FeatureStatCard label={t('catalog.carBrands')} value={len(carBrands.data)} loading={carBrands.isLoading}
          icon={<MdOutlineSell />} tint="#1D4ED8" />
      </SimpleGrid>
    </Box>
  );
}
