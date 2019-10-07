/* global OffCanvas */
"use strict";

var CatalogEvent = require("pdl/CatalogEvent"),
  Formatter = require("core/Formatter"),
  Util = require("util/Util"),
  View = require("mvc/View");

var nav, timeline;

nav = TimelineNav({
  el: document.querySelector(".site-sectionnav")
});

timeline = Timeline({
  el: document.querySelector("#application"),
  nav: nav
});

function formatNumberDiff(n, reference) {
  if (!n) {
    return "&ndash;";
  }

  var diff = n - reference;

  return (
    (diff >= 0 ? "+" : "") +
    diff.toFixed(2) +
    "<br/>" +
    '<small class="value">' +
    n +
    "</small>"
  );
}

function formatTimeDiff(t, reference) {
  if (!t) {
    return "&ndash;";
  }

  t = new Date(t);
  reference = new Date(reference);

  var diff,
    seconds = 0,
    minutes = 0,
    hours = 0,
    days = 0,
    years = 0;

  diff = (t.getTime() - reference.getTime()) / 1000;
  seconds = Math.abs(diff);
  if (seconds > 60) {
    minutes = Math.round(seconds / 60);
    seconds = seconds % 60;
    if (minutes > 60) {
      hours = Math.round(minutes / 60);
      minutes = minutes % 60;
      if (hours > 24) {
        days = Math.round(hours / 24);
        hours = hours % 24;
        if (days > 365) {
          years = Math.round(days / 365);
          days = days % 365;
        }
      }
    }
  }

  var f = "";
  if (years != 0) {
    f += years + "y";
  }
  if (days != 0) {
    f += days + "d";
  }
  if (hours != 0 && years === 0) {
    f += hours + "h";
  }
  if (minutes != 0 && years === 0 && days === 0) {
    f += minutes + "m";
  }
  if (years === 0 && days === 0 && hours === 0) {
    f += seconds.toFixed(1) + "s";
  }
  return (
    (diff > 0 ? "+" : "-") +
    f +
    "<br/>" +
    '<small class="value">' +
    t.toISOString() +
    "</small>"
  );
}

