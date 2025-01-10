import { defineConfig, tierPresets } from 'sponsorkit'

// 汇率
const exechangeRate = 7.0
export default defineConfig({
    // includePrivate: true,
    tiers: [
        {
            title: '往届赞助商',
            monthlyDollars: -1,
            preset: tierPresets.xs,
        },
        {
            title: '支持者',
        },
        {
            title: '赞助商',
            monthlyDollars: 5 / exechangeRate,
            preset: tierPresets.medium,
        },
        {
            title: '白银赞助商',
            monthlyDollars: 30 / exechangeRate,
            preset: tierPresets.large,
        },
        {
            title: '金牌赞助商',
            monthlyDollars: 365 / exechangeRate,
            preset: tierPresets.xl,
        },
    ],

    // Automatically Merge sponsors from different platforms
    sponsorsAutoMerge: true,

    // Run multiple renders with different configurations
    renders: [
        {
            name: 'sponsors',
            width: 1000,
            formats: ['svg', 'png', 'webp'],
        },
    ],
    afdian: {
        exechangeRate,
    },
})
