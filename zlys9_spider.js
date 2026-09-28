var baseUrl = 'https://zlys9.top';

function init(ext) {
    if (ext && ext.base_url) baseUrl = ext.base_url;
}

function getHtml(url) {
    try {
        var h = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'};
        return request(url, h);
    } catch (e) { return ''; }
}

function matchOne(html, regex) {
    var m = html.match(regex);
    return m ? m[1] : '';
}

function matchAll(html, regex) {
    var r = [];
    var m;
    while ((m = regex.exec(html)) !== null) r.push(m);
    return r;
}

function stripTags(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function home() {
    return JSON.stringify({
        "class": [
            {"type_id": "/category/movie", "type_name": "电影"},
            {"type_id": "/category/tv", "type_name": "电视剧"},
            {"type_id": "/category/variety", "type_name": "综艺"},
            {"type_id": "/category/anime", "type_name": "动漫"}
        ],
        "list": []
    });
}

function homeVod() {
    return parseList(getHtml(baseUrl));
}

function category(tid, pg, filter, extend) {
    var url = baseUrl + tid;
    if (pg > 1) url += '?page=' + pg;
    return parseList(getHtml(url));
}

function parseList(html) {
    var list = [];
    try {
        var items = matchAll(html, /<li[^>]*class="[^"]*video-card[^"]*"[^>]*>[\s\S]*?<\/li>/g);
        for (var i = 0; i < items.length; i++) {
            var item = items[i][0];
            var vod_id = matchOne(item, /href="(\/detail\/[^"]+)"/);
            var vod_pic = matchOne(item, /<img[^>]*class="[^"]*video-card__img[^"]*"[^>]*src="([^"]*)"/);
            var vod_name = matchOne(item, /video-card__title[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/);
            var vod_remarks = matchOne(item, /video-card__meta[^>]*>([^<]*)<\/div>/);
            if (vod_id && vod_name) {
                vod_name = stripTags(vod_name);
                list.push({
                    "vod_id": vod_id,
                    "vod_name": vod_name,
                    "vod_pic": vod_pic,
                    "vod_remarks": vod_remarks.trim()
                });
            }
        }
    } catch (e) {}
    return JSON.stringify({"list": list});
}

function detail(ids) {
    try {
        var html = getHtml(baseUrl + ids);
        var name = stripTags(matchOne(html, /<h1[^>]*>([\s\S]*?)<\/h1>/) || matchOne(html, /<title>([^<]*)<\/title>/));
        var pic = matchOne(html, /<img[^>]*class="[^"]*video-card__img[^"]*"[^>]*src="([^"]*)"/) || matchOne(html, /<img[^>]*src="([^"]*)"[^>]*alt="[^"]*"/);
        var desc = stripTags(matchOne(html, /剧情简介[\s\S]*?<\/div>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/) || matchOne(html, /<meta[^>]*name="description"[^>]*content="([^"]*)"/));
        
        var eps = [];
        // 匹配集数链接
        var epItems = matchAll(html, /<a[^>]*href="(\/play\/[^"]+)"[^>]*>([^<]*)<\/a>/g);
        for (var i = 0; i < epItems.length; i++) {
            var epName = epItems[i][2].trim();
            if (epName && epName.indexOf('第') >= 0) {
                eps.push(epName + '$' + epItems[i][1]);
            }
        }
        // 如果没找到，匹配所有play链接
        if (eps.length === 0) {
            var playLinks = matchAll(html, /href="(\/play\/[^"]+)"/g);
            for (var j = 0; j < playLinks.length; j++) {
                eps.push('第' + (j+1) + '集$' + playLinks[j][1]);
            }
        }
        
        return JSON.stringify({
            "list": [{
                "vod_id": ids,
                "vod_name": name,
                "vod_pic": pic,
                "vod_content": desc,
                "vod_play_url": '真狼$' + eps.join('#')
            }]
        });
    } catch (e) {
        return JSON.stringify({"list": []});
    }
}

function play(flag, id, vipFlags) {
    try {
        var html = getHtml(baseUrl + id);
        // 找m3u8地址
        var m3u8 = matchOne(html, /(https?:\/\/[^\s"']+\.m3u8[^\s"']*)/);
        if (m3u8) return JSON.stringify({"parse": 0, "url": m3u8});
        // 找ruyijx的地址
        var ruyi = matchOne(html, /(https?:\/\/[^\s"']*ruyijx[^\s"']*)/);
        if (ruyi) return JSON.stringify({"parse": 0, "url": ruyi});
        // 找mp4
        var mp4 = matchOne(html, /(https?:\/\/[^\s"']+\.mp4[^\s"']*)/);
        if (mp4) return JSON.stringify({"parse": 0, "url": mp4});
    } catch (e) {}
    return JSON.stringify({"parse": 0, "url": ""});
}

function search(wd, quick) {
    return parseList(getHtml(baseUrl + '/search?q=' + encodeURIComponent(wd)));
}
