import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  shortcuts: [
    {
      'border-base': 'border-$c-border',
      'border-bg-base': 'border-$c-bg-base',

      // background
      'bg-base': 'bg-$c-bg-base',
      'bg-active': 'bg-$c-bg-active',
      'bg-code': 'bg-$c-bg-code',

      // text colors
      'text-base': 'text-$c-text-base',
      'text-secondary': 'text-$c-text-secondary',
      'text-secondary-light': 'text-$c-text-secondary-light',

      // buttons
      'btn-base': 'cursor-pointer disabled:pointer-events-none disabled:bg-[#2a2a2a] disabled:text-[#919191]',
      'btn-solid': 'btn-base px-4 py-2 rounded text-[#232323] bg-$c-primary hover:bg-$c-primary-active',
      'btn-outline': 'btn-base px-4 py-2 rounded text-$c-primary border border-$c-primary hover:bg-$c-primary hover:text-white',
      'btn-text': 'btn-base px-4 py-2 text-$c-primary hover:text-$c-primary-active',
      'btn-action-icon': 'btn-base hover:bg-active rounded-full h9 w9 flex items-center justify-center',

      // link
      'text-link-rounded': 'focus:outline-none focus:ring-(2 primary inset) hover:bg-active rounded md:rounded-full px2 mx--2',

      // utils
      'flex-center': 'items-center justify-center',
      'flex-v-center': 'items-center',
      'flex-h-center': 'justify-center',
    },
  ],
  presets: [
    presetUno({
      attributifyPseudo: true,
    }),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: 'DM Sans',
        serif: 'DM Serif Display',
        mono: 'DM Mono',
        script: 'Homemade Apple',
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  theme: {
    colors: {
      primary: {
        DEFAULT: 'var(--c-primary)',
        active: 'var(--c-primary-active)',
      },
    },
  },
})
