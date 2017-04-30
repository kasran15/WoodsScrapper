var behindwoodsNewsURL = '/tamil-movies-cinema-news-16/',
	cinemaNewsURL = 'cinema-news.html',
	$newsSelector = 'a[href*=\'tamil-movies-cinema-news-16\']:not(a[href$=\'cinema-news.html\'])',
    behindwoodsURL = 'http://www.behindwoods.com',
    httpRequest = require('request'),
    jsdom = require('jsdom'),
    _ = require('lodash'),
    article,
    articleImg,
    headers = {
        'Content-type': 'text/html; charset=utf-8'
    }
    output = '',
    mongoose = require('mongoose'),
	uriUtil = require('mongodb-uri'),
    newsSchema = mongoose.Schema({
        id: String,
        image: String,
        article: String
    }, {
        collection: 'newsCache'
    }),
    News = mongoose.model('News', newsSchema),
	uri = 'mongodb://wood:wood@ds051953.mongolab.com:51953/heroku_gv12hs9j';


mongoose.connect(uriUtil.formatMongoose(uri), { }, 

	function(err) {
		if (err) {
			console.log('connection to db failed ');
			console.log(arguments);
		}
}); 



exports.getNewsList = function(callback) {
    var newsURL = behindwoodsNewsURL + cinemaNewsURL,

    links,

    newsList,

    output = '',

    options = {
        hostname: 'www.behindwoods.com',
        path: newsURL,
        headers: {
            'Content-type': 'text/html; charset=utf-8'
        }
    };

    httpRequest(behindwoodsURL + newsURL, function(error, response, body) {
		console.log('response from bw: ');

		jsdom.env(
			body,
			["http://code.jquery.com/jquery.js"],
			function(errors, window) {
				if (errors)
					console.log("Errors: " + errors);
				var $box, $img;
				$box = window.$($newsSelector);
				newsList = [];
				links = $box.find('a');

				_.each($box, function(link) {
					newsList.push(link.getAttribute('href'));
				})

				callback(_.uniq(newsList));
		});
    });

};

exports.getNews = function(id, callback) {
    var newsURL = id,

    output = '',

    options = {
        hostname: 'www.behindwoods.com' + behindwoodsNewsURL,
        path: newsURL,
        headers: {
            'Content-type': 'text/html; charset=utf-8'
        }
    },

    receivedNews,

    cachedNews,

    newsReq;

    cachedNews = News.findOne({"id": newsURL}, function(err, res) {
        if (res) {
            console.log('Cache hit. id:' + newsURL);
            callback(res.article, res.image);
            return;
        }

		console.log('Cache miss. id:' + newsURL);
console.log('request: ' + behindwoodsURL + '/' +  newsURL);

                jsdom.env(
                    behindwoodsURL +  newsURL,
                    ["http://code.jquery.com/jquery.js"],
					{
						parsingMode: 'html',
					},
                    function(errors, window) {
                        var $img, article, articleImg;
						if (errors) {
							console.log('error parsing the response body' + errors);
							return;
						}

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
};
