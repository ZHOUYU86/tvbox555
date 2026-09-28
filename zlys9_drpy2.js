var rule = {
    title:'真狼影视',
    host:'https://zlys9.top',
    homeUrl:'https://zlys9.top',
    url:'/category/fyclass',
    detailUrl:'/detail/fyid',
    searchUrl:'/search?q=**',
    searchable:2,
    headers:{
        'User-Agent':'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language':'zh-CN,zh;q=0.9',
        'Referer':'https://zlys9.top/'
    },
    timeout:10000,
    class_url:'movie&tv&variety&anime',
    class_name:'电影&电视剧&综艺&动漫',
    推荐:'.movie-list;.video-card;.video-card__title&&Text;.video-card__img&&src;.video-card__meta&&Text;a&&href',
    一级:'.movie-list;.video-card;.video-card__title&&Text;.video-card__img&&src;.video-card__meta&&Text;a&&href',
    二级:'*',
    搜索:'.movie-list;.video-card;.video-card__title&&Text;.video-card__img&&src;.video-card__meta&&Text;a&&href',
    play_parse:true,
    lazy:'js:let html=fetch(input,fetch_params);let m=html.match(/https?:\\/\\/[^\\s"\']+\\.m3u8[^\\s"\']*/);input=m?m[0]:"";',
}
