import Redis from "ioredis";
import { afterAll, describe, expect, it } from "vitest";

const redisUrl = process.env.REDIS_URL;
const redisTlsUrl = (() => {
  if (!redisUrl) return null;
  try {
    const url = new URL(redisUrl);
    return url.protocol === "rediss:" && Boolean(url.password) && url.port === "6379" ? redisUrl : null;
  } catch {
    return null;
  }
})();
const client = redisTlsUrl
  ? new Redis(redisTlsUrl, {
      enableOfflineQueue: false,
      connectTimeout: 5_000,
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy: null,
    })
  : null;

if (client) client.on("error", () => undefined);

afterAll(() => client?.disconnect());

describe("configured Redis rate-limit store", () => {
  it.skipIf(!client)("accepts a configured TLS connection and responds to PING", async () => {
    await client!.connect();
    await expect(client!.ping()).resolves.toBe("PONG");
  });
});
