// this is just some hardcoded WIP dummy data

import type { AppBskyActorDefs, AppBskyFeedPost } from '@atcute/client/lexicons'

export const bskyRecordWithRichText = {
  $type: 'app.bsky.feed.post',
  createdAt: '2024-11-24T07:53:52.540Z',
  embed: {
    $type: 'app.bsky.embed.external',
    external: {
      description: '',
      title: '',
      uri: 'https://github.com/es-tooling/module-replacements/blob/main/docs/modules/grapheme.md',
    },
  },
  facets: [
    {
      features: [
        {
          $type: 'app.bsky.richtext.facet#tag',
          tag: 'Unicode',
        },
      ],
      index: {
        byteEnd: 96,
        byteStart: 88,
      },
    },
    {
      $type: 'app.bsky.richtext.facet',
      features: [
        {
          $type: 'app.bsky.richtext.facet#mention',
          did: 'did:plc:vr6isybvv4ixzvo6qf4w2q66',
        },
      ],
      index: {
        byteEnd: 142,
        byteStart: 133,
      },
    },
    {
      features: [
        {
          $type: 'app.bsky.richtext.facet#link',
          uri: 'https://github.com/es-tooling/module-replacements/blob/main/docs/modules/grapheme.md',
        },
      ],
      index: {
        byteEnd: 186,
        byteStart: 160,
      },
    },
  ],
  langs: [
    'en',
  ],
  text: 'unicode-segmenter has recently become even smaller. It only takes 5.3 KB to be aware of #Unicode graphemes, like emojis!\n\nAnd is now @e18e.dev recommendation!\n\ngithub.com/es-tooling/m...',
} as AppBskyFeedPost.Record

