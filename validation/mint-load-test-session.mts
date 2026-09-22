// The SDK announces its initialization through console.log. Keep that diagnostic
// on stderr so stdout remains a cookie-safe, single-token contract for the runner.
const originalLog = console.log;
console.log = (...args: unknown[]) => console.error(...args);
const { sdk } = await import("../server/_core/sdk");
console.log = originalLog;

const openId = process.env.LOAD_TEST_OPEN_ID ?? "loadtest-staging-20260921";
const token = await sdk.createSessionToken(openId, {
  name: "Staging Load Test",
  expiresInMs: 15 * 60 * 1000,
});
process.stdout.write(token);
