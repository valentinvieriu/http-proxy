;(function (define) {
  var id = 'qtip';
  if ('function' == typeof define) {
    define.nextId(id);
//    console.log('define %s', id);
  } else {
//    console.warn('could not call define.nextId', id);
  }
}(window.define));
