import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';

// Title row at the top of a screen: heading (+ optional subtitle) on one side, optional
// action (e.g. an "Add" button) on the other. RTL-aware via flex.
export default function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <Flex align="center" justify="space-between" gap={4} mb={6} wrap="wrap">
      <Box>
        <Heading size="lg" fontWeight="800">
          {title}
        </Heading>
        {subtitle && (
          <Text color="fgMuted" fontSize="sm" mt={1}>
            {subtitle}
          </Text>
        )}
      </Box>
      {action}
    </Flex>
  );
}
