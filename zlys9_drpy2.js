var rule = {
    title:'真狼影视',
    host:'https://zlys9.top',
    homeUrl:'https://zlys9.top',
    url:'/category/fyclass?page=fypage',
    detailUrl:'/detail/fyid',
    searchUrl:'/search?q=**',
    searchable:2,
    headers:{
        'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    timeout:5000,
    class_url:'movie&tv&variety&anime',
    class_name:'电影&电视剧&综艺&动漫',
    推荐:'.movie-list;.video-card;.video-card__title a&&Text;.video-card__img&&src;.video-card__meta&&Text;.video-card__link&&href',
    一级:'.movie-list;.video-card;.video-card__title a&&Text;.video-card__img&&src;.video-card__meta&&Text;.video-card__link&&href',
    二级:'*',
    搜索:'.movie-list;.video-card;.video-card__title a&&Text;.video-card__img&&src;.video-card__meta&&Text;.video-card__link&&href',
    play_parse:true,
    lazy:'js:let html=fetch(input,fetch_params);let m=html.match(/https?:\\/\\/[^\\s"\']+\\.m3u8[^\\s"\']*/);input=m?m[0]:"";',
}
