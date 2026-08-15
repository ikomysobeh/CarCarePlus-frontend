// The CarCarePlus logo — the client's transparent PNG (public/brand/logo.png), floating with
// no box. NOTE: the "carcare" wordmark is dark navy, which is low-contrast on the dark UI; the
// soft drop-shadow lifts it a little. If it still reads too dim, we can add a subtle backlight
// halo or a light version for dark mode.
export default function Logo({ height = 44 }: { height?: number }) {
  return (
    <img
      src="/brand/logo.png"
      alt="CarCarePlus"
      style={{
        height,
        width: 'auto',
        display: 'block',
        filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.35))',
      }}
    />
  );
}
