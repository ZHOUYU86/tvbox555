var baseUrl = 'http://shzaizhi.com';

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
    var url = baseUrl + tid;
    if (pg > 1) url = url.replace(/\.html$/, '-' + pg + '.html');
    return parseList(getHtml(url));
}

function parseList(html) {
    var list = [];
    try {
        // 匹配li.clearfix条目
        var items = matchAll(html, /<li[^>]*class="[^"]*clearfix[^"]*"[^>]*>[\s\S]*?<\/li>/g);
        var i;
        for (i = 0; i < items.length; i++) {
            var item = items[i][0];
            var vod_id = matchOne(item, /href="(\/zai\/\d+\.html)"/);
            var vod_pic = matchOne(item, /data-original="([^"]*)"/);
            var vod_name = matchOne(item, /<h4[^>]*><a[^>]*>([^<]*)<\/a><\/h4>/);
            var vod_remarks = matchOne(item, /pic-text[^>]*>([^<]*)<\/span>/);
            if (vod_id && vod_name) {
                list.push({"vod_id": vod_id, "vod_name": vod_name.trim(), "vod_pic": vod_pic, "vod_remarks": vod_remarks.trim()});
            }
        }
        // 如果li没匹配到，匹配a.myui-vodlist__thumb
        if (list.length === 0) {
            var cards = matchAll(html, /<a[^>]*class="[^"]*myui-vodlist__thumb[^"]*"[^>]*href="(\/zai\/\d+\.html)"[^>]*>([\s\S]*?)<\/a>/g);
            for (i = 0; i < cards.length; i++) {
                var card = cards[i][0];
                var cid = cards[i][1];
                var cpic = matchOne(card, /data-original="([^"]*)"/) || matchOne(card, /src="([^"]*)"/);
                var cname = matchOne(card, /title="([^"]*)"/);
                var crem = matchOne(card, /pic-text[^>]*>([^<]*)<\/span>/);
                if (cid && cname) {
                    list.push({"vod_id": cid, "vod_name": cname.trim(), "vod_pic": cpic, "vod_remarks": crem.trim()});
                }
            }
        }
    } catch (e) {}
    return JSON.stringify({"list": list});
}

function detail(ids) {
    try {
        var html = getHtml(baseUrl + ids);
        var name = stripTags(matchOne(html, /<h1[^>]*>([\s\S]*?)<\/h1>/) || matchOne(html, /<title>([^<]*)<\/title>/));
        var pic = matchOne(html, /data-original="([^"]*)"/) || matchOne(html, /<img[^>]*src="([^"]*)"/);
        var desc = stripTags(matchOne(html, /简介：([\s\S]*?)</));
        var eps = [];
        var plays = matchAll(html, /<a[^>]*href="(\/zhi\/\d+-\d+-\d+\.html)"[^>]*>([^<]*)<\/a>/g);
        var i;
        for (i = 0; i < plays.length; i++) {
            var epName = plays[i][2].trim();
            if (epName && epName !== '立即播放') {
                eps.push(epName + '$' + plays[i][1]);
            }
        }
        if (eps.length === 0) {
            var playLinks = matchAll(html, /href="(\/zhi\/\d+-\d+-\d+\.html)"/g);
            for (i = 0; i < playLinks.length; i++) {
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
    } catch (e) {
        return JSON.stringify({"list": []});
    }
}

function play(flag, id, vipFlags) {
    try {
        var html = getHtml(baseUrl + id);
        var m3u8 = matchOne(html, /(https?:\/\/[^\s"']+\.m3u8[^\s"']*)/);
        if (m3u8) return JSON.stringify({"parse": 0, "url": m3u8});
        var mp4 = matchOne(html, /(https?:\/\/[^\s"']+\.mp4[^\s"']*)/);
        if (mp4) return JSON.stringify({"parse": 0, "url": mp4});
        var now = matchOne(html, /var\s+now\s*=\s*['"]([^'"]+)['"]/);
        if (now) return JSON.stringify({"parse": 0, "url": now});
    } catch (e) {}
    return JSON.stringify({"parse": 0, "url": ""});
}

function search(wd, quick) {
    return parseList(getHtml(baseUrl + '/search.php?searchword=' + encodeURIComponent(wd)));
}
