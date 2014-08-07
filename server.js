// call the packages we need
var express    = require('express'); 		// call express
var app        = express(); 				// define our app using express
var bodyParser = require('body-parser');
var router = express.Router();              // get an instance of the express Router


// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser());

var port = process.env.PORT || 8080; 		// set our port

// ROUTES FOR OUR API

router.route('/news/:news_id')

	.get(function(req, res) {

		var news = require('./news');

        console.log('STATUS: ' + res.statusCode);
        
        news.getNews(req.params.news_id, function(article, image) {
            res.set('Content-Type', 'utf8');
            res.json({
                article: article,
                image: image
            })
        });

	});


// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Server started at: ' + port);
