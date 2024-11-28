export default defineAppConfig({
  docus: {
    title: 'Nimbus',
    description: 'A nimble Bluesky web client.',
    image: 'https://docs.nimbus.town/nimbus-screenshot.png',
    socials: {
      // twitter: 'elk_zone',
      github: 'nimbus-town/nimbus',
      bluesky: {
        label: 'Bluesky',
        icon: 'IconBluesky',
        href: 'https://bsky.app/profile/nimbus.town',
      },
    },
    aside: {
      level: 0,
      exclude: [],
    },
    header: {
      logo: true,
      showLinkIcon: true,
      exclude: [],
    },
    footer: {
      iconLinks: [
        {
          href: 'https://nuxt.com',
          icon: 'IconNuxtLabs',
        },
        {
          href: 'https://bsky.app/profile/nimbus.town',
          icon: 'IconBluesky',
        },
      ],
    },
  },
})
