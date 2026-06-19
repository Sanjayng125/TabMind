import * as cheerio from 'cheerio'

export async function scrapeUrl(url: string): Promise<{
    title: string
    text: string
    favicon: string
}> {
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; TabMind/1.0)',
            },
            signal: AbortSignal.timeout(10000), // 10s timeout
        })

        const html = await res.text()
        const scraper = cheerio.load(html)

        // Remove noise
        scraper('script, style, nav, footer, header, iframe, noscript').remove()

        // Get title
        const title =
            scraper('meta[property="og:title"]').attr('content') ||
            scraper('title').text() ||
            url

        // Get favicon
        const favicon =
            scraper('link[rel="icon"]').attr('href') ||
            scraper('link[rel="shortcut icon"]').attr('href') ||
            `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`

        // Resolve relative favicon URL
        const faviconUrl = favicon.startsWith('http')
            ? favicon
            : `${new URL(url).origin}${favicon}`

        // Get main text — limit to 3000 chars to stay within token limits
        const text = scraper('body')
            .text()
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 3000)

        return {
            title: title.trim().slice(0, 200),
            text,
            favicon: faviconUrl,
        }
    } catch {
        // Fallback if scraping fails
        return {
            title: url,
            text: '',
            favicon: `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`,
        }
    }
}