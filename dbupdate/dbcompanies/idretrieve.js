//retrieves company ids from page by web scraping using phantomjs
var page = require('webpage').create();
var fs = require('fs');

page.open("https://angel.co/companies", function(status) {
  if ( status !== "success" ) {
    output.errors.push('Unable to access network');
  } else {
    var repeats = 0;
    window.setInterval(function(){
      var ids = page.evaluate(function() {
        return [].map.call(document.querySelectorAll('a.profile-link'), function(id){
          return id.getAttribute('data-id');
        }).join('\n');
      });
      fs.write('companyIds.txt', ids , 'w');
      phantom.exit();
    }, 2000);
  }
});