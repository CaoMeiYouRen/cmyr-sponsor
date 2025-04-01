import { defineConfig, tierPresets } from 'sponsorkit'

interface Rates {
    rates: {
        USD: number
        CNY: number
        [key: string]: number
    }
}

/**
 * @description 获取当前的人民币对美元的汇率。Rates By Exchange Rate API：https://www.exchangerate-api.com
 * @link https://www.exchangerate-api.com
 * @author CaoMeiYouRen
 * @date 2025-04-01
 */
async function getCNYtoUSDRate(): Promise<number> {
    try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD')
        const response: Rates = await res.json()
        return response.rates.CNY || 7.0
    } catch (error) {
        console.error('获取汇率失败，使用默认汇率 7.0', error)
        return 7.0
    }
}

// 动态获取汇率
const exchangeRate = await getCNYtoUSDRate()

console.log('当前汇率：1 USD =', exchangeRate, 'CNY')

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
            monthlyDollars: 5 / exchangeRate,
            preset: tierPresets.medium,
        },
        {
            title: '白银赞助商',
            monthlyDollars: 30 / exchangeRate,
            preset: tierPresets.large,
        },
        {
            title: '黄金赞助商',
            monthlyDollars: 365 / exchangeRate,
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
        exechangeRate: exchangeRate,
    },
})

