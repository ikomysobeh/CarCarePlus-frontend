import { Box, Flex, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';

// --- tiny colour helpers so one `tint` hex drives the whole card ---
const parse = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
};
const rgba = (hex: string, a: number) => {
  const [r, g, b] = parse(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};
// amt > 0 lightens toward white, amt < 0 darkens toward black — used to build the gradient stops.
const shade = (hex: string, amt: number) => {
  const [r, g, b] = parse(hex);
  const target = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  const m = (c: number) => Math.round((target - c) * p + c);
  return `rgb(${m(r)}, ${m(g)}, ${m(b)})`;
};

// A "hero" KPI tile: a SQUARE card with a bright light→dark colour GRADIENT (like the client's
// reference card), a glossy top-left highlight, a frosted icon badge, value + label at the
// bottom, and a soft backlight glow behind. Everything is derived from one `tint` hex.
export default function FeatureStatCard({
  label,
  value,
  icon,
  tint,
  loading,
}: {
  label: string;
  value: number | string;
  icon: ReactNode;
  tint: string;
  loading?: boolean;
}) {
  return (
    <Box position="relative">
      {/* Backlight glow — a blurred copy of the colour behind the card, nudged down. */}
      <Box
        aria-hidden
        position="absolute"
        inset="0"
        rounded="card"
        opacity={0.5}
        transform="translateY(14px) scale(0.92)"
        style={{ background: rgba(tint, 0.65), filter: 'blur(26px)' }}
        zIndex={0}
      />

      {/* The card: a true square with a bright light→dark gradient of the tint. */}
      <Flex
        position="relative"
        zIndex={1}
        direction="row"
        align="center"
        justify="space-between"
        // Icon + gap + padding are FIXED width, so they set the minimum the card can be before
        // the label starts wrapping. Trimmed from 72+16+48=136px down to 56+12+40=108px, which
        // is what lets six of these sit in a row without "Sub-services" breaking onto two lines.
        gap={3}
        minH="108px"
        rounded="card"
        p={5}
        overflow="hidden"
        color="white"
        boxShadow={`0 14px 34px -12px ${rgba(tint, 0.5)}`}
        transition="transform .2s, box-shadow .2s"
        _hover={{
          transform: 'translateY(-3px)',
          boxShadow: `0 20px 44px -12px ${rgba(tint, 0.62)}`,
          // Flip the icon front-to-back (3D, around the vertical axis) on card hover.
          '& .ccp-stat-icon': { transform: 'rotateY(360deg)' },
        }}
        style={{
          perspective: '600px',
          background: `linear-gradient(145deg, ${shade(tint, 0.14)} 0%, ${tint} 42%, ${shade(
            tint,
            -0.42,
          )} 100%)`,
          border: `1px solid ${rgba('#ffffff', 0.12)}`,
        }}
      >
        {/* Glossy highlight — a soft light source in the top-left corner, for depth. */}
        <Box
          aria-hidden
          position="absolute"
          inset="0"
          style={{
            background:
              'radial-gradient(120% 90% at 0% 0%, rgba(255,255,255,0.30), rgba(255,255,255,0) 55%)',
          }}
        />

        {/* Value + label on the start side (left in LTR / right in RTL). */}
        <Box position="relative" minW={0}>
          {loading ? (
            <Box height="36px" width="72px" rounded="md" bg="whiteAlpha.300" />
          ) : (
            <Text fontSize="4xl" fontWeight="800" lineHeight="1">
              {value}
            </Text>
          )}
          <Text fontSize="sm" color="whiteAlpha.800" mt={1.5} lineHeight="1.3">
            {label}
          </Text>
        </Box>

        {/* Big frosted 3D icon badge on the far side — fills the card horizontally. */}
        <Flex
          className="ccp-stat-icon"
          position="relative"
          w="56px"
          h="56px"
          rounded="badge"
          align="center"
          justify="center"
          fontSize="3xl"
          flexShrink={0}
          transition="transform 0.6s ease"
          style={{
            background: rgba('#ffffff', 0.18),
            border: `1px solid ${rgba('#ffffff', 0.32)}`,
            backdropFilter: 'blur(6px)',
            boxShadow: `0 12px 26px -8px ${rgba('#000000', 0.6)}`,
            filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.35))',
          }}
        >
          {icon}
        </Flex>
      </Flex>
    </Box>
  );
}
