import type { RichtextSegment } from '@atcute/bluesky-richtext-segmenter'
import type { AppBskyRichtextFacet } from '@atcute/client/lexicons'
import { segmentize } from '@atcute/bluesky-richtext-segmenter'

import RichTextLink from './RichTextLink.vue'
import RichTextMention from './RichTextMention.vue'
import RichTextTag from './RichTextTag.vue'

interface Props {
  text: string
  facets?: AppBskyRichtextFacet.Main[]
}

function renderSegment({ text, features }: RichtextSegment) {
  const feature = features?.at(0)

  switch (feature?.$type) {
    case 'app.bsky.richtext.facet#link':
      return h(RichTextLink, { text, uri: feature.uri })
    case 'app.bsky.richtext.facet#mention':
      return h(RichTextMention, { text, did: feature.did })
    case 'app.bsky.richtext.facet#tag':
      return h(RichTextTag, { text, tag: feature.tag })
    default:
      return text
  }
}

export default function RichText(props: Props) {
  const segments = segmentize(props.text, props.facets)

  return h('div', { class: 'content-rich' }, segments.map(renderSegment))
}
