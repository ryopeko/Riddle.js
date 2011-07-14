(function(doc, toArray, enc) {

  var listeners = {}, nodeId = 1,
      events = ["click", "submit", "focus", "blur", "scroll", "select", "change"],
      domLoaded = false;

/**
 * <p> Select HTMLElements, wait DOMContentLoaded or wrap HTMLElement with r.fn <br /> Usages are:
 * <ul>
 * <li>Select and wrap HTML Elements with r(selector: String, [context: HTMLElement]).
 * <li>Wait DOMContentLoaded with r(func: Function). <br/>
 * <li>Just to wrap HTMLElement with r(elem: HTMLElement)
 * <ul/>
 * @name r
 * @namespace
 * @function
 * @param first {(string|function|HTMLElement)}
 * @param second {?(HTMLElement|NodeArray)}
 * @return {NodeArray} On Selector or wrapper usage
 * @example
 * var elementsById = r("#id");
 * var elementsByClass = r(".class");
 * var elementsByTag = r("tag");
 * @example
 * r(function() {
 *   // put initialization process here, which you want to run after DOMContentLoaded event
 * });
 * @example
 * r("#id").bind(function(e) {
 *   var wrapped = r(e.target);
 * });
 */
  function r(first, second) {
    if ( typeof first === "string" ) {
      return queryWithContext(first, second, "querySelectorAll");
    }
    else if ( first instanceof HTMLElement ) {
      return wrap(elementAsArray(first));
    }
    else if ( typeof first === "function" ) {
      if ( domLoaded ) {
        first(r);
      }
      else {
        doc.addEventListener("DOMContentLoaded", function() {
          first(r);
        }, false);
      }
    }
  }

  function queryWithContext(selector, context, functionName) {
    if ( typeof context === "undefined" || context instanceof HTMLElement ) {
      return wrap(elementAsArray((context || doc)[functionName](selector)));
    }
    else if ( context.__proto__ === r.fn ) {
      var selecteds = context.map(function(el) { return elementAsArray(el[functionName](selector)); });
      return wrap(selecteds.reduce(function(all, cur) { return all.concat(cur); }, []));
    }
  }

  function elementAsArray(el) {
    if ( el instanceof HTMLElement ) {
      return [el];
    }
    else if ( typeof el.length === "number" && typeof el.item === "function" ) {
      return toArray.call(el);
    }
  }

  function wrap(ary) {
    ary.__proto__ = r.fn;
    return ary;
  }

 /**
  * Base class of HTMLElement Array collected by selector.
  * @name r.fn
  * @class base class of HTMLElement Array collected by selector.
  */
  r.fn = {
    // Array++
    detect: detect,
    invoke: invoke,
    pluck: pluck,

    // DOM
    html: html,
    add: add,
    remove: remove,

    // attribute
    attr: attr,
    css: css,
    addClass: addClass,
    removeClass: removeClass,
    hasClass: hasClass,

    // event
    bind: bind,
    unbind: unbind
  };

  doc.addEventListener("DOMContentLoaded", function(e) {
    domLoaded = true;
  }, false);

  events.forEach(function(event) {
    r.fn[event] = function(callback, useCapture) {
      this.bind(event, callback, useCapture);
    };
  });

  r.fn.__proto__ = Array.prototype;


// Array++

/**
 * Get the first Element which returns true with given predicate
 * @name detect
 * @function
 * @memberOf r.fn
 * @param pred {function}
 * @return {HTMLElement} HTMLElement if found
 * @example
 * var apple = r("select#fruits option").detect(function(option) { return option.value === "apple"; });
 */
  function detect(pred) {
    return this.filter(pred)[0];
  }

/**
 * Invoke function for each element and produce result Array
 * @name invoke
 * @function
 * @memberOf r.fn
 * @param functionName {string}
 * @return {Array} Array of produced results
 */
  function invoke() {
    var args = toArray.call(arguments), func = args.shift();
    return this.map(function(item) {
      return item[func].apply(item, args);
    });
  }

/**
 * Collect properties of all elements with given key
 * @name pluck
 * @function
 * @memberOf r.fn
 * @param key {string}
 * @return {Array} Array of properties
 * @example
 * var values = r("select#fruits option").pluck("value");
 */
  function pluck(key) {
    return this.map(function(item) { return item[key]; });
  }


// DOM

/**
 * <p> Get/Set innerHTML of elements </p>
 * <ul>
 * <li> html(): returns html: String if selector has just one element
 * <li> html(): returns htmls: Array[String] if selector has more than two elements
 * <li> html(str): set string as innerHTML for all elements
 * <li> html(elem): set HTMLElement as innerHTML for all elements
 * <li> html(nodeArray): set NodeArray as innerHTML for all elements
 * <ul/>
 * @name html
 * @function
 * @memberOf r.fn
 * @param html {(string|HTMLElement|NodeArray)}
 * @return {(string|Array.<string>)}
 * @example
 * var story = r("p#story").html();
 * @example
 * var colors = r("li.colors").html();
 * @example
 * r("li.colors").html("black");
 * @example
 * r("li.colors").html(document.getElementById("#my-color"));
 * @example
 * r("#story").html(r("li#stories"));
 */
  function html(item) {
    var outers;

    if ( typeof item === "undefined" ) {
      if ( this.length === 1 ) {
        return this[0].innerHTML;
      }
      else {
        return this.pluck("innerHTML").map(function(html) { return html; });
      }
    }
    else {
      if ( typeof item === "string" ) {
        this.forEach(function(elem) { elem.innerHTML = item; });
      }
      else if ( item instanceof HTMLElement ) {
        this.forEach(function(elem) { elem.innerHTML = item.outerHTML; });
      }
      else if ( item.__proto__ === r.fn ) {
        outers = item.map(function(el) { return el.outerHTML; }).join("");
        this.forEach(function(elem) {
          elem.innerHTML = outers;
        });
      }
    }
    return this;
  }

/**
 * Remove elements from document tree
 * @name remove
 * @function
 * @memberOf r.fn
 * @return {NodeArray} removed Elements
 * @example
 * r("#mami .head").remove();
 */
  function remove() {
    this.forEach(function(elem) { elem.parentNode.removeChild(elem); });
    return this;
  }

/**
 * Append elements to selected NodeArray. <br />
 * You can specify the position to insert by the second argument (default value is "last"), <br />
 * see http://msdn.microsoft.com/ja-jp/library/cc428075.aspx or http://ejohn.org/blog/dom-insertadjacenthtml/
 * @name add
 * @function
 * @memberOf r.fn
 * @param elem {(HTMLElement|NodeArray|string)}
 * @example
 * r(".magical-girl").add(document.getElementById("#madoka"));
 * @example
 * r(".magical-girl").add(r("#madoka, #homura"));
 * @example
 * r("#madoka").add("homuhomu");
 * @example
 * r("#madoka").add("homuhomu", "prev");
 * @example
 * r("#madoka").add("homuhomu", "first");
 * @example
 * r("#madoka").add("homuhomu", "last");
 * @example
 * r("#madoka").add("homuhomu", "next");
 */
  function add(item, position) {
    var text, pos = position || "last";

    if ( item.__proto__ === r.fn ) {
      text = item.map(function(el) { return el.outerHTML; }).join("");
      this.forEach(function(elem) { add[pos](elem, text); });
    }
    else if ( item instanceof HTMLElement ) {
      text = item.outerHTML;
      this.forEach(function(elem) {
        add[pos](elem, text);
      });
    }
    else if ( typeof item === "string" ) {
      this.forEach(function(elem) {
        add[pos](elem, item);
      });
    }
    return this;
  }

  add.prev = function(elem, text) {
    elem.insertAdjacentHTML("beforeBegin", text);
  };

  add.first = function(elem, text) {
    elem.insertAdjacentHTML("afterBegin", text);
  };

  add.last = function(elem, text) {
    elem.insertAdjacentHTML("beforeEnd", text);
  };

  add.next = function(elem, text) {
    elem.insertAdjacentHTML("afterEnd", text);
  };


// attributes

/**
 * <p> Get/Set attribute(s) of elements </p>
 * <ul>
 * <li> attr(name): returns attribute: String if selector has just one element
 * <li> attr(name): returns attributes: Array[String] if selector has more than two elements
 * <li> attr(name, value): set value to element's attribute
 * <li> attr(hash): set values to element's attribute
 * <ul/>
 * @name attr
 * @function
 * @memberOf r.fn
 * @param first {(string|Object)}
 * @param second {?string}
 * @return {(string|Array.<string>)}
 * @example
 * var value = r("#age").attr("value");
 * @example
 * var values = r("option.age").attr("value");
 * @example
 * r(".links-change").attr("href", "http://example.com");
 * @example
 * r(".links-change").attr( { href: "http://example.com", target: "_blank" } );
 */
  function attr(first, second) {
    if ( typeof first === "string" ) {
      if ( typeof second === "undefined" ) {
        if ( this.length === 1 ) {
          return this[0].getAttribute(first);
        }
        else {
          return this.invoke("getAttribute", first);
        }
      }
      else {
        this.invoke("setAttribute", first, String(second));
      }
    }
    else if ( typeof first === "object" ) {
      this.forEach(function(elem) {
        for ( var k in first ) {
          elem.setAttribute(k, String(first[k]));
        }
      });
    }
    return this;
  }

/**
 * <p> Get/Set css property(properties) of elements </p>
 * <ul>
 * <li> css(key): returns css style value: String if selector has just one element
 * <li> css(key): returns css style values: Array[String] if selector has more than two elements
 * <li> css(key, value): set css style value
 * <li> css(hash): set css style values
 * <ul/>
 * @name css
 * @function
 * @memberOf r.fn
 * @param first {(string|Object)}
 * @param second {?string}
 * @return {(string|Array.<string>)}
 * @example
 * var bodyHeight = r("body").css("height");
 * @example
 * var listHeights = r("li.familiar").css("height");
 * @example
 * r("#hyde").css("height", "156px");
 * @example
 * r(".monster").css( { visibility: "visible", background-color: "red" } );
 */
  function css(first, second) {
    if ( typeof first === "string" ) {
      if ( typeof second === "undefined" ) {
        if ( this.length === 1 ) {
          return getComputedStyle(this[0], "").getPropertyValue(first);
        }
        else {
          return this.map(function(elem) {
            return getComputedStyle(elem, "").getPropertyValue(first);
          });
        }
      }
      else {
        this.forEach(function(elem) {
          elem.style.setProperty(first, second, "");
        });
      }
    }
    else if ( typeof first === "object" ) {
      this.forEach(function(elem) {
        for ( var key in first ) {
          elem.style.setProperty(key, first[key], "");
        }
      });
    }
    return this;
  }

/**
 * set class to elements
 * @name addClass
 * @function
 * @memberOf r.fn
 * @param className {string}
 */
  function addClass(name) {
    this.forEach(function(elem) {
      elem.className = elem.className.trim() + " " + name;
    });
    return this;
  }

/**
 * remove class from elements
 * @name removeClass
 * @function
 * @memberOf r.fn
 * @param className {string}
 */
  function removeClass(name) {
    var regex = new RegExp("(?:^|\\b)" + name + "(?:\\b|$)\\s?", "g");
    this.forEach(function(elem) {
      elem.className = elem.className.replace(regex, "");
    });
    return this;
  }

/**
 * return elements have that class or not
 * @name hasClass
 * @function
 * @memberOf r.fn
 * @param className {string}
 * @return {(boolean|Array.<boolean>)}
 */
  function hasClass(name) {
    var regex = new RegExp("(?:^|\\b)" + name + "(?:\\b|$)");
    if ( this.length === 1 ) {
      return !!this[0].className.match(regex);
    }
    else {
      return this.map(function(el) { return !!el.className.match(regex); } );
    }
  }


// event handling

  function getNodeId(elem) {
    return elem.nid || (elem.nid = nodeId++);
  }

  function findBoundsByEvent(bounds, event) {
    return bounds.filter(function(bound) { return bound.event === event });
  }

/**
 * bind callback function to elements
 * @name bind
 * @function
 * @memberOf r.fn
 * @param event {string}
 * @param callback {function(e: Object)}
 * @param useCapture {?boolean}
 * @example
 * r("#button").bind("click", function(e) {
 *   alert("button clicked on" + e.target.tagName);
 * });
 */
  function bind(event, callback, useCapture) {
    this.forEach(function(elem) {
      var id = getNodeId(elem),
          bounds = listeners[id] || (listeners[id] = []);
      bounds.push( { event: event, callback: callback, index: bounds.length } );
      elem.addEventListener(event, callback, useCapture || false);
    });
    return this;
  }

/**
 * unbind alreaedy-bound callback function from elements
 * @name unbind
 * @function
 * @memberOf r.fn
 * @param event {string}
 * @example
 * r("#button").unbind("click");
 */
  function unbind(event) {
    this.forEach(function(elem) {
      var id = getNodeId(elem),
          bounds = event ? findBoundsByEvent(listeners[id], event) : listeners[id];
      bounds && bounds.forEach(function(bound) {
        delete bounds[bound.index];
        elem.removeEventListener(bound.event, bound.callback, false);
      });
    });
    return this;
  }


// ajax

  function encode(obj) {
    var result = "?", set = [], key;

    for ( key in obj ) {
      set.push(enc(key) + "=" + enc(obj[key]));
    }

    return result + set.join("&");
  }

/**
 * send XMLHttpRequest to given URL to get data
 * @name ajax
 * @memberOf r
 * @function
 * @param url {string}
 * @param success {function(string, Object)}
 * @param error {?function(Object)}
 * @param options {?{method: string, header: Object, ctype: string, data: Object}}
 * @example
 * r.ajax("http://example.com/people/get", function(data, xhr) {
 *   r("#people").html(data);
 * });
 * @example
 * r.ajax("http://example.com/articles", function(data, xhr) {
 *   r("#article").html(data.result);
 * }, function(xhr) {
 *   r("#article").html("Oops! Something is wrong!");
 *   console.dir(xhr);
 * }, {
 *   method: "POST",
 *   data: {
 *     foo: "bar",
 *     bar: "baz",
 *   },
 *   header: {
 *     "X-FooBar": "baz"
 *   },
 * });
 */
  function ajax(url, success, error, options) {
    var xhr = new XMLHttpRequest(),
        options = options || {},
        error = error || function() {},
        header = options.header || {},
        ctype = options.ctype || (( options.method === "POST" ) ? "application/x-www-form-urlencoded" : ""),
        data = options.data || "",
        key;

    xhr.onreadystatechange = function() {
      if ( xhr.readyState === 4 ) {
        if ( xhr.status >= 200 && xhr.status < 300 ) {
          success(xhr.responseText, xhr);
        } else {
          error(xhr);
        }
      }
    };

    if ( typeof data === "object" ) {
      data = encode(data);
    }

    xhr.open(options.method || "GET", url, true);

    if ( ctype ) {
      xhr.setRequestHeader("Content-Type", ctype);
    }
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

    for ( key in header ) {
      xhr.setRequestHeader(key, header[key]);
    }

    xhr.send(data);
  }


// shorthand and fast query

/**
 * select a element by id and wrap it as NodeArray
 * @name id
 * @function
 * @memberOf r
 * @param identifier {string}
 * @param context [HTMLElement]
 * @return NodeArray
 */
  function id(identifier, context) {
    return queryWithContext(identifier, context, "getElementById");
  }

/**
 * select elements by class and wrap it as NodeArray
 * @name cls
 * @function
 * @memberOf r
 * @param name {string}
 * @param context [HTMLElement]
 * @return NodeArray
 */
  function cls(name, context) {
    return queryWithContext(name, context, "getElementsByClassName");
  }


// add public method to r

  r.id = id;
  r.cls = cls;
  r.ajax = ajax;

  r.version = "0.2.0";

  window.r = r;

})(document, Array.prototype.slice, encodeURIComponent);
(function() {

  // CSS3 transition based-animation.
  // Easy and smooth but not flexible.

  // Can we stop (undo) animation with saving original css properties?

  function animate(properties, options) {
    var dur = options.duration || 0.5,
        ease = options.easing || "ease-in-out",
        transNum,
        endCall = 0,
        cssParams = { "-webkit-transition": dur + "s " + ease };

    if ( properties instanceof Array ) {
      cssParams["-webkit-transform"] = properties.join(" ");
      transNum = 1;
    }
    else if ( typeof properties === "object" ) {
      transNum = copy(properties, cssParams);
    }

    if ( typeof options.callback === "function" ) {
      var that = this;
      this.bind("webkitTransitionEnd", function(e) {
        ++endCall;
        if ( transNum === endCall ) {
          options.callback(e);
          that.unbind("webkitTransitionEnd");
        }
      });
    }

    this.css(cssParams);
  }

  function copy(from, to) {
    var key, count = 0;
    for ( key in from ) {
      to[key] = from[key];
      count++;
    }
    return count;
  }

  r.fn.animate = animate;

})();
(function(doc) {

  r.pjaxOption = {
    header: {
      "X-PJAX": "true"
    }
  };

  function pjax(selector, producer, error) {
    this.bind("click", function(e) {
      var href = this.getAttribute("href"),
          state = (typeof producer === "function") ? producer(this) : {},
          error = error || function() {};

      r.ajax(href, function(data) {
        r(selector).html(data);
        history.pushState(state, doc.title, href);
      }, error, {
        header: r.pjaxOption.header
      });

      e.preventDefault();
    });
  }

  r.fn.pjax = pjax;
})(document);
r(function() {

  var body = document.body,
      touchEvents = ["swipeLeft", "swipeRight"],
      touch = { x1: 0, x2: 0 };

  function search(node) {
    return 'tagName' in node ? node : node.parentNode;
  }

  function trigger(elem, event) {
    var e = document.createEvent("Event");
    e.initEvent(event, true, true);
    elem.dispatchEvent(e);
  }

  r(body).bind("touchstart", function(e) {
    touch.target = search(e.touches[0].target);
    touch.x1 = e.touches[0].pageX;
    //console.dir(e);
  });

  r(body).bind("touchmove", function(e) {
    touch.x2 = e.touches[0].pageX;
    //console.dir(e);
  });

  r(body).bind("touchend", function(e) {
    var delta = touch.x1 - touch.x2;

    if ( touch.x1 && touch.x2 && Math.abs(delta) > 30 ) {
      if ( delta > 0 ) {
        trigger(touch.target, "swipeLeft");
      }
      else {
        trigger(touch.target, "swipeRight");
      }
    }

    touch.target = null;
    touch.x1 = touch.x2 = 0;
  });

  touchEvents.forEach(function(event) {
    r.fn[event] = function(callback, useCapture) {
      this.bind(event, callback, useCapture);
    };
  });

});
(function() {

  function RStorage(storage) {
    this.storage = storage;
  }

  function set(key, value) {
    if ( typeof key === "number" || typeof key === "string" ) {
      this.storage.setItem(key, JSON.stringify(value));
    }
    else if ( typeof value === "undefined" ) {
      throw Error("typeof value is 'undefined'. Maybe you're doing something wrong");
    }
    else {
      throw Error("Given value as key is OK but seems not a good manner");
    }
  }

  function get(key) {
    if ( typeof this.storage[key] === "undefined" ) {
      return null;
    }
    else {
      return JSON.parse(this.storage.getItem(key));
    }
  }

  function clear() {
    this.storage.clear();
  }

  function size() {
    return this.storage.length;
  }

  function keys() {
    var result = [], k;

    for ( k in this.storage ) {
      result.push(k);
    }

    return result;
  }

  function values() {
    var result = [], k;

    for ( k in this.storage ) {
      result.push(this.get(k));
    }

    return result;
  }

  RStorage.prototype.set = set;
  RStorage.prototype.get = get;
  RStorage.prototype.clear = clear;
  RStorage.prototype.size = size;
  RStorage.prototype.keys = keys;
  RStorage.prototype.values = values;


  function storage(name) {
    return storage.sname || (storage.sname = new RStorage(window[name + "Storage"]));
  }

  r.storage = storage;

})();
