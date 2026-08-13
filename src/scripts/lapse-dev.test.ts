import { expect, it, vi } from "vitest";

const lapse = vi.hoisted(() => ({ mountLapse: vi.fn() }));

vi.mock("@aiforui/lapse/panel", () => lapse);

it("mounts the development animation inspector", async () => {
  await import("./lapse-dev");

  expect(lapse.mountLapse).toHaveBeenCalledOnce();
});
