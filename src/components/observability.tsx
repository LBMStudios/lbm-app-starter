export async function Observability() {
  if (process.env.NEXT_PUBLIC_VERCEL_OBSERVABILITY !== "1") {
    return null;
  }

  const [{ Analytics }, { SpeedInsights }] = await Promise.all([
    import("@vercel/analytics/next"),
    import("@vercel/speed-insights/next"),
  ]);

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
