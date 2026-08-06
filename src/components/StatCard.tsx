import { Badge, Box, Flex, Skeleton, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';

// A KPI tile (Chakra): big value + label on one side, a gradient icon badge on the other.
// `accent` is a Chakra color palette (blue, cyan, green, orange, purple, teal…).
export default function StatCard({
  label,
  value,
  icon,
  accent = 'blue',
  loading,
  delta,
  deltaUp,
}: {
  label: string;
  value: number | string;
  icon: ReactNode;
  accent?: string;
  loading?: boolean;
  delta?: string;
  deltaUp?: boolean;
}) {
  return (
    <Flex
      bg="surface"
      borderWidth="1px"
      borderColor="line"
      rounded="card"
      p={5}
      align="center"
      justify="space-between"
      gap={4}
      transition="border-color .2s, transform .2s"
      _hover={{ borderColor: 'brand.500', transform: 'translateY(-2px)' }}
    >
      <Box minW={0}>
        {loading ? (
          <Skeleton height="30px" width="64px" />
        ) : (
          <Text fontSize="3xl" fontWeight="800" lineHeight="1">
            {value}
          </Text>
        )}
        <Text fontSize="sm" color="fgMuted" mt={1.5}>
          {label}
        </Text>
        {delta && (
          <Badge mt={2} colorPalette={deltaUp ? 'green' : 'red'} variant="subtle" rounded="full">
            {delta}
          </Badge>
        )}
      </Box>
      <Flex
        w="52px"
        h="52px"
        rounded="badge"
        align="center"
        justify="center"
        color="white"
        fontSize="2xl"
        flexShrink={0}
        bgGradient="to-br"
        gradientFrom={`${accent}.400`}
        gradientTo={`${accent}.600`}
      >
        {icon}
      </Flex>
    </Flex>
  );
}
