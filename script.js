var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

// The argument after 'node' and 'script.js' is the target URL
var url = process.argv[2];

(function(){
  //All the web scraping magic will happen here
 
  console.log('Scraping images from ' + url);

  // Define our download function to get images
  var download = function(uri, filename, callback){
    request.head(uri, function(err, res, body){
      request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
  };
  
  //Here's where we make our request
  request(url, function(error, response, html){

    if(!error) {
    
      // Cheerio gives us jQuery-like functionality
      var $ = cheerio.load(html);
      
      // We want the links to the house images,
      // which we'll later download
      var imageLinks = [];

      // Images are in an ol
      // under a div with id="photos"
      var orderedList = $('div#photos')
        .children().first()
        .children().first()
        .children('ol.photos');
      
      // Each li has an img in it
      orderedList.children('li').each(function() {
        // Get the img element out of the li
        var listItem = $(this);
        var img = listItem
          .children().eq(1)
          .children().first();
        
        // Get the image link out of the img
        // The first two imgs use src,
        // and each one after uses href
        var imageLink;
        if(img.attr('src')) {
          imageLink = img.attr('src');
        }
        if(img.attr('href')) {
          imageLink = img.attr('href');
        }
        imageLinks.push(imageLink);

        // Zillow gives each img an ID
        // Use it for file naming
        imageID = img.attr('id');

        // Download the file and store it with its ID
        download(imageLink, imageID + '.jpg', function(){
          console.log('Downloaded ' + imageLink);
        });
      });
    }
  });

  console.log('All done!');

})();

