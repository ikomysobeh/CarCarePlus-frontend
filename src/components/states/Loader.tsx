import { Flex, Spinner, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

// Centered spinner for "data is loading" areas.
export default function Loader({ message }: { message?: string }) {
  const { t } = useTranslation();
  return (
    <Flex direction="column" align="center" justify="center" py={12} gap={3}>
      <Spinner size="lg" color="brand.500" borderWidth="3px" />
      <Text color="fgMuted" fontSize="sm">
        {message ?? t('common.loading')}
      </Text>
    </Flex>
  );
}
