# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/2.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0-alpha.53] - 2026-11-16

### Added

- **connected-solid:** Read links from Link header of a Solid resource. (#165)
- **vue:** Add [Vue](https://vuejs.org) support with `@ldo/vue` package. ([#171](https://github.com/o-development/ldo/pull/171))
- **solid-react:** Implement OIDC register flow when calling `signUp` of `useSolidAuth` React hook. (56d76dcb24e03cc6a21dc0da95d50e0e4c7318ec)

### Changed

- Use global `fetch` instead of `cross-fetch`. (#134)
- **connected-solid:** Use `PUT` instead of `POST` to create Solid resources. (#164)
- **connected-solid:** Use HTTP Semantics to ensure existing resource is not overwritten. (#164)

### Removed

- **Breaking:** Remove commonjs builds. Build only ESM. (c1ebc412ec8ff9d1f32a1286259cd6eeb8b24bb2)

### Fixed

- **solid-react:** Run initial auth checks at the first mount. (#155)

  This addresses the mismatch between `session.isActive` and `ranInitialAuthCheck`.

- **connected-solid:** Fix `acl:accessTo` vs. `acl:default` WAC rule resolution in `resource.getWac()`. (#159)
- **solid-react:** Improve support for Next.js / SSR. (#156)
- **connected-solid:** Fix false success when Solid resource creation and update fails with 404. (#168)
- **connected-solid:** Fix unintentional resubscription to websocket notifications.

## [1.0.0-alpha.51] - 2026-05-11

### Added

Everything until this point.

[unreleased]: https://github.com/o-development/ldo/compare/v1.0.0-alpha.53...HEAD
[1.0.0-alpha.53]: https://github.com/o-development/ldo/releases/tag/v1.0.0-alpha.53
[1.0.0-alpha.51]: https://github.com/o-development/ldo/releases/tag/v1.0.0-alpha.51
