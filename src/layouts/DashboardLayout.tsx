import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Input,
  InputGroup,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useState } from 'react';
import {
  MdOutlineLightMode,
  MdOutlineDarkMode,
  MdLogout,
  MdSearch,
  MdExpandMore,
  MdChevronRight,
} from 'react-icons/md';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthContext';
import { useColorMode } from '../theme/colorMode';
import { Logo } from '../components';
import { MODULES_BY_ROLE, BUILT_MODULES } from '../utils/permissions';
import { NAV_ITEMS, type NavGroup } from './navConfig';
import i18n from '../i18n';

const SIDEBAR_W = '260px';
const GROUP_ORDER: NavGroup[] = ['main', 'system'];

export default function DashboardLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { mode, toggle } = useColorMode();
  const location = useLocation();

  const [showSoon, setShowSoon] = useState(false);

  const allowed = user ? MODULES_BY_ROLE[user.role] : [];
  const items = NAV_ITEMS.filter((i) => allowed.includes(i.key));
  // Split real (built) modules from the "coming soon" placeholders — the latter are collapsed
  // into one section so the everyday nav fits on screen without scrolling.
  const realItems = items.filter((i) => BUILT_MODULES.includes(i.key));
  const soonItems = items.filter((i) => !BUILT_MODULES.includes(i.key));
  const toggleLang = () => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');

  const isActive = (route: string) =>
    route === '/' ? location.pathname === '/' : location.pathname.startsWith(route);

  // One nav row (used for both real and "soon" items). Soon rows are dimmed.
  const NavRow = ({ item, dim }: { item: (typeof NAV_ITEMS)[number]; dim?: boolean }) => {
    const active = isActive(item.route);
    return (
      <HStack
        as={Link}
        {...{ to: item.route }}
        gap={3}
        px={3}
        py={2}
        rounded="lg"
        cursor="pointer"
        opacity={dim ? 0.65 : 1}
        bg={active ? 'rgba(37,99,235,0.14)' : 'transparent'}
        color={active ? 'brand.300' : 'fgMuted'}
        fontWeight={active ? '700' : '500'}
        borderInlineStartWidth="3px"
        borderColor={active ? 'brand.400' : 'transparent'}
        _hover={active ? {} : { bg: 'whiteAlpha.100', color: 'fg' }}
        transition="all 0.15s"
      >
        <Box fontSize="lg" display="flex">{item.icon}</Box>
        <Text flex="1" fontSize="sm">{t(`nav.${item.key}`)}</Text>
      </HStack>
    );
  };

  return (
    <Flex minH="100vh" bg="transparent" color="fg">
      {/* Sidebar */}
      <Box
        as="aside"
        w={SIDEBAR_W}
        flexShrink={0}
        bg="transparent"
        borderInlineEndWidth="1px"
        borderColor="line"
        position="sticky"
        top={0}
        h="100vh"
        overflowY="auto"
        px={3}
        py={4}
        display="flex"
        flexDirection="column"
        css={{ scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}
      >
        <Box px={2} mb={6}>
          <Logo height={92} />
        </Box>

        <Stack gap={4} flex="1">
          {GROUP_ORDER.map((group) => {
            const groupItems = realItems.filter((i) => i.group === group);
            if (!groupItems.length) return null;
            return (
              <Box
                key={group}
                borderTopWidth={group === 'system' ? '1px' : undefined}
                borderColor="line"
                pt={group === 'system' ? 4 : 0}
              >
                <Text fontSize="xs" fontWeight="700" color="fgMuted" textTransform="uppercase" px={3} mb={1.5}>
                  {t(`nav.group.${group}`)}
                </Text>
                <Stack gap={0.5}>
                  {groupItems.map((item) => (
                    <NavRow key={item.key} item={item} />
                  ))}
                </Stack>
              </Box>
            );
          })}

          {/* Coming-soon modules — collapsed by default so they don't overflow the sidebar. */}
          {soonItems.length > 0 && (
            <Box>
              <HStack
                as="button"
                {...{ type: 'button' }}
                onClick={() => setShowSoon((s) => !s)}
                w="full"
                px={3}
                py={1.5}
                gap={2}
                color="fgMuted"
                cursor="pointer"
                _hover={{ color: 'fg' }}
              >
                <Text flex="1" textAlign="start" fontSize="xs" fontWeight="700" textTransform="uppercase">
                  {t('nav.group.soon', { defaultValue: 'Coming soon' })} ({soonItems.length})
                </Text>
                <Box fontSize="lg" display="flex">
                  {showSoon ? <MdExpandMore /> : <MdChevronRight />}
                </Box>
              </HStack>
              {showSoon && (
                <Stack gap={0.5} mt={1}>
                  {soonItems.map((item) => (
                    <NavRow key={item.key} item={item} dim />
                  ))}
                </Stack>
              )}
            </Box>
          )}
        </Stack>

        <Button
          onClick={() => logout()}
          variant="ghost"
          justifyContent="flex-start"
          color="fgMuted"
          _hover={{ bg: 'surface', color: 'red.400' }}
          rounded="lg"
        >
          <MdLogout />
          {t('nav.logout')}
        </Button>
      </Box>

      {/* Main */}
      <Box flex="1" minW={0} display="flex" flexDirection="column">
        {/* Top bar */}
        <Flex
          as="header"
          align="center"
          gap={3}
          px={6}
          py={4}
          borderBottomWidth="1px"
          borderColor="line"
          position="sticky"
          top={0}
          bg="transparent"
          zIndex={1}
        >
          <InputGroup flex="1" maxW="420px" startElement={<MdSearch />}>
            <Input placeholder={t('common.search')} bg="surface" borderColor="line" rounded="full" />
          </InputGroup>
          <Box flex="1" />
          <IconButton aria-label="theme" variant="ghost" onClick={toggle} rounded="full">
            {mode === 'dark' ? <MdOutlineLightMode /> : <MdOutlineDarkMode />}
          </IconButton>
          <Button variant="ghost" onClick={toggleLang} rounded="full">
            {i18n.language === 'ar' ? 'EN' : 'ع'}
          </Button>
          <Text fontSize="sm" color="fgMuted" display={{ base: 'none', md: 'block' }}>
            {user?.name}
          </Text>
        </Flex>

        <Box p={6} flex="1">
          <Outlet />
        </Box>
      </Box>
    </Flex>
  );
}
