module("test for touch event");

is = strictEqual;
isnt = notStrictEqual;

function emit(el, eventName, callback, touches) {
  var event = document.createEvent("Event");
  event.initEvent(eventName, true, true);
  event.touches = touches;
  ( el.__proto__ === r.fn ) ? el[0].dispatchEvent(event) : el.dispatchEvent(event);

  if ( typeof callback === "function" ) {
    callback();
  }
}


test("pjax", function() {
  r("a").pjax("#target");
  console.dir(r("a"));
  ok(true);
});
