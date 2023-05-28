import { resolve } from 'pathe'
import type { ResizeOptions } from 'sharp'
import sharp from 'sharp'

interface Icon {
  sizes: number[]
  padding: number
  resizeOptions?: ResizeOptions
}

type IconType = 'transparent' | 'maskable' | 'apple'

/**
 * PWA Icons definition:
 * - transparent: [{ sizes: [192, 512], padding: 0, resizeOptions: { fit: 'contain', background: 'transparent' } }]
 * - maskable: [{ sizes: [512], padding: 0.3 }, resizeOptions: { fit: 'contain', background: 'white' } }]
 * - apple: [{ sizes: [180], padding: 0.3 }, resizeOptions: { fit: 'contain', background: 'white' } }]
 */
interface Icons extends Record<IconType, Icon> {
  /**
   * @default `pwa-<size>x<size>.png`, `maskable-icon-<size>x<size>.png`, `apple-touch-icon-<size>x<size>.png`
   */
  iconName?: (type: IconType, size: number) => string
}

interface ResolvedIcons extends Required<Icons> {}

const defaultIcons: Icons = {
  transparent: {
    sizes: [192, 512],
    padding: 0,
    resizeOptions: {
      fit: 'contain',
      background: 'transparent',
    },
  },
  maskable: {
    sizes: [512],
    padding: 0.3,
    resizeOptions: {
      fit: 'contain',
      background: 'white',
    },
  },
  apple: {
    sizes: [180],
    padding: 0.3,
    resizeOptions: {
      fit: 'contain',
      background: 'white',
    },
  },
}

const root = process.cwd()

const publicFolders = ['public', 'public-dev', 'public-staging'].map(folder => resolve(root, folder))

async function generateTransparentIcons(icons: ResolvedIcons, svgLogo: string, folder: string) {
  const { sizes, padding, resizeOptions } = icons.transparent
  await Promise.all(sizes.map(async (size) => {
    const filePath = resolve(folder, icons.iconName('transparent', size))
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    }).composite([{
      input: await sharp(svgLogo)
        .resize(
          Math.round(size * (1 - padding)),
          Math.round(size * (1 - padding)),
          resizeOptions,
        ).toBuffer(),
    }]).toFile(filePath)
  }))
}

async function generateMaskableIcons(type: IconType, icons: ResolvedIcons, svgLogo: string, folder: string) {
  // https://github.com/lovell/sharp/issues/729
  const { sizes, padding, resizeOptions } = icons[type]
  await Promise.all(sizes.map(async (size) => {
    const filePath = resolve(folder, icons.iconName(type, size))
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: resizeOptions?.background ?? 'white',
      },
    }).composite([{
      input: await sharp(svgLogo)
        .resize(
          Math.round(size * (1 - padding)),
          Math.round(size * (1 - padding)),
          resizeOptions,
        ).toBuffer(),
    }]).toFile(filePath)
  }))
}

async function generatePWAIconForEnv(folder: string, icons: ResolvedIcons) {
  const svgLogo = resolve(folder, 'logo.svg')
  console.log(icons)
  await Promise.all([
    generateTransparentIcons(icons, svgLogo, folder),
    generateMaskableIcons('maskable', icons, svgLogo, folder),
    generateMaskableIcons('apple', icons, svgLogo, folder),
  ])
}

async function generatePWAIcons(folders: string[], icons: Icons) {
  const {
    iconName = (type, size) => {
      switch (type) {
        case 'transparent':
          return `pwa-${size}x${size}.png`
        case 'maskable':
          return `maskable-icon-${size}x${size}.png`
        case 'apple':
          return `apple-touch-icon-${size}x${size}.png`
      }
    },
    transparent = { ...defaultIcons.transparent },
    maskable = { ...defaultIcons.maskable },
    apple = { ...defaultIcons.apple },
  } = icons

  if (!transparent.resizeOptions)
    transparent.resizeOptions = { ...defaultIcons.transparent.resizeOptions }

  if (!maskable.resizeOptions)
    maskable.resizeOptions = { ...defaultIcons.maskable.resizeOptions }

  if (!apple.resizeOptions)
    apple.resizeOptions = { ...defaultIcons.apple.resizeOptions }

  await Promise.all(folders.map(folder => generatePWAIconForEnv(folder, {
    iconName,
    transparent,
    maskable,
    apple,
  })))
}

console.log('Generating Elk PWA Icons...')

generatePWAIcons(publicFolders, <Icons>{
  transparent: { ...defaultIcons.transparent, sizes: [64, 192, 512] },
  iconName: (type, size) => {
    switch (type) {
      case 'transparent':
        return size === 64 ? `pwa-windows-44x44-${size}-test.png` : `pwa-${size}x${size}-test.png`
      case 'maskable':
        return 'maskable-icon-test.png'
      case 'apple':
        return 'apple-touch-icon-test.png'
    }
  },
}).then(() => console.log('Elk PWA Icons generated')).catch(console.error)
