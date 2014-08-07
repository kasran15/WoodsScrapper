// call the packages we need
var express    = require('express'); 		// call express
var app        = express(); 				// define our app using express
var bodyParser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser());

var port = process.env.PORT || 8080; 		// set our port

// ROUTES FOR OUR API
var router = express.Router(); 				// get an instance of the express Router
var behindwoodsNewsURL = '/tamil-movies-cinema-news-14/';
router.route('/news/:news_id')

	.get(function(req, res) {
		var newsURL = behindwoodsNewsURL + req.params.news_id + '.html',
			http = require('http'),
			jsdom = require('jsdom'),
			options = {
				hostname: 'www.behindwoods.com',
				path: newsURL,
                headers: {
                    'Content-type': 'text/html; charset=utf-8'
                }
			},
			$page,
            article,
            articleImg,
            output = '';

        res.set('Content-Type', 'utf8');
		var newsReq = http.request(options, function(newsRes) {
		    console.log('STATUS: ' + res.statusCode);
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
                        res.json({
                            article: article,
                            img: articleImg
                        });
                    });
            });
		});

		newsReq.on('error', function(e) {
		  console.log('problem with request: ' + e.message);
		});

		newsReq.end();

	});


// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Server started at: ' + port);
