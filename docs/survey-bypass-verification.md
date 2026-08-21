# Authenticated Survey Bypass Verification

On 2026-08-21, the authenticated `/audit` entry page was reviewed in the working build. The page displayed the secondary **“Take me into the app”** control below **“Start the Survey.”** Its rendered target is `/dashboard`.

The control is conditionally rendered only when `isAuthenticated` is true, so the guest survey remains available without an account and is not presented with a returning-member bypass.
