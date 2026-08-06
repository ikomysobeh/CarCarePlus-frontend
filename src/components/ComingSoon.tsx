import { Badge, Box, Flex, Heading, Icon, Text } from '@chakra-ui/react';
import { MdConstruction } from 'react-icons/md';
import { useTranslation } from 'react-i18next';

// Styled placeholder for modules whose backend endpoints don't exist yet.
export default function ComingSoon({ title, note }: { title: string; note?: string }) {
  const { t } = useTranslation();
  return (
    <Box>
      <Heading size="lg" fontWeight="800" mb={6}>
        {title}
      </Heading>
      <Flex
        direction="column"
        align="center"
        textAlign="center"
        gap={3}
        maxW="560px"
        bg="surface"
        borderWidth="1px"
        borderColor="line"
        rounded="card"
        py={12}
        px={6}
      >
        <Icon as={MdConstruction} boxSize={14} color="orange.400" />
        <Badge colorPalette="orange" rounded="full" px={3} py={1}>
          {t('common.comingSoon')}
        </Badge>
        <Text color="fgMuted">{note ?? t('comingSoonBody')}</Text>
      </Flex>
    </Box>
  );
}
