import { Flex, Icon, Text } from '@chakra-ui/react';
import { MdOutlineInbox } from 'react-icons/md';
import type { ReactNode } from 'react';

// Shown when a list has no rows (after loading succeeds).
export default function EmptyState({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <Flex direction="column" align="center" justify="center" py={12} gap={3} textAlign="center">
      <Icon as={MdOutlineInbox} boxSize={12} color="fgMuted" opacity={0.5} />
      <Text color="fgMuted">{message}</Text>
      {action}
    </Flex>
  );
}
