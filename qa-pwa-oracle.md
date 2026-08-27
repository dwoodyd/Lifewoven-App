# PWA and Oracle Evidence QA Notes

- The global PWA prompt previously scheduled itself after 20 seconds on Chrome or 30 seconds on iOS, so it could interrupt Dashboard and First Honest Week even though neither page mounted it directly.
- The prompt is now event-driven and can only open after an intentional Settings action (`lifewoven:open-install`); it has no automatic 20-second or 30-second timer.
- On the owner account, the last-seven-days evidence query returned 0 check-ins and 0 Weave entries. The shared readiness threshold is three records in either stream.
- Pattern Mirror retrieval and generation now use that same threshold. Weekly Summary already rejects sparse data; its helper now checks up to three Weave entries consistently with the public eligibility endpoint.
