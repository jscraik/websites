if (import.meta.env.DEV) {
  const { mountLapse } = await import("@aiforui/lapse/panel");
  mountLapse();
}
