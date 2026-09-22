# Staging Load-Test Report — 2026-09-22

**Author:** Manus AI

## Result

The authenticated staging harness is now repeatable and was exercised without PayPal or other payment paths. The busiest tested read path, `profile.dashboard`, remained error-free through **75 concurrent connections**. Response time began to rise at 25 connections and rose materially at 50 and 75 connections. The four-concurrent-request AI probe reached its failure threshold: two journal-prompt requests completed and two timed out.

This was a **local staging run** against the project’s development server at `127.0.0.1:3000`, using the project database and one isolated load-test account. It is not a published-host, multi-instance, or internet-ingress benchmark. Its findings therefore identify application and database behavior in this environment, not a production concurrency commitment.

## Scope and safeguards

The harness minted a 15-minute session for the dedicated `loadtest-staging-20260921` account. Its token is emitted only at run time and is not stored in source control. Each HTTP scenario used a distinct reserved documentation-range forwarded address to prevent the application-wide IP limiter from conflating sequential scenarios.

The test used the dashboard read procedure, the `checkIn.create` write procedure, and the economical `journal.generatePrompt` AI procedure. It did not call PayPal, subscription, store, download, or any real-user session. The AI scenario is opt-in through `LOAD_TEST_INCLUDE_AI=1` so future read/write tests do not create model work unintentionally.

## Measurements

| Scenario | Completed requests | Concurrent connections | Mean latency | p99 latency | Errors / timeouts | Interpretation |
|---|---:|---:|---:|---:|---:|---|
| Dashboard | 150 | 10 | 146 ms | 247 ms | 0 / 0 | Healthy baseline for this environment. |
| Dashboard | 150 | 25 | 298 ms | 533 ms | 0 / 0 | Latency has begun to climb. |
| Dashboard | 150 | 50 | 586 ms | 845 ms | 0 / 0 | Clear queueing or shared-resource pressure, but no request failures. |
| Dashboard | 150 | 75 | 730 ms | 1,150 ms | 0 / 0 | Highest tested read concurrency; still successful, but p99 exceeds one second. |
| Check-in write | 40 | 10 | 104 ms | 227 ms | 0 / 0 | The isolated-account write path stayed healthy. |
| Journal AI prompt | 2 completed | 4 | 8,375 ms | 8,924 ms | 2 / 2 | The first tested AI concurrency level was already beyond the observed timeout boundary. |

## Practical threshold

For the dashboard read path, the first measurable degradation is **25 concurrent connections**. The practical caution point is **50 concurrent connections**, where average latency is roughly four times the 10-connection baseline and p99 approaches one second. At **75 concurrent connections**, every completed request still returned a successful HTTP status, but p99 reached 1.15 seconds. No dashboard response errors occurred in the 600 dashboard requests across the four stages.

The AI result should be treated separately. The four-concurrent journal-prompt scenario produced two timeouts. This is not evidence that the application’s own request handling failed, because the path awaits an external language-model response. It does show that the current local environment does not sustain four simultaneous end-to-end prompt requests within the autocannon timeout window. A future production test should collect upstream model timing and set an explicit user-facing timeout budget before treating the AI path as spike-ready.

## Harness corrections and runtime configuration

The initial harness failure was caused by SDK initialization output being written into the shell-captured session cookie. The session minting utility now redirects that diagnostic to standard error, leaving standard output as a single compact JWT. A direct authenticated dashboard call returned `200` after the correction.

The configured `REDIS_URL` is not a valid TLS Redis endpoint, so the server now explicitly requires `rediss://:PASSWORD@HOST:6379` before attempting a Redis connection. With the current configuration it logs one clear fallback message and uses the existing in-memory limiter. This prevents the prior recurring `EACCES` connection-error noise, but it does not provide shared, cross-instance rate-limit state. The Redis connectivity test remains intentionally skipped until a valid endpoint is configured.

## Reproduction

The committed harness consists of `validation/mint-load-test-session.mts` and `validation/run-staging-load-test.mjs`. To repeat the run in a non-production environment, mint a fresh session, then invoke the runner with `LOAD_TEST_INCLUDE_AI=1` only when intentionally exercising the model path. The runner keeps payment routes out of scope.

## References

[1]: file:///home/ubuntu/lifeos/validation/run-staging-load-test.mjs "Authenticated staging load-test runner"
[2]: file:///home/ubuntu/lifeos/validation/mint-load-test-session.mts "Ephemeral isolated load-test session utility"
[3]: https://www.npmjs.com/package/autocannon "Autocannon HTTP benchmarking tool"
