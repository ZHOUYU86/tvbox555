function csp_test() {
    this.init = function(ext) {};
    this.home = function() {
        return JSON.stringify({
            "class": [{"type_id": "1", "type_name": "测试分类"}],
            "list": []
        });
    };
    this.homeVod = function() {
        return JSON.stringify({
            "list": [
                {"vod_id": "test1", "vod_name": "测试电影1", "vod_pic": "", "vod_remarks": "测试"},
                {"vod_id": "test2", "vod_name": "测试电影2", "vod_pic": "", "vod_remarks": "测试"}
            ]
        });
    };
    this.category = function(tid, pg, filter, extend) {
        return this.homeVod();
    };
    this.detail = function(ids) {
        return JSON.stringify({
            "list": [{
                "vod_id": ids,
                "vod_name": "测试详情",
                "vod_pic": "",
                "vod_content": "测试内容",
                "vod_play_url": "测试$播放1$/test1.html#播放2$/test2.html"
            }]
        });
    };
    this.play = function(flag, id, vipFlags) {
        return JSON.stringify({"parse": 0, "url": "https://example.com/test.m3u8"});
    };
    this.search = function(wd, quick) {
        return this.homeVod();
    };
}
