var Avrgirl = require('../../');

var avrgirl = new Avrgirl({
  board: 'uno',
  debug: true
});

//var hex = __dirname + '/../../junk/hex/uno/Blink.cpp.hex';
var hex = __dirname + 'hex/blink.hex';
avrgirl.flash(hex, function(error) {
  if (error) {
    console.error(error);
  } else {
    console.info('done.');
  }
});