export const bksyProfile = {
  did: 'did:plc:n3bayyluz2vnoj7ztrje7tfe',
  handle: 'praz.dev',
  displayName: 'Sacha — prazdevs',
  avatar: 'https://cdn.bsky.app/img/avatar/plain/did:plc:n3bayyluz2vnoj7ztrje7tfe/bafkreiesxm2rugweab2vi5b5ko6bcugvh4qoludpsz4mfxrixqq6mowkte@jpeg',
  associated: {
    lists: 0,
    feedgens: 0,
    starterPacks: 0,
    labeler: false,
  },
  viewer: {
    muted: false,
    blockedBy: false,
    knownFollowers: { count: 11, followers: [{ did: 'did:plc:ia76kvnndjutgedggx2ibrem', handle: 'mary.my.id', displayName: 'mary🐇', avatar: 'https://cdn.bsky.app/img/avatar/plain/did:plc:ia76kvnndjutgedggx2ibrem/bafkreiesgyo7ukzqhs5mmtulvovzrbbru7ztvopwdwfsvllu553qgfmxd4@jpeg', associated: { chat: { allowIncoming: 'all' } }, viewer: { muted: false, blockedBy: false, following: 'at://did:plc:n3bayyluz2vnoj7ztrje7tfe/app.bsky.graph.follow/3l74cjrlbtn2i', followedBy: 'at://did:plc:ia76kvnndjutgedggx2ibrem/app.bsky.graph.follow/3l72yhwxncn2d' }, labels: [{ cts: '2024-11-13T04:46:40.254Z', neg: false, src: 'did:plc:wkoofae5uytcm7bjncmev6n6', uri: 'did:plc:ia76kvnndjutgedggx2ibrem', val: 'she-it', ver: 1 }], createdAt: '2023-10-14T22:32:58.570Z' }, { did: 'did:plc:2gkh62xvzokhlf6li4ol3b3d', handle: 'patak.dev', displayName: 'patak', avatar: 'https://cdn.bsky.app/img/avatar/plain/did:plc:2gkh62xvzokhlf6li4ol3b3d/bafkreifgzl4e5jqlakd77ajvnilsb5tufsv24h2sxfwmitkzxrh3sk6mhq@jpeg', viewer: { muted: false, blockedBy: false, following: 'at://did:plc:n3bayyluz2vnoj7ztrje7tfe/app.bsky.graph.follow/3l6wvmqy4as2f', followedBy: 'at://did:plc:2gkh62xvzokhlf6li4ol3b3d/app.bsky.graph.follow/3l6wzfp2q5a2y' }, labels: [], createdAt: '2023-04-28T20:13:36.804Z' }, { did: 'did:plc:5x4dxgyqvx3ohkqdcnainkmg', handle: 'jeanphi-baconnais.gitlab.io', displayName: 'Jean-Phi Baconnais 🦎', avatar: 'https://cdn.bsky.app/img/avatar/plain/did:plc:5x4dxgyqvx3ohkqdcnainkmg/bafkreifelkzbwxg63csyosheo2apxhh7zixwadkmwbl26p2wf2wis5pmqq@jpeg', associated: { chat: { allowIncoming: 'all' } }, viewer: { muted: false, blockedBy: false, following: 'at://did:plc:n3bayyluz2vnoj7ztrje7tfe/app.bsky.graph.follow/3l6zec4g7uh2a', followedBy: 'at://did:plc:5x4dxgyqvx3ohkqdcnainkmg/app.bsky.graph.follow/3l6zlgux5fk2i' }, labels: [], createdAt: '2023-07-03T05:19:22.061Z' }, { did: 'did:plc:2pdiyh6lip2aomv7kia3f2jo', handle: 'antfu.me', displayName: 'Anthony Fu', avatar: 'https://cdn.bsky.app/img/avatar/plain/did:plc:2pdiyh6lip2aomv7kia3f2jo/bafkreiaglmlv3di5wv7lvbhizgdhlmzf5eog42k5tawigi6vu6vowr3oiy@jpeg', viewer: { muted: false, blockedBy: false, following: 'at://did:plc:n3bayyluz2vnoj7ztrje7tfe/app.bsky.graph.follow/3l6uv5ajjci2w', followedBy: 'at://did:plc:2pdiyh6lip2aomv7kia3f2jo/app.bsky.graph.follow/3l7rspxj7e52g' }, labels: [{ cts: '2024-11-11T11:40:26.861Z', neg: false, src: 'did:plc:wkoofae5uytcm7bjncmev6n6', uri: 'did:plc:2pdiyh6lip2aomv7kia3f2jo', val: 'he', ver: 1 }], createdAt: '2023-05-13T12:02:02.777Z' }, { did: 'did:plc:5g4pymss6ca4uv33t2fiwjlz', handle: 'shellelittle.bsky.social', displayName: 'Shell Little', avatar: 'https://cdn.bsky.app/img/avatar/plain/did:plc:5g4pymss6ca4uv33t2fiwjlz/bafkreianwtyi5jkp6kj6hcfq6psm3nq5ew5nbkbg5acm2m3wrzfwldzp5a@jpeg', viewer: { muted: false, blockedBy: false, following: 'at://did:plc:n3bayyluz2vnoj7ztrje7tfe/app.bsky.graph.follow/3l6uumjlv7l2q', followedBy: 'at://did:plc:5g4pymss6ca4uv33t2fiwjlz/app.bsky.graph.follow/3lawpvhsypk2a' }, labels: [{ cts: '2024-10-25T18:29:15.528Z', neg: false, src: 'did:plc:wkoofae5uytcm7bjncmev6n6', uri: 'did:plc:5g4pymss6ca4uv33t2fiwjlz', val: 'she-they', ver: 1 }], createdAt: '2023-04-28T18:42:18.520Z' }] },
  },
  labels: [{ cts: '2024-11-12T13:18:46.642Z', neg: false, src: 'did:plc:wkoofae5uytcm7bjncmev6n6', uri: 'did:plc:n3bayyluz2vnoj7ztrje7tfe', val: 'they', ver: 1 }],
  createdAt: '2024-10-19T15:57:24.512Z',
  description: 'They/them 🏳️‍🌈\n\n28 y-o French pragmatic developer & a11y advocate with AuDHD.\nJavascript & Vue & frontend things.\n\nI (should) write things at praz.dev.',
  indexedAt: '2024-11-12T13:17:51.404Z',
  banner: 'https://cdn.bsky.app/img/banner/plain/did:plc:n3bayyluz2vnoj7ztrje7tfe/bafkreiafvka3yaest7r6zestmucaoiwbxhmhkypbgisgl4j4uc34d7qe5a@jpeg',
  followersCount: 128,
  followsCount: 92,
  postsCount: 31,
} as AppBskyActorDefs.ProfileViewDetailed
