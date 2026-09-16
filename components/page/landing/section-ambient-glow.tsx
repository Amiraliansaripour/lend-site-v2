/** Soft radial halo for dark mode only */
export function SectionAmbientGlow() {
  return (
    <div
      aria-hidden
      className={[
        'pointer-events-none absolute inset-0 hidden dark:block',
        'dark:bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--brand)_22%,transparent)_0%,transparent_60%)]',
        'dark:[mask-image:linear-gradient(to_bottom,transparent_0%,black_22%,black_78%,transparent_100%)]',
        'dark:[-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_22%,black_78%,transparent_100%)]',
      ].join(' ')}
    />
  );
}
