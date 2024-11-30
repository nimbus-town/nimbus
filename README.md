# **Nimbus** — Bluesky Client Built for the Web
<a href="https://nimbus.town" target="_blank" rel="noopener noreferrer">
  <img align="right" width="95" src="./public/nimbus_logo.svg" alt="A nimbus cloud similar to the one Goku rides, in front a moon, representing the Nimbus logo.">
</a>

**Nimbus** is a Bluesky web client, built as a reasonably lightweight web alternative to the bloated Bluesky React Native experience. Nimbus is a fork of [Elk](https://github.com/elk-zone/elk) built by Vite.

> [!WARNING]  
> **Here be dragons!** Nimbus is in a pre-alpha state. It is not production-ready. Any and all developers are encouraged to [contribute to the project](https://github.com/nimbus-town/nimbus/labels/good-first-issue)! **Note that all major discussion occurs within the [Discord server](https://discord.gg/4Kx9WVw8dP).**

<!-- <p align="center">
  <a href="https://nimbus.town/" target="_blank" rel="noopener noreferrer" >
    <img src="./public/elk-og.png" alt="Nimbus screenshots" width="600" height="auto">
  </a>
</p> -->

## 🧑‍💻 Contributing to Nimbus

### Local Setup
Before you can contribute to Nimbus, here is a short step-by-step guide on how to setup Nimbus on a local machine.

First, clone the repository. Then, run the following commands in the root folder:
```ts
pnpm i --frozen-lockfile
pnpm run dev
```

> [!IMPORTANT]  
> You'll need to enable `corepack` before installing. For a more detailed guide, see the [Contributing Guide](./CONTRIBUTING.md).

### Testing
As Nimbus uses [Vitest](https://vitest.dev), you can simply run the test suite by running:

```ts
pnpm test
```

## 📲 Progressive Web App (PWA)
Currently, our focus is on the client becoming functional for browsers, without using PWAs. When the time comes, you can consult the [PWA documentation](https://docs.nimbus.town/pwa) to learn more about the PWA capabilities of Nimbus, how to install Nimbus PWA onto a desktop or mobile device, and hints regarding the progressive web app.

## 🦄 Stack
- [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling
- [Nuxt](https://nuxt.com/) - The Intuitive Web Framework
- [Vue](https://vuejs.org/) - The Progressive JavaScript Framework
- [VueUse](https://vueuse.org/) - Collection of Vue Composition Utilities
- [Pinia](https://pinia.vuejs.org/) - The Vue Store that you will enjoy using
- [Vue Macros](https://vue-macros.sxzz.moe/) - More macros and syntax sugar for Vue
- [UnoCSS](https://uno.antfu.me/) - The instant on-demand atomic CSS engine
- [Iconify](https://github.com/iconify/icon-sets#iconify-icon-sets-in-json-format) - Iconify icon sets in JSON format
- [shiki](https://shiki.style/) - A beautiful yet powerful syntax highlighter
- [vite-plugin-pwa](https://github.com/vite-pwa/vite-plugin-pwa) - Prompt for update and Web Share Target API

- Nimbus is being built with [Tsky](https://github.com/tsky-dev/tsky/), a Bluesky API client written in TypeScript.

## Elk

Nimbus is a fork of [Elk](https://github.com/elk-zone/elk). We're leaving their sponsors and contributors section in the readme as a token of gratitude.

## 💖 Sponsors

We are grateful for the generous sponsorship and help of:

<a href="https://nuxtlabs.com/" target="_blank" rel="noopener noreferrer" >
  <img src="./images/nuxtlabs.svg" alt="NuxtLabs" height="85">
</a>
<br><br>
<a href="https://stackblitz.com/" target="_blank" rel="noopener noreferrer" >
  <img src="./images/stackblitz.svg" alt="StackBlitz" height="85">
</a>
<br><br>

And all the companies and individuals sponsoring the Elk Team and the members. If you're enjoying the app, consider sponsoring them:

- [Elk Team's GitHub Sponsors](https://github.com/sponsors/elk-zone)

We would also appreciate you sponsoring other contributors to Bluesky and the Elk project. If someone helps you solve an issue or implement a feature you wanted, supporting them would help make this project and OS more sustainable.

## 👨‍💻 Contributors

<a href="https://github.com/nimbus-town/nimbus/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=nimbus-town/nimbus" />
</a>

## 📄 License

[MIT](./LICENSE) &copy; 2022-PRESENT Elk contributors, 2024-PRESENT Nimbus contributors
