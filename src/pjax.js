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

  r(function() {
    r(window).bind("popstate", function() {
    });
  });

  r.fn.pjax = pjax;
})(document);
