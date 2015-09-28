var behindwoodsNewsURL = '/tamil-movies-cinema-news-15/',
    behindwoodsURL = 'www.behindwoods.com',
    http = require('http'),
    jsdom = require('jsdom'),
    _ = require('lodash'),
    article,
    articleImg,
    headers = {
        'Content-type': 'text/html; charset=utf-8'
    }
    output = '',
    mongoose = require('mongoose'),
    newsSchema = mongoose.Schema({
        id: String,
        image: String,
        article: String
    }, {
        collection: 'newsCache'
    }),
    News = mongoose.model('News', newsSchema),
    mongoose.connect('mongodb://bwoods:bwoods@ds051953.mongolab.com:51953/heroku_gv12hs9j', {}, 
        function() {
            console.log('connections');
            console.log(arguments);
    }); 

exports.getNewsList = function(callback) {
    var newsURL = behindwoodsNewsURL + 'cinema-news.html',

    links,

    newsList,

    output = '',

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
                    if (errors)
                        console.log("Errors: " + errors);
                    var $box, $img;
                    $box = window.$('.float .col_418_box .box_400');
                    newsList = [];
                    links = $box.find('a');

                    _.each(links, function(link) {
                        newsList.push(link.getAttribute('href'));
                    })

                    callback(newsList);
            });
        });
    });

    newsReq.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    newsReq.end();

};

exports.getNews = function(id, callback) {
    var newsURL = id,

    output = '',

    options = {
        hostname: 'www.behindwoods.com',
        path: newsURL,
        headers: {
            'Content-type': 'text/html; charset=utf-8'
        }
    },

    receivedNews,

    cachedNews,

    newsReq;

    cachedNews = News.findOne({id: newsURL}, function(err, res) {
        if (res) {
            console.log('Cache hit. id:' + newsURL);
            callback(res.article, res.image);
            return;
        }

        newsReq = http.request(options, function(newsRes) {
        
            newsRes.on('data', function (chunk) {
                output += chunk;
            });

            newsRes.on('end', function() {
                console.log('received the page');
                jsdom.env(
                    output,
                    ["http://code.jquery.com/jquery.js"],
                    function(errors, window) {
                        var $img, article, articleImg;

                        $img = window.$('img[itemprop=\'contentURL\']');
                        article = window.$('span[itemprop=\'articleBody\']').text(); 
                        articleImg = $img.attr('src');

                        receivedNews = new News({
                            'id': newsURL,
                            'article': article,
                            'image': articleImg
                        });    

                        receivedNews.save(function(error){
                            if (error) {
                                console.log('Error uh-oh ' + error);
                            }
                        });
                        console.log('Triggered a save');

                        callback(article, articleImg);
                });
            });

            newsReq.on('error', function(e) {
                console.log('problem with request: ' + e.message);
                console.log(e);
            });

            console.log(id);

            newsReq.end();
        });
    });
};
