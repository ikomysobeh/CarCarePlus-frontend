import { Box, Flex, Skeleton, Text } from '@chakra-ui/react';
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
        direction="column"
        justify="space-between"
        aspectRatio={1}
        rounded="card"
        p={5}
        overflow="hidden"
        color="white"
        boxShadow="0 10px 30px -14px rgba(0,0,0,0.7)"
        transition="transform .2s"
        _hover={{ transform: 'translateY(-2px)' }}
        style={{
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

        {/* Frosted icon badge, top-left. */}
        <Flex
          position="relative"
          w="42px"
          h="42px"
          rounded="badge"
          align="center"
          justify="center"
          fontSize="xl"
          style={{
            background: rgba('#ffffff', 0.2),
            border: `1px solid ${rgba('#ffffff', 0.3)}`,
            backdropFilter: 'blur(6px)',
          }}
        >
          {icon}
        </Flex>

        {/* Value + label clustered together at the bottom. */}
        <Box position="relative">
          {loading ? (
            <Skeleton height="32px" width="70px" />
          ) : (
            <Text fontSize="3xl" fontWeight="800" lineHeight="1">
              {value}
            </Text>
          )}
          <Text fontSize="sm" color="whiteAlpha.800" mt={1.5}>
            {label}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}
