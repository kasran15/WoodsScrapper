var behindwoodsNewsURL = '/tamil-movies-cinema-news-14/',
http = require('http'),
jsdom = require('jsdom'),
article,
articleImg,
output = '';

exports.getNews = function(id, callback) {
    var newsURL = behindwoodsNewsURL + id + '.html',

    options = {
        hostname: 'www.behindwoods.com',
        path: newsURL,
        headers: {
            'Content-type': 'text/html; charset=utf-8'
        }
    },

    newsReq = http.request(options, function(newsRes) {
        
        newsRes.on('data', function (chunk) {
            output += chunk;
        });

        newsRes.on('end', function() {
            jsdom.env(
                output,
                ["http://code.jquery.com/jquery.js"],
                function(errors, window) {
                    var $box, $img;
                    $box = window.$('.float .top_margin_8 > .top_margin_8'); $box = $box.remove('.addthis_toolbox');
                    $box = $box.remove('h1');
                    $img = window.$('.float .top_margin_8 img');
                    article = $box.text(); 
                    articleImg = $img.attr('src');
                    callback(article, articleImg);
            });
        });
    });

    newsReq.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    newsReq.end();
};