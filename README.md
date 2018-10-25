# MEME Boilerplate

Boilerplate for Electron-hosted LAN-based Web Learning System!

At this time, Electron userland "easy to get started" tools are not production-ready. We're building our own starting point rather than use _electron-forge_ and similar tools. This will allow us to develop understanding of best practices of the underlying tools (e.g. webpack) for using the Electron library.

## Directory Configuration

- [X] .babelrc auto include react presets
- [X] .editorconfig to enforce spacing/tab rules
- [X] .gitignore
- [X] .eslintrc.json to enforce AirBNB linting rules
- [X] .nvmrc to enforce required Node version
- [X] .prettierrc to configure wrapping options

## Development Tasks

#### BUILD STAGE

- [ ] build ElectronApp bundle
- [ ] build WebApp bundle, served from ElectronApp

#### DEVELOPMENT STAGE

- [ ] [build]
- [ ] run ElectronApp w/ livereload of main.js (mainprocess under nodemon)
- [ ] mainprocess: load renderer processes w/ livereload of electron bundle
- [ ] mainprocess: launch WebApp Server (Express)
- [ ] mainprocess: launch WebApp Sockets (UNISYS) 
- [ ] WebApp Server: watch for livereload of webapp bundle

#### PACKAGE STAGE [WIP]

- [ ] [build]
- [ ] create electron package installer