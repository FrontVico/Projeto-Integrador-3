# Frontend Agent Prompt (VanControl) - Prescriptive

You are assisting on the frontend of VanControl (Expo Router, React Native, TypeScript). Follow the existing UI patterns and service layer conventions strictly. Keep visual style consistent with current screens.

## Project context and references
- App root: [VanControl](VanControl)
- Tabs layout: [VanControl/app/(main)/_layout.tsx](VanControl/app/(main)/_layout.tsx)
- Auth screens: [VanControl/app/login.tsx](VanControl/app/login.tsx), [VanControl/app/register.tsx](VanControl/app/register.tsx)
- Dashboard routing by role: [VanControl/app/(main)/index.tsx](VanControl/app/(main)/index.tsx)
- API client: [VanControl/services/api.ts](VanControl/services/api.ts)
- Auth hook: [VanControl/hooks/useAuth.ts](VanControl/hooks/useAuth.ts)
- Dashboard UI patterns: [VanControl/components/DashboardAdmin.tsx](VanControl/components/DashboardAdmin.tsx)

## Non-negotiable rules
- Do not call fetch directly from screens. Use or add functions in services/api.ts.
- Do not create new navigation systems. Use Expo Router and file-based routes only.
- Do not change the visual direction (dark, gradient-forward) without explicit request.
- Do not bypass useAuth for role gating. Use user.role and user.sub.
- Do not add new external UI libraries without explicit request.

## Architecture and navigation
- Screens live in app and app/(main) for tabbed routes. Keep this structure.
- Use router.push, router.replace, router.back for navigation.
- Keep screens as function components with hooks for state and effects.
- New screens must export a default function component.

## Service layer and auth
- All HTTP calls go through services/api.ts.
- Auth tokens are stored in AsyncStorage key @vancontrol:token and sent as Bearer tokens when auth is true.
- Public endpoints (login/register) must set auth: false.
- Role and user info comes from useAuth; roles are ADMIN, MOTORISTA, PASSAGEIRO and cpf is user.sub.

## UI and styling rules
- Use LinearGradient backgrounds. Do not use flat single-color screen backgrounds.
- Use Animated for entrance transitions and error feedback (fade/slide/shake).
- Use StyleSheet for all styles. No inline style objects except for small, local overrides.
- Keep spacing, rounded corners, and soft borders consistent with existing screens.
- Use these colors as base cues: #050a1e, #2563eb, #0ea5e9, #a78bfa, #f59e0b, #22c55e.

## Data loading and states
- Use useEffect for initial fetches.
- Show ActivityIndicator while loading.
- When multiple requests are needed, use Promise.allSettled and handle partial failures.
- Provide empty and error states with clear, user-friendly messages.

## Forms and validation
- Validate inputs before calling the API.
- Reuse formatting logic for cpf, telefone, cep when relevant.
- Errors must be stored in state and animated in (as in login/register).

## Change checklist (must satisfy)
- New screen? Add route file and wire navigation if needed.
- New API usage? Add or update services/api.ts method first.
- New role-based behavior? Gate by user.role from useAuth.
- New data model? Add explicit TypeScript types or interfaces.
- Loading/errors handled? Include loading indicator and error/empty states.

## Output expectations
- Prefer minimal changes and reuse existing components/styles.
- When adding a new screen, update navigation or tabs as needed.
- Keep TypeScript types explicit for data models when possible.
- Do not refactor unrelated code.
