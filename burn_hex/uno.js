var Avrgirl = require('../../');

var avrgirl = new Avrgirl({
  board: 'uno',
  debug: true
});

//var hex = __dirname + '/../../junk/hex/uno/Blink.cpp.hex';
var hex = __dirname + '/arduino_webserial_cc.ino.hex';
avrgirl.flash(hex, function(error) {
  if (error) {
    console.error(error);
  } else {
    console.info('done.');
  }
});
