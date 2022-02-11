/**
 * MINIBLOG
 */

addEventListener("scheduled", event => {
    event.waitUntil(handleRequest(event.request))
})

addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    const response = await fetch("https://s.weibo.com/top/summary", {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36",
            "Cookie": "SUB=_2AkMWJrkXf8NxqwJRmP8SxWjnaY12zwnEieKgekjMJRMxHRl-yj9jqmtbtRB6PaaX-IGp-AjmO6k5cS-OH2X9CayaTzVD",
        }
    });

    if (!response.ok) {
        const hotSearch = {
            data: [{
                index: '-',
                title: '后台获取最新微博热搜失败！',
                link: "/top/summary",
                tag: Date.now()
            }]
        }
        await MINIBLOG.put('hotSearch', JSON.stringify(hotSearch))
        return new Response(response.statusText)
    } else {
        let html = await response.text();
        const regexp = /<a href="(\/weibo\?q=[^"]+)".*?>(.+)<\/a>[\s\S]+?(热|新|爆|商|<\/tr>)/g
        const matchList = [...html.matchAll(regexp)];

        let count = 1
        let hotSearchList = []
        matchList.forEach((item, index) => {
            if (index > 0 && item[1].indexOf('javascript') < 0 && item[3] !== '商') {
                hotSearchList.push({
                    index: count++,
                    title: item[2],
                    link: "https://s.weibo.com" + item[1],
                    tag: item[3] !== '</tr>' ? item[3] : ''
                })
            }
        });
        const hotSearch = {
            data: hotSearchList
        }
        await MINIBLOG.put('hotSearch', JSON.stringify(hotSearch))
    }
    return new Response('ok', {status: 200})
}
