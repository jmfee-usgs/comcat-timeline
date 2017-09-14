/* global OffCanvas */
'use strict';

var CatalogEvent = require('pdl/CatalogEvent'),
    Formatter = require('core/Formatter'),
    Util = require('util/Util'),
    View = require('mvc/View');


var el,
    nav,
    timeline;


el = document.querySelector('#application');
nav = document.querySelector('.site-sectionnav');

// todo significant events in nav
nav.innerHTML =
    '<form class="site-search">' +
      '<label for="eventid">' +
        'Event ID' +
        '<input id="eventid" type="text"/>' +
      '</label>' +
      '<button>Search</button>' +
    '</form>' +
    '<section></section>';
nav.querySelector('form').addEventListener('submit', onSubmit);
nav = nav.querySelector('section');


el.innerHTML = '<div class="timeline"></div>';

timeline = Timeline({
  el: el.querySelector('.timeline')
});
timeline.render();

function onSubmit (e) {
  e.preventDefault();

  window.location = '#' + document.querySelector('#eventid').value;
}

window.addEventListener('hashchange', onHashChange);
loadSignificant();
onHashChange();


function onHashChange () {
  var eventid;

  eventid = window.location.hash.replace('#', '')
  if (!eventid) {
    timeline.model.set({'event': null});
  } else {
    loadTimeline(eventid);
  }
}


function loadSignificant () {
  var url,
      xhr;

  url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson';

  xhr = new XMLHttpRequest();
  xhr.addEventListener('load', function () {
    var html,
        json;

    json = JSON.parse(xhr.responseText);
    html = '';
    json.features.forEach(function (eq) {
      html += '<a href="#' + eq.id + '">' +
          eq.properties.title +
          '</a>';
    });
    nav.innerHTML = '<header>Significant Earthquakes, Past Month</header>' + html;
  });
  xhr.open('GET', url);
  xhr.send();
}


function loadTimeline (eventid) {
  var url,
      xhr;

  timeline.model.set({'event': null});

  url = 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&includesuperseded=true&eventid=' +
      eventid;

  xhr = new XMLHttpRequest();
  xhr.addEventListener('load', onLoad);
  xhr.open('GET', url);
  xhr.send();

  try {
    OffCanvas.getOffCanvas().hide();
  } catch (e) {
    console.log(e);
  }
}

function onLoad () {
  var eq;

  if (this.status != 200) {
    el.innerHTML = '<p class="alert error">Error loading event</p>' +
        '<pre>' + this.responseText + '</pre>';
    return;
  }

  // parse response (this is the xhr)
  eq = CatalogEvent(JSON.parse(this.responseText));
  timeline.model.set({
    'event': eq
  });
}




function Timeline (options) {
  var _this,
      _initialize;

  _this = View(options);

  _initialize = function (options) {
    var el;

    options = Util.extend({}, options);

    el = _this.el;
    el.innerHTML =
        '<div class="summary"></div>' +
        '<div class="timeline"></div>';

    _this.formatter = options.formatter || Formatter();
    _this.summary = el.querySelector('.summary');
    _this.timeline = el.querySelector('.timeline');
  };


  _this.formatProduct = function (html, p) {
    var props;

    p = p.get();

    props = p.properties;
    html +=
      '<tr class="' +
        'type-' + p.type +
        ' preferred-' + (!!p.preferred) +
      '">' +
      '<td><time>' + new Date(p.updateTime).toISOString() + '</time></td>' +
      '<td>' +
        '<a href="https://earthquake.usgs.gov/archive/product/' +
            p.type + '/' + p.code + '/' + p.source + '/' + p.updateTime +
            '/product.xml">' +
          p.id.replace('urn:usgs-product:', '').replace(/\:[\d]+$/, '') +
        '</a>' +
      '</td>' +
      '<td>' +
        (props.eventsource && props.eventsourcecode ?
            props.eventsource + props.eventsourcecode :
            '&ndash;') +
      '</td>' +
      '<td>' + (props.latitude || '&ndash;') + '</td>' +
      '<td>' + (props.longitude || '&ndash;') + '</td>' +
      '<td>' + (props.eventtime || '&ndash;') + '</td>' +
      '<td>' + (props.magnitude || '&ndash;') + '</td>' +
      '<td>' + (props.depth || '&ndash;') + '</td>' +
      '<td>' + (props.version || '&ndash;') + '</td>' +
      '<td>' + p.status + '</td>' +
      '</tr>';

    return html;
  };

  _this.getProducts = function (eq) {
    var products;

    products = eq.getProducts();

    // flatten products into array
    products = Object.keys(products).reduce(function (arr, p) {
      p = products[p];
      p[0].set({'preferred': true});
      arr.push.apply(arr, p);
      return arr;
    }, []);

    // sort by updateTime
    products.sort(function (a, b) {
      /*if (a.type < b.type) {
        return -1;
      } else if (a.type > b.type) {
        return 1;
      } else {
      */
        return a.get('updateTime') - b.get('updateTime');
      //}
    });

    return products;
  };

  _this.render = function () {
    var eq,
        products,
        summary;

    eq = _this.model.get('event');
    if (!eq) {
      _this.summary.innerHTML = '';
      _this.timeline.innerHTML = '<div class="alert info">' +
          'Select an event' +
          '</div>';
      return;
    }

    summary = eq.getSummary();
    _this.summary.innerHTML =
        '<h2>' + summary.properties.title + '</h2>' +
        '<dl class="horizontal">' +
        '<dt>Event ID</dt>' +
        '<dd>' + summary.source + summary.sourceCode + '</dd>' +
        '<dt>Location</dt>' +
        '<dd>' + _this.formatter.location(
              summary.latitude, summary.longitude) + '</dd>' +
        '<dt>Time</dt>' +
        '<dd>' + _this.formatter.time(summary.time, true) + '</dd>' +
        '<dt>Depth</dt>' +
        '<dd>' + _this.formatter.depth(summary.depth) + '</dd>' +
        '<dt>Magnitude</dt>' +
        '<dd>' + _this.formatter.magnitude(summary.magnitude) + '</dd>' +
        '</dl>';

    products = _this.getProducts(eq);

    // make table
    _this.timeline.innerHTML =
      '<h3>Products</h3>' + 
      '<div class="horizontal-scrolling">' +
      '<table>' +
      '<thead>' +
        '<tr>' +
          '<th>Sent</th>' +
          '<th>Product</th>' +
          '<th>Event ID</th>' +
          '<th>Latitude</th>' +
          '<th>Longitude</th>' +
          '<th>Event Time</th>' +
          '<th>Magnitude</th>' +
          '<th>Depth</th>' +
          '<th>Version</th>' +
          '<th>Status</th>' +
      '</thead>' +
      '<tbody>' +
        products.reduce(_this.formatProduct, '') +
      '</tbody>' +
      '</table>' +
      '</div>';
  };


  _initialize(options);
  options = null;
  return _this;
};

