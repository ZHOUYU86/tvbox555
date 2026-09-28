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
            {"type_id": "/sh/4.html", "type_name": "动漫"},
            {"type_id": "/sh/5.html", "type_name": "动作片"},
            {"type_id": "/sh/6.html", "type_name": "爱情片"},
            {"type_id": "/sh/7.html", "type_name": "科幻片"},
            {"type_id": "/sh/10.html", "type_name": "喜剧片"},
            {"type_id": "/sh/12.html", "type_name": "剧情片"},
            {"type_id": "/sh/13.html", "type_name": "国产剧"}
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
    let items = matchAll(html, /<a[^>]*href="(\/zai\/\d+\.html)"[^>]*>[\s\S]*?<img[^>]*src="([^"]*)"[^>]*>[\s\S]*?<h[34][^>]*>([^<]*)<\/h[34]>/g);
    if (items.length === 0) {
        items = matchAll(html, /<a[^>]*href="(\/zai\/\d+\.html)"[^>]*>([\s\S]*?)<\/a>/g);
        for (let i = 0; i < items.length; i++) {
            let n = stripTags(items[i][2]);
            let p = matchOne(items[i][2], /<img[^>]*src="([^"]*)"/);
            if (n && n.length < 50) list.push({"vod_id": items[i][1], "vod_name": n, "vod_pic": p, "vod_remarks": ""});
        }
        return JSON.stringify({"list": list});
    }
    for (let i = 0; i < items.length; i++) {
        list.push({"vod_id": items[i][1], "vod_name": items[i][3].trim(), "vod_pic": items[i][2], "vod_remarks": ""});
    }
    return JSON.stringify({"list": list});
}

function detail(ids) {
    let html = getHtml(baseUrl + ids);
    let name = stripTags(matchOne(html, /<h1[^>]*>([\s\S]*?)<\/h1>/) || matchOne(html, /<title>([^<]*)<\/title>/));
    let pic = matchOne(html, /<img[^>]*src="([^"]*)"[^>]*alt="[^"]*"/);
    let desc = stripTags(matchOne(html, /<span[^>]*class="[^"]*data[^"]*"[^>]*>([\s\S]*?)<\/span>/));
    let eps = [];
    let plays = matchAll(html, /<a[^>]*href="(\/zhi\/\d+-\d+-\d+\.html)"[^>]*>([^<]*)<\/a>/g);
    for (let i = 0; i < plays.length; i++) {
        eps.push(plays[i][2].trim() + '$' + plays[i][1]);
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
    let now = matchOne(html, /var\s+now\s*=\s*['"]([^'"]+)['"]/);
    if (now) return JSON.stringify({"parse": 0, "url": now});
    let m3u8 = matchOne(html, /(https?:\/\/[^\s"']*\.m3u8[^\s"']*)/);
    if (m3u8) return JSON.stringify({"parse": 0, "url": m3u8});
    return JSON.stringify({"parse": 0, "url": baseUrl + id});
}

function search(wd, quick) {
    return parseList(getHtml(baseUrl + '/search.php?searchword=' + encodeURIComponent(wd)));
}
