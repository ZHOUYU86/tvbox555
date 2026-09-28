var baseUrl = 'http://shzaizhi.com';

function init(ext) {
    if (ext && ext.base_url) baseUrl = ext.base_url;
}

function getHtml(url, headers) {
    try {
        let h = headers || {};
        h['User-Agent'] = h['User-Agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
        return request(url, h);
    } catch (e) { return ''; }
}

function matchOne(html, regex) {
    let m = html.match(regex);
    return m ? m[1] : '';
}

function matchAll(html, regex) {
    let r = [];
    let m;
    while ((m = regex.exec(html)) !== null) r.push(m);
    return r;
}

function stripTags(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function home() {
    return JSON.stringify({
        "class": [
            {"type_id": "/sh/1.html", "type_name": "电影"},
            {"type_id": "/sh/2.html", "type_name": "电视剧"},
            {"type_id": "/sh/3.html", "type_name": "综艺"},
            {"type_id": "/sh/4.html", "type_name": "动漫"}
        ],
        "list": []
    });
}

function homeVod() {
    return parseList(getHtml(baseUrl));
}

function category(tid, pg, filter, extend) {
    let url = baseUrl + tid;
    if (pg > 1) url = url.replace(/\.html$/, '-' + pg + '.html');
    return parseList(getHtml(url));
}

function parseList(html) {
    let list = [];
    // 匹配li.clearfix条目（搜索结果和分类页）
    let items = matchAll(html, /<li[^>]*class="[^"]*clearfix[^"]*"[^>]*>[\s\S]*?<\/li>/g);
    if (items.length > 0) {
        for (let i = 0; i < items.length; i++) {
            let item = items[i][0];
            let vod_id = matchOne(item, /href="(\/zai\/\d+\.html)"/);
            let vod_pic = matchOne(item, /data-original="([^"]*)"/);
            let vod_name = matchOne(item, /<h4[^>]*><a[^>]*>([^<]*)<\/a><\/h4>/);
            let vod_remarks = matchOne(item, /pic-text[^>]*>([^<]*)<\/span>/);
            if (vod_id && vod_name) {
                list.push({"vod_id": vod_id, "vod_name": vod_name.trim(), "vod_pic": vod_pic, "vod_remarks": vod_remarks.trim()});
            }
        }
        if (list.length > 0) return JSON.stringify({"list": list});
    }
    // 匹配首页网格卡片（myui-vodlist__thumb）
    let cards = matchAll(html, /<a[^>]*class="[^"]*myui-vodlist__thumb[^"]*"[^>]*href="(\/zai\/\d+\.html)"[^>]*>([\s\S]*?)<\/a>/g);
    for (let i = 0; i < cards.length; i++) {
        let card = cards[i][0];
        let vod_id = cards[i][1];
        let vod_pic = matchOne(card, /data-original="([^"]*)"/) || matchOne(card, /src="([^"]*)"/);
        let vod_name = matchOne(card, /title="([^"]*)"/);
        let vod_remarks = matchOne(card, /pic-text[^>]*>([^<]*)<\/span>/);
        if (vod_id && vod_name) {
            list.push({"vod_id": vod_id, "vod_name": vod_name.trim(), "vod_pic": vod_pic, "vod_remarks": vod_remarks.trim()});
        }
    }
    return JSON.stringify({"list": list});
}

function detail(ids) {
    let html = getHtml(baseUrl + ids);
    let name = stripTags(matchOne(html, /<h1[^>]*>([\s\S]*?)<\/h1>/) || matchOne(html, /<title>([^<]*)<\/title>/));
    let pic = matchOne(html, /data-original="([^"]*)"/) || matchOne(html, /<img[^>]*src="([^"]*)"/);
    let desc = stripTags(matchOne(html, /<span[^>]*class="[^"]*data[^"]*"[^>]*>([\s\S]*?)<\/span>/) || matchOne(html, /简介：([\s\S]*?)</));
    let eps = [];
    let plays = matchAll(html, /<a[^>]*href="(\/zhi\/\d+-\d+-\d+\.html)"[^>]*>([^<]*)<\/a>/g);
    for (let i = 0; i < plays.length; i++) {
        let epName = plays[i][2].trim();
        if (epName && epName !== '立即播放') {
            eps.push(epName + '$' + plays[i][1]);
        }
    }
    // 如果没找到集数链接，用立即播放链接
    if (eps.length === 0) {
        let playLinks = matchAll(html, /href="(\/zhi\/\d+-\d+-\d+\.html)"/g);
        for (let i = 0; i < playLinks.length; i++) {
            eps.push('第' + (i+1) + '集$' + playLinks[i][1]);
        }
    }
    return JSON.stringify({
        "list": [{
            "vod_id": ids,
            "vod_name": name,
            "vod_pic": pic,
            "vod_content": desc,
            "vod_play_url": '光速$' + eps.join('#')
        }]
    });
}

function play(flag, id, vipFlags) {
    let html = getHtml(baseUrl + id);
    // 先找m3u8地址
    let m3u8 = matchOne(html, /(https?:\/\/[^\s"']+\.m3u8[^\s"']*)/);
    if (m3u8) return JSON.stringify({"parse": 0, "url": m3u8});
    // 找mp4地址
    let mp4 = matchOne(html, /(https?:\/\/[^\s"']+\.mp4[^\s"']*)/);
    if (mp4) return JSON.stringify({"parse": 0, "url": mp4});
    // 找var now
    let now = matchOne(html, /var\s+now\s*=\s*['"]([^'"]+)['"]/);
    if (now) return JSON.stringify({"parse": 0, "url": now});
    return JSON.stringify({"parse": 0, "url": baseUrl + id});
}

function search(wd, quick) {
    return parseList(getHtml(baseUrl + '/search.php?searchword=' + encodeURIComponent(wd)));
}
