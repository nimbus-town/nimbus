declare module 'virtual:elk-locales' {
    const locales: Record<string, {
        title: string
        translated: string[]
        missing: string[]
        outdated: string[]
        total: number
    }>
    export default locales
}