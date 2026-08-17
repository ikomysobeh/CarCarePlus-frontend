import {
  Box,
  Button,
  Drawer,
  Flex,
  HStack,
  IconButton,
  Input,
  InputGroup,
  Portal,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import {
  MdOutlineLightMode,
  MdOutlineDarkMode,
  MdLogout,
  MdSearch,
  MdOutlineNotifications,
  MdMenu,
} from 'react-icons/md';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthContext';
import { useColorMode } from '../theme/colorMode';
import { Logo } from '../components';
import { MODULES_BY_ROLE, BUILT_MODULES, canSeeNotifications } from '../utils/permissions';
import { useUnreadCount } from '../features/notifications/api';
import NotificationsDialog from '../features/notifications/NotificationsDialog';
import { NAV_ITEMS, type NavGroup } from './navConfig';
import i18n from '../i18n';

const SIDEBAR_W = '260px';
const GROUP_ORDER: NavGroup[] = ['main', 'system'];

export default function DashboardLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { mode, toggle } = useColorMode();
  const location = useLocation();

  const [notifOpen, setNotifOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  // Close the mobile drawer whenever the route changes. Without this it stays open on top of
  // the page the user just navigated to, so every nav tap needs a second tap to dismiss it.
  useEffect(() => setNavOpen(false), [location.pathname]);

  // The bell is hidden for roles the backend never granted `show.notifications` to (customers),
  // so we never render a control whose every request would 403.
  const showBell = user ? canSeeNotifications(user.role) : false;
  const unread = useUnreadCount(showBell);
  const unreadCount = unread.data?.unread_count ?? 0;

  // Only modules that are actually BUILT reach the nav. Unbuilt ones used to render in a
  // collapsed "Coming soon" section; that has been dropped, so they are simply filtered out.
  const allowed = user ? MODULES_BY_ROLE[user.role] : [];
  const realItems = NAV_ITEMS.filter(
    (i) => allowed.includes(i.key) && BUILT_MODULES.includes(i.key),
  );
  const toggleLang = () => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');

  const isActive = (route: string) =>
    route === '/' ? location.pathname === '/' : location.pathname.startsWith(route);

  // One nav row.
  const NavRow = ({ item }: { item: (typeof NAV_ITEMS)[number] }) => {
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
        bg={active ? 'navActiveBg' : 'transparent'}
        color={active ? 'brand.fg' : 'fgMuted'}
        fontWeight={active ? '700' : '500'}
        borderInlineStartWidth="3px"
        borderColor={active ? 'brand.400' : 'transparent'}
        _hover={active ? {} : { bg: 'navHoverBg', color: 'fg' }}
        transition="all 0.15s"
      >
        <Box fontSize="lg" display="flex">{item.icon}</Box>
        <Text flex="1" fontSize="sm">{t(`nav.${item.key}`)}</Text>
      </HStack>
    );
  };

  // The nav is rendered TWICE — as the permanent desktop column and inside the mobile drawer —
  // so it lives in one variable. Duplicating this JSX would mean every future nav change has
  // to be made in two places, and the two would drift.
  const sidebarContent = (
    <>
      {/* Brand lockup: mark + wordmark. The old version was a 104px logo on a hand-written
            radial glow — a huge bright blob that outweighed the navigation it sits above.
            A 44px mark beside the product name carries the same identity at a fraction of the
            visual weight, and the glow is gone because the emblem no longer needs to punch
            through a white disc. */}
        <HStack mb={6} px={2} py={3} gap={3}>
          <Logo height={44} />
          <Text fontSize="md" fontWeight="800" letterSpacing="tight" color="fg" lineHeight="1">
            CarCarePlus
          </Text>
        </HStack>

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

        </Stack>

        <Button
          onClick={() => logout()}
          variant="ghost"
          justifyContent="flex-start"
          color="fgMuted"
          _hover={{ bg: 'navHoverBg', color: 'red.400' }}
          rounded="lg"
        >
          <MdLogout />
          {t('nav.logout')}
        </Button>
    </>
  );

  return (
    <Flex
      minH="100vh"
      bg="appBg"
      backgroundImage="var(--app-bg-grad)"
      backgroundAttachment="fixed"
      color="fg"
    >
      {/* Desktop sidebar. Below `lg` it is removed entirely rather than narrowed: at 260px it
          was eating two thirds of a phone screen, leaving ~115px for the actual page. */}
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
        display={{ base: 'none', lg: 'flex' }}
        flexDirection="column"
        css={{ scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}
      >
        {sidebarContent}
      </Box>

      {/* Mobile / tablet nav — same content, off-canvas. `placement="start"` is direction-aware,
          so it slides in from the left in English and from the right in Arabic. */}
      <Drawer.Root
        open={navOpen}
        onOpenChange={(e) => setNavOpen(e.open)}
        placement="start"
        size="xs"
      >
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content
              bg="surface"
              color="fg"
              px={3}
              py={4}
              display="flex"
              flexDirection="column"
              overflowY="auto"
            >
              {sidebarContent}
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>

      {/* Main */}
      <Box flex="1" minW={0} display="flex" flexDirection="column">
        {/* Top bar */}
        <Flex
          as="header"
          align="center"
          gap={{ base: 1, md: 3 }}
          px={{ base: 3, md: 6 }}
          py={{ base: 3, md: 4 }}
          borderBottomWidth="1px"
          borderColor="line"
          position="sticky"
          top={0}
          bg="transparent"
          zIndex={1}
        >
          {/* Mirrors the sidebar's breakpoint exactly — the hamburger appears at precisely the
              width where the permanent column disappears, so navigation is never unreachable. */}
          <IconButton
            aria-label={t('nav.menu', { defaultValue: 'Menu' })}
            variant="ghost"
            rounded="full"
            display={{ base: 'flex', lg: 'none' }}
            onClick={() => setNavOpen(true)}
          >
            <MdMenu />
          </IconButton>
          {/* Hidden on phones: with the hamburger, bell, theme and language controls all on one
              row there is no honest room left for it. */}
          <InputGroup
            flex="1"
            maxW="420px"
            startElement={<MdSearch />}
            display={{ base: 'none', md: 'flex' }}
          >
            <Input placeholder={t('common.search')} bg="surface" borderColor="line" rounded="full" />
          </InputGroup>
          <Box flex="1" />
          {showBell && (
            <Box position="relative">
              <IconButton
                aria-label={t('notifications.title')}
                variant="ghost"
                rounded="full"
                onClick={() => setNotifOpen(true)}
              >
                <MdOutlineNotifications />
              </IconButton>
              {unreadCount > 0 && (
                <Box
                  position="absolute"
                  top="2px"
                  insetInlineEnd="2px"
                  minW="18px"
                  h="18px"
                  px={1}
                  rounded="full"
                  bg="red.500"
                  color="white"
                  fontSize="10px"
                  fontWeight="700"
                  lineHeight="18px"
                  textAlign="center"
                  pointerEvents="none"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Box>
              )}
            </Box>
          )}
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

        <Box p={{ base: 4, md: 6 }} flex="1" minW={0}>
          <Outlet />
        </Box>
      </Box>

      {showBell && (
        <NotificationsDialog open={notifOpen} onClose={() => setNotifOpen(false)} />
      )}
    </Flex>
  );
}
