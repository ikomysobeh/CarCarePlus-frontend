import { Button, Flex, Icon, Text } from '@chakra-ui/react';
import { MdErrorOutline } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { ApiError } from '../../api/types';

// Shown when a request fails. Reads a friendly message from ApiError + offers retry.
export default function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const { t } = useTranslation();
  const message =
    error instanceof ApiError ? error.message : t('common.error', { defaultValue: 'Something went wrong' });

  return (
    <Flex direction="column" align="center" justify="center" py={12} gap={3} textAlign="center">
      <Icon as={MdErrorOutline} boxSize={12} color="red.400" />
      <Text color="fgMuted">{message}</Text>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          {t('common.retry', { defaultValue: 'Retry' })}
        </Button>
      )}
    </Flex>
  );
}
