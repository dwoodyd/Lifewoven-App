# Frictionless Access and Conversion Timing QA

## Signup consent screen

On 2026-08-27, the development build rendered `/signup?returnTo=/dashboard` as a visible, branded Lifewoven consent screen before OAuth handoff. The screen included the Lifewoven mark, Terms of Service and Privacy Policy links, Manus-service disclosure for optional AI guidance, a clear “Continue to account creation” action, and an explicit existing-member Sign in link. The first initial browser frame was the branded loading state; the fully initialized view rendered the complete consent screen.
