/**
 * BOT_TOKEN
 * MASTER_ID
 * MINIBLOG
 * MINIBLOG_USERS
 * MINIBLOG_COMMANDS
 */

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    const { message } = await request.json()

    await handleMessage(message)
    await handleUser(message)

    return new Response('ok', { status: 200 })
}

async function handleUser(message) {
    const user = await MINIBLOG_USERS.get(message.from.id)
    if (user === null) {
        await MINIBLOG_USERS.put(message.from.id, JSON.stringify(message.from))
    }
    await MINIBLOG_COMMANDS.put(`${message.from.id}-${Date.now()}`, JSON.stringify(message))
}

async function handleMessage(message) {
    switch (message.text) {
        case '/start':
            await tgNotify('sendMessage', {
                chat_id: message.chat.id,
                text: '👏 欢迎，这是一个可以在电报上看微博热搜的机器人!\n🔥 点击下方按钮开始吧！',
                parse_mode: "Markdown",
                reply_markup: {
                    keyboard: [["😀帮助", "🔥微博热搜"], ["🌼设置", "🔔反馈"]],
                    resize_keyboard: true,
                    one_time_keyboard: false,
                    input_field_placeholder: "choose a button below..."
                }
            })
            break
        case '😀帮助':
            await tgNotify('sendMessage', {
                chat_id: message.chat.id,
                text: '👏 欢迎，这是一个可以在电报上看微博热搜的机器人!\n🔥 点击下方按钮开始吧！',
                parse_mode: "Markdown"
            })
            break
        case '🔥微博热搜':
            const template = await getMiniblog()
            await tgNotify('sendMessage', {
                chat_id: message.chat.id,
                text: template,
                parse_mode: "Markdown",
            })
            break
        case '🌼设置':
            await tgNotify('sendMessage', {
                chat_id: message.chat.id,
                text: '暂无设置！',
                parse_mode: "Markdown",
            })
            break
        case '🔔反馈':
            await tgNotify('sendMessage', {
                chat_id: message.chat.id,
                text: '暂无反馈！',
                parse_mode: "Markdown",
            })
            break
        case '/admin':
            if (message.from.id !== MASTER_ID) {
                await tgNotify('sendMessage', {
                    chat_id: message.chat.id,
                    text: '*无权限进行此操作！*',
                    parse_mode: "Markdown",
                })
            } else {
                await tgNotify('sendMessage', {
                    chat_id: message.chat.id,
                    text: '🐲 你好，管理员！',
                    parse_mode: "Markdown",
                })
                break
            }
            break
        default:
            await tgNotify('sendMessage', {
                chat_id: message.chat.id,
                text: '*请输入正确的命令！*',
                parse_mode: "Markdown",
            })
            break
    }
}

async function getMiniblog() {
    const hotSearch = await MINIBLOG.get('hotSearch', { type: "json" })
    const hyperlink = hotSearch.data.map(item => `_${item.index}_   [${item.title}](${item.link})  *${item.tag}*\n`)
    let template = `*🔥 微博热搜*  ${getCurrentTime()}\n\n`
    hyperlink.forEach(item => template += item)
    return template
}

async function tgNotify(type, body) {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${type}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
}

function getCurrentTime() {
    const date = new Date();
    const year = date.getFullYear();
    const month = fillZero(date.getMonth() + 1);
    const day = fillZero(date.getDate());
    const hour = fillZero(date.getHours() + 8);
    const minute = fillZero(Math.floor(date.getMinutes() / 10) * 10);
    // const second = fillZero(date.getSeconds());

    return year + "-" + month + "-" + day + " " + hour + ":" + minute;
}

function fillZero(i) {
    if (i >= 0 && i <= 9) {
        return "0" + i;
    } else {
        return i;
    }
}
