# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **connected-solid:** Read links from Link header of a Solid resource. (#165)
- **vue:** Add [Vue](https://vuejs.org) support with `@ldo/vue` package. ([#171](https://github.com/o-development/ldo/pull/171))

### Changed

- Use global `fetch` instead of `cross-fetch`. (#134)
- **connected-solid:** Use `PUT` instead of `POST` to create Solid resources. (#164)
- **connected-solid:** Use HTTP Semantics to ensure existing resource is not overwritten. (#164)

### Fixed

- **solid-react:** Run initial auth checks at the first mount. (#155)

  This addresses the mismatch between `session.isActive` and `ranInitialAuthCheck`.

- **connected-solid:** Fix `acl:accessTo` vs. `acl:default` WAC rule resolution in `resource.getWac()`. (#159)
- **solid-react:** Improve support for Next.js / SSR. (#156)
- **connected-solid:** Fix false success when Solid resource creation and update fails with 404. (#168)

## [1.0.0-alpha.51] - 2026-05-11

### Added

Everything until this point.

[unreleased]: https://github.com/o-development/ldo/compare/v1.0.0-alpha.51...HEAD
[1.0.0-alpha.51]: https://github.com/o-development/ldo/releases/tag/v1.0.0-alpha.51