function Timeline(options) {
  var _this, _initialize;

  _this = View(options);

  _initialize = function(options) {
    var el;

    options = Util.extend({}, options);

    el = _this.el;
    el.innerHTML =
      '<div class="summary"></div>' + '<div class="timeline"></div>';

    _this.formatter = options.formatter || Formatter();
    _this.summary = el.querySelector(".summary");
    _this.timeline = el.querySelector(".timeline");

    _this.nav = options.nav;
    _this.nav.model.on("change", _this.loadTimeline);
    _this.loadTimeline();
  };

  _this.formatProducts = function(products, summary) {
    var html = "";

    var eq = _this.model.get("event");
    var host = _this.nav.model.get("hostname");
    if (host) {
      host = "https://" + host;
    }

    // figure out first and last version of each product
    var firstLastIndex = {};
    products.forEach(function(p, i) {
      p = p.get();
      var key = `${p.source}_${p.type}_${p.code}`;
      if (!(key in firstLastIndex)) {
        firstLastIndex[key] = {
          first: i,
          last: i
        };
      } else {
        firstLastIndex[key].last = i;
      }
    });

    products.forEach(function(p, i) {
      p = p.get();
      var props = p.properties;

      var classes = [];
      var eventid =
        props.eventsource && props.eventsourcecode
          ? props.eventsource + props.eventsourcecode
          : "&ndash;";
      var xmlLink = `${host}/archive/product/${p.type}/${p.code}/${p.source}/${
        p.updateTime
      }/product.xml`;
      var xmlLinkText = p.id
        .replace("urn:usgs-product:", "")
        .replace(/\:[\d]+$/, "");

      classes.push("preferred-" + !!p.preferred);
      classes.push("type-" + p.type);
      classes.push("status-" + p.status);
      var key = `${p.source}_${p.type}_${p.code}`;
      if (i === firstLastIndex[key].first) {
        classes.push("version-first");
      }
      if (i === firstLastIndex[key].last) {
        classes.push("version-last");
      }

      html += `
          <tr class="${classes.join(" ")}">
            <td>${formatTimeDiff(p.updateTime, summary.time)}</td>
            <td>${formatTimeDiff(p.indexTime, p.updateTime)}</td>
            <td><a href="${xmlLink}">${xmlLinkText}</a></td>
            <td>${eventid}</td>
            <td>${formatNumberDiff(props.latitude, summary.latitude)}</td>
            <td>${formatNumberDiff(props.longitude, summary.longitude)}</td>
            <td>${formatTimeDiff(props.eventtime, summary.time)}</td>
            <td>${formatNumberDiff(props.magnitude, summary.magnitude)}</td>
            <td>${formatNumberDiff(props.depth, summary.depth)}</td>
            <td>${props.version || "&ndash;"}</td>
            <td>${p.status}</td>
          </tr>
      `;
    });

    html =
      // controls
      '<input type="radio" name="products" id="all-products" checked/>' +
      '<label for="all-products">' +
      "All products" +
      '</label>' +
      '<input type="radio" name="products" id="only-show-first-last"/>' +
      '<label for="only-show-first-last">' +
      "Only show first and last versions" +
      "</label>" +
      '<input type="radio" name="products" id="only-show-preferred"/>' +
      '<label for="only-show-preferred">' +
      "Only show preferred" +
      "</label>" +
      '<input type="radio" name="products" id="only-show-origins"/>' +
      '<label for="only-show-origins">' +
      "Only show origins" +
      "</label>" +
      '<br/>' +
      '<input type="checkbox" id="only-show-diffs" checked/>' +
      '<label for="only-show-diffs">' +
      "Hide values" +
      "</label>" +
      // table
      '<div class="horizontal-scrolling">' +
      "<table>" +
      "<thead>" +
      "<tr>" +
      "<th>" +
      '<abbr title="Time reported by contributor">Sent</abbr>*' +
      "</th>" +
      "<th>" +
      '<abbr title="Time (this server) processed product, relative to Sent">Indexed</abbr>' +
      "</th>" +
      "<th>Product</th>" +
      "<th>Event ID</th>" +
      "<th>Latitude</th>" +
      "<th>Longitude</th>" +
      "<th>Event Time</th>" +
      "<th>Magnitude</th>" +
      "<th>Depth</th>" +
      "<th>Version</th>" +
      "<th>Status</th>" +
      "</thead>" +
      "<tbody>" +
      html +
      "</tbody>" +
      "</table></div>" +
      // disclaimer about sent
      '<p class="alert info"><small>' +
      "* Sent is assigned by contributors, and does not necessarily " +
      "reflect when a product was actually sent via PDL. " +
      "</small></p>";
    return html;
  };

  _this.getProducts = function(eq) {
    var products;

    products = eq.getProducts();

    // flatten products into array
    products = Object.keys(products).reduce(function(arr, p) {
      p = products[p];
      p[0].set({ preferred: true });
      arr.push.apply(arr, p);
      return arr;
    }, []);

    // sort by updateTime
    products.sort(function(a, b) {
      /*if (a.type < b.type) {
        return -1;
      } else if (a.type > b.type) {
        return 1;
      } else {
      */
      return a.get("updateTime") - b.get("updateTime");
      //}
    });

    return products;
  };

  _this.loadTimeline = function() {
    var eventid, host, url, xhr;

    eventid = _this.nav.model.get("eventid");
    host = _this.nav.model.get("hostname");
    if (host) {
      host = "https://" + host;
    }

    _this.model.set({
      event: null,
      // loading if eventid is truthy
      loading: !!eventid
    });
    if (!eventid) {
      return;
    }

    url =
      host +
      "/fdsnws/event/1/query?format=geojson&includesuperseded=true&eventid=" +
      eventid;

    xhr = new XMLHttpRequest();
    xhr.addEventListener("load", _this.onLoad);
    xhr.open("GET", url);
    xhr.send();

    try {
      OffCanvas.getOffCanvas().hide();
    } catch (e) {
      console.log(e);
    }
  };

  _this.onLoad = function() {
    // "this" is the XHR object
    var eq;

    if (this.status != 200) {
      _this.timeline.innerHTML =
        '<p class="alert error">Error loading event</p>' +
        "<pre>" +
        this.responseText +
        "</pre>";
      return;
    }

    // parse response (this is the xhr)
    eq = CatalogEvent(JSON.parse(this.responseText));
    _this.model.set({
      event: eq,
      loading: false
    });
  };

  _this.render = function() {
    var eq, loading, products, summary;

    eq = _this.model.get("event");
    if (!eq) {
      loading = _this.model.get("loading");
      _this.summary.innerHTML = "";
      _this.timeline.innerHTML =
        '<div class="alert info">' +
        (loading ? "Loading event data&hellip;" : "Select an event") +
        "</div>";
      return;
    }

    summary = eq.getSummary();
    _this.summary.innerHTML =
      "<h2>" +
      summary.properties.title +
      "</h2>" +
      '<dl class="horizontal">' +
      "<dt>Event ID</dt>" +
      "<dd>" +
      summary.source +
      summary.sourceCode +
      "</dd>" +
      "<dt>Location</dt>" +
      "<dd>" +
      _this.formatter.location(summary.latitude, summary.longitude) +
      "</dd>" +
      "<dt>Time</dt>" +
      "<dd>" +
      _this.formatter.time(summary.time, true) +
      "</dd>" +
      "<dt>Depth</dt>" +
      "<dd>" +
      _this.formatter.depth(summary.depth) +
      "</dd>" +
      "<dt>Magnitude</dt>" +
      "<dd>" +
      _this.formatter.magnitude(summary.magnitude) +
      "</dd>" +
      "</dl>";

    products = _this.getProducts(eq);
    // make table
    _this.timeline.innerHTML =
      "<h3>Products</h3>" + _this.formatProducts(products, summary);
  };

  _initialize(options);
  options = null;
  return _this;
}

