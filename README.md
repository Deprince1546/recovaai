# Recova Vision

Create a new project with Supabase enabled. Build the full front end and backend of the uploaded tool Prompt using all necessary library and dependencies. IMPORTANT: DO NOT REBUILD OR REMOVE THE EXISTING RECOVA FUNCTIONALITY.



I have already provided and you have already built the RECOVA token creation, deployment, recovery, scanner, AI, backend, wallet connection, X Layer Testnet/Mainnet toggle, and contract compilation functionality.



Now I want you to REPLACE ONLY THE CURRENT VISUAL LANDING-PAGE DESIGN with the exact design language below.



Use the existing RECOVA functionality/components underneath this UI. Do not break, mock, simplify, or remove any working feature.



DESIGN SOURCE:

Use this exact Vesper.ai landing-page specification as the visual reference:

[PASTE THE VESPER DESIGN SPECIFICATION I PROVIDED ABOVE]



ADAPT IT TO RECOVA:

- Brand name: RECOVA

- Keep the existing RECOVA navigation/functionality.

- Keep the existing Create Token, Generate with AI, Scanner, Recovery, Wallet and network functionality.

- Do NOT add Vesper.ai text, Vesper sections, pricing, FAQs, or unrelated content.

- Preserve RECOVA's actual buttons and routes, but style them using the Vesper liquid-glass/metal visual language.

- Keep the black #000000 cinematic aesthetic.

- Use the exact Inter + Instrument Serif typography system from the specification.

- Use the exact button, navigation pill, badge, animation, spacing, responsive and mobile-menu styling from the specification.

- The main hero should use the existing RECOVA messaging/content rather than Vesper's copy.



VIDEO BACKGROUND:

Use this exact video as the RECOVA hero background:

https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260818_072341_50851634-bbc3-4c33-9acc-7647d4db44aa.mp4



The video must:

- Cover the entire hero viewport.

- Play automatically, muted, looped and inline.

- Have 100% opacity with NO dark overlay/scrim.

- Sit behind the UI while all text/buttons/navigation remain above it.

- Work on desktop and mobile.

- If the source HEVC/10-bit file cannot be decoded reliably, RE-ENCODE it to browser-compatible H.264 MP4 and WebM and use those generated assets.

- Generate/use a poster frame fallback.

- Do NOT replace the video with a gradient, static image or fake background.



LOGO:

Use the exact white SVG mark from the specification.

RECOVA must appear beside the mark.

The logo MUST render correctly in:

1. Lovable preview

2. Local production build

3. Vercel deployment



Do not use a broken relative asset path. Make the logo a reliable imported/static/public asset and verify it exists in the production build.



IMPORTANT:

Do not merely make the page look similar. Reproduce the visual system: black cinematic background, video positioning, typography, liquid-metal navigation pills, glass buttons, spacing, entrance animations, responsive behavior, burger menu, and stat styling.



FUNCTIONALITY PRESERVATION:

After applying the visual redesign, verify that:

- Connect Wallet still requires an actual OKX wallet connection/request and user signature/approval where required.

- X Layer Testnet/Mainnet toggle still works.

- Create Token still deploys the actual compiled recovery contract.

- ABI and bytecode still come from the actual Solidity compilation.

- Token creation still works on X Layer Testnet.

- Scanner still reads real X Layer contract data.

- Recovery actions still require the correct wallet authorization.

- AI generation still works.

- Backend/API integrations remain intact.

- No API keys are exposed in frontend code.



DO NOT MARK THIS COMPLETE JUST BECAUSE THE UI LOOKS CORRECT.



Before finishing:

1. Run the production build.

2. Fix all TypeScript/build/runtime errors.

3. Verify the video actually renders.

4. Verify the RECOVA logo renders.

5. Verify wallet connection works.

6. Verify Testnet/Mainnet switching works.

7. Verify Create Token works on X Layer Testnet.

8. Verify the scanner works with a real X Layer contract.

9. Verify the deployed production build works on Vercel.



The final result must be the existing fully functional RECOVA application using this exact cinematic Vesper-inspired landing-page design system.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/71cff87f-02cf-4672-b52b-70a27c4ce5d0).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
