// required packages
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var fs = require('fs');

// read the data file
function readData(fileName) {
  let dataRead = fs.readFileSync('./data/' + fileName + '.json');
  let infoRead = JSON.parse(dataRead);
  return infoRead;
}

// read the data file
function writeData(info, fileName) {
  data = JSON.stringify(info);
  fs.writeFileSync('./data/' + fileName + '.json', data);
}

// update the data file, I use "name" to be equal to fruit, or animal or color
// to match with the file names
// I assume we always just add 1 to a single item
function combineCounts(name, value) {
  // console.log(value);
  info = readData(name);
  // will be useful for text entry, since the item typed in might not be in the list
  var found = 0;
  for (var i = 0; i < info.length; i++) {
    if (info[i][name] === value) {
      info[i].count = parseInt(info[i].count) + 1;
      found = 1;
    }
  }
  console.log('alert');
  if (found === 0) {
    info.push({ [name]: value, count: 1 });
  }
  writeData(info, name);
}

// This is the controler per se, with the get/post
module.exports = function (app) {
  // when a user goes to localhost:3000/analysis
  // serve a template (ejs file) which will include the data from the data files
  app.get('/analysis', function (req, res) {
    let name = readData('name');
    let source = readData('source');
    let products = readData('products');
    let platforms = readData('platforms');
    let comments = readData('comments');
    let rate = readData('rate');
    res.render('showResults', {
      results: [name, source, products, platforms, comments, rate],
    });
    console.log([name, source, products, platforms, comments, rate]);
  });

  // when a user goes to localhost:3000/niceSurvey
  // serve a static html (the survey itself to fill in)
  app.get('/index', function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
  });

  // when a user types SUBMIT in localhost:3000/niceSurvey
  // the action.js code will POST, and what is sent in the POST
  // will be recuperated here, parsed and used to update the data files
  app.post('/index', urlencodedParser, function (req, res) {
    console.log('sent');
    console.log(req.body);
    var json = req.body;
    for (var key in json) {
      console.log(key + ': ' + json[key]);
      // in the case of checkboxes, the user might check more than one
      if (key === 'platforms' && json[key].length === 2) {
        for (var item in json[key]) {
          combineCounts(key, json[key][item]);
        }
      } else {
        combineCounts(key, json[key]);
      }
    }
    // mystery line... (if I take it out, the SUBMIT button does change)
    // if anyone can figure this out, let me know!
    res.sendFile(__dirname + '/views/index.html');
  });
};
