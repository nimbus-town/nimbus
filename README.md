# Elk
*A nimble Mastodon web client*

<p align="center">
  <a href="https://viteconf.org" target="_blank" rel="noopener noreferrer">
    <img width="180" src="https://elk.zone/logo.svg" alt="Vite logo">
  </a>
</p>
<br/>
<p align="center">
  <a href="https://chat.elk.zone"><img src="https://img.shields.io/badge/chat-discord-blue?style=flat&logo=discord" alt="discord chat"></a>
  <a href="https://pr.new/elk-zone/elk"><img src="https://developer.stackblitz.com/img/start_pr_dark_small.svg" alt="Start new PR in StackBlitz Codeflow"></a>
</p>
<br/>

Elk is in early alpha, but it is already quite usable. We would love your feedback and contributions.

Check out the [Open Issues](https://github.com/elk-zone/elk/issues) and jump in the action. Join the [Elk discord server](https://chat.elk.zone) to learn more and get involved!

The client is deployed to [elk.zone](https://elk.zone), you can share screenshots on social media but avoid sharing this URL or the discord server until we open the repo.

> **Note** 
> If you would like to contribute, until the repo is open, please create branches in the main repository and send a PR from there.

# Contributing

Hi! We're really excited that you're interested in contributing to Elk! Before submitting your contribution, please read through the following guide.

## Online

You can use [StackBlitz CodeFlow](https://stackblitz.com/codeflow) to fix bugs or implement features. You'll also see a CodeFlow button on PRs to review them without a local setup.

[![Open in Codeflow](https://developer.stackblitz.com/img/open_in_codeflow.svg)](https://pr.new/elk-zone/elk)

## Local Setup

Clone the repository and run on the root folder:

```
pnpm i
pnpm run dev
```

We recommend installing [ni](https://github.com/antfu/ni#ni), that will use the right package manager in each of your projects. If `ni` is installed, you can instead run:

```
ni
nr dev
```

## Testing

Elk uses [Vitest](https://vitest.dev). You can run the test suite with:

```
nr test
```

# Stack

- [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling
- [Nuxt](https://nuxt.com/) - The Intuitive Web Framework
- [Vue](https://vuejs.org/) - The Progressive JavaScript Framework
- [VueUse](https://vueuse.org/) - Collection of Vue Composition Utilities
- [Pinia](https://pinia.vuejs.org/) - The Vue Store that you will enjoy using
- [Vue Macros](https://vue-macros.sxzz.moe/) - More macros and syntax sugar for Vue
- [UnoCSS](https://uno.antfu.me/) - The instant on-demand atomic CSS engine
- [Iconify](https://github.com/iconify/icon-sets#iconify-icon-sets-in-json-format) - Iconify icon sets in JSON format
- [Masto.js](https://neet.github.io/masto.js) - Mastodon API client in TypeScript
- [shiki](https://shiki.matsu.io/) - A beautiful Syntax Highlighter

# License

MIT
