# Codex — Master Runbook Index

## Executive Summary

**codex-w** (working repo name; product display name TBD) is a local-first, sync-capable TTRPG toolkit covering the full play loop: dice, oracles, character sheets, interactive VTT maps, solo-RPG engines, and single/multiplayer sessions. Built for performance, offline resilience, and a premium visual experience.

## North Star

> **One beautiful workspace where any TTRPG—especially solo systems—can be played alone or together, online or offline, without friction.**

Every architectural decision filters through: *Does this work offline? Does it sync cleanly? Does it feel instant and look exceptional?*

## Table of Contents

| File | Purpose |
|------|---------|
| [01_ARCHITECTURE.md](./01_ARCHITECTURE.md) | Stack, patterns, data flow, external services |
| [02_COMPONENTS_AND_FILES.md](./02_COMPONENTS_AND_FILES.md) | Directory map, module responsibilities, config locations |
| [03_RULES_AND_STANDARDS.md](./03_RULES_AND_STANDARDS.md) | Conventions, error handling, testing, deployment |
| [04_CURRENT_STATE.md](./04_CURRENT_STATE.md) | What's working, broken, and next |
| [05_LOCAL_DEV.md](./05_LOCAL_DEV.md) | Docker Postgres, local full-stack workflow |

## Quick Reference

| Concern | Location |
|---------|----------|
| Web app entry | `apps/web/` |
| Shared UI | `packages/ui/` |
| Game mechanics (dice, oracles) | `packages/game-engine/` |
| Game system plugins (Loner, TOTV, …) | `packages/game-systems/` |
| Sync / offline | `packages/sync/` |
| Schemas & types | `packages/schemas/` |
| Realtime collab server | `apps/sync-server/` |
| Agent rules | `.cursor/rules/` + `.cursorrules` |

## Glossary

- **VTT** — Virtual Tabletop (interactive map/canvas)
- **Solo engine** — Structured prompts/oracles for single-player RPGs (Loner, TOTV, Snallygaster, Ironforge, etc.)
- **Game system plugin** — Self-contained module defining sheets, mechanics, and solo flows for one RPG
- **Local-first** — Client owns data; server reconciles; app works fully offline