function TimelineNav(options) {
  var _this, _initialize;

  _this = View(options);

  _initialize = function(options) {
    var el;

    options = Util.extend({}, options);

    el = _this.el;
    el.innerHTML =
      '<form class="site-search">' +
      '<label for="hostname">' +
      "Host" +
      '<input id="hostname" type="text" value="earthquake.usgs.gov"/>' +
      "</label>" +
      '<label for="eventid">' +
      "Event ID" +
      '<input id="eventid" type="text"/>' +
      "</label>" +
      "<button>Update</button>" +
      "</form>" +
      '<section class="significant"></section>';

    _this.hostname = el.querySelector("#hostname");
    _this.eventid = el.querySelector("#eventid");
    _this.significant = el.querySelector(".significant");

    // defaults
    _this.model.set({
      eventid: null, // onHashChange will set this to ''
      hostname: "earthquake.usgs.gov"
    });

    el.querySelector("form").addEventListener("submit", _this.onSubmit);

    window.addEventListener("hashchange", _this.onHashChange);
    _this.onHashChange();

    _this.model.on("change:hostname", _this.loadSignificant);
    _this.loadSignificant();
  };

  _this.loadSignificant = function() {
    var host, url, xhr;

    host = _this.model.get("hostname") || "";
    if (host) {
      host = "https://" + host;
    }
    url = host + "/earthquakes/feed/v1.0/summary/significant_month.geojson";

    // only load when url changes
    if (_this.significant.getAttribute("data-url") === url) {
      return;
    }
    _this.significant.setAttribute("data-url", url);

    xhr = new XMLHttpRequest();
    xhr.addEventListener("load", function() {
      var html, json;

      json = JSON.parse(xhr.responseText);
      html = "";
      json.features.forEach(function(eq) {
        html += '<a href="#' + eq.id + '">' + eq.properties.title + "</a>";
      });
      _this.significant.innerHTML =
        "<header>Significant Earthquakes, Past Month</header>" + html;
    });
    xhr.open("GET", url);
    xhr.send();
  };

  _this.onHashChange = function() {
    var eventid, hash, hostname;

    hash = window.location.hash.replace("#", "");
    if (!hash) {
      _this.model.set({
        eventid: ""
      });
      return;
    }

    hash = hash.split("|");
    eventid = hash[0];
    hostname = hash.length > 1 ? hash[1] : _this.model.get("hostname");

    _this.model.set({
      eventid: eventid,
      hostname: hostname
    });
  };

  _this.onSubmit = function(e) {
    e.preventDefault();

    // this triggers onHashChange
    window.location = "#" + _this.eventid.value + "|" + _this.hostname.value;
  };

  _this.render = function() {
    _this.eventid.value = _this.model.get("eventid");
    _this.hostname.value = _this.model.get("hostname");
  };

  _initialize(options);
  options = null;
  return _this;
}
