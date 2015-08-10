module.exports = (function() {

  'use strict';

  var ErrorLocationLightbox = require('../lightboxes/ErrorLocationLightbox.js');

  var API_URL = 'http://www.jack-palmer.co.uk/wheel/api/getPlaces/';

  function Places(userOptions) {

    this.options = {
        radius: 300,
        radiusIncrement: 50,
        placeType: 'restaurant',
        maxPlaces: 12,
        initialPlaces: 12,
        dynamicSearch: false
    };

    this.URLparams = WOL.app.utilities.getURLParams();

    if(typeof userOptions === 'undefined') {
      this.userOptions = { };
    } else {
      this.userOptions = userOptions;
    }

    this.restaurants = {};

    this.init();
    this.getPlaces(this.options);
  }

  Places.prototype.init = function() {
    if(typeof this.URLparams.lat !== 'undefined') { this.options.latitude = this.URLparams.lat; }
    if(typeof this.URLparams.long !== 'undefined') { this.options.longitude = this.URLparams.long; }
    if(typeof this.URLparams.radius !== 'undefined') { this.options.radius = this.URLparams.radius; }
    if(typeof this.URLparams.type !== 'undefined') { this.options.placeType = this.URLparams.type; }
    if(typeof this.URLparams.maxplaces !== 'undefined') { this.options.maxPlaces = this.URLparams.maxplaces; }

    if(typeof this.userOptions.latitude !== 'undefined') { this.options.latitude = this.userOptions.latitude; }
    if(typeof this.userOptions.longitude !== 'undefined') { this.options.longitude = this.userOptions.longitude; }
    if(typeof this.userOptions.radius !== 'undefined') { this.options.radius = this.userOptions.radius; }
    if(typeof this.userOptions.placeType !== 'undefined') { this.options.placeType = this.userOptions.placeType; }
    if(typeof this.userOptions.maxPlaces !== 'undefined') { this.options.maxPlaces = this.userOptions.maxPlaces; }

    if(typeof this.userOptions.progressiveSearch !== 'undefined') { this.options.progressiveSearch = this.userOptions.progressiveSearch; }
  };

  Places.prototype.getPlaces = function(options) {
    var self = this;

    $.getJSON( API_URL + this.buildQueryParams(),
    function( data ) {

      if(data.length < options.initialPlaces && options.radius < 3000 && options.progressiveSearch) {
        self.expandSearchRadius(data, options);
      } else {

        if(data.length === 0) {
          self.error();
        } else {
          self.success(data, options);
        }

      }

    });
  };

  Places.prototype.buildQueryParams = function() {
    return '?' +
           'latitude=' + this.options.latitude + '&' +
           'longitude=' + this.options.longitude + '&' +
           'radius=' + this.options.radius + '&' +
           'type=' + this.options.placeType + '&' +
           'maxplaces=' + this.options.maxPlaces + '&' +
           'minPrice=' + '0' + '&' +
           'maxPrice=' + '4';
  };

  Places.prototype.expandSearchRadius = function(data, options) {
    if(options.radius >= 300) {
      options.radiusIncrement = 100;
    }
    if(options.radius >= 1000) {
      options.radiusIncrement = 500;
    }

    this.getPlaces(
      {
        latitude: options.latitude,
        longitude: options.longitude,
        radius: parseInt(options.radius) + options.radiusIncrement,
        placeType: options.placeType,
        maxPlaces: parseInt(options.maxPlaces),
        initialPlaces: parseInt(options.initialPlaces),
        dynamicSearch: options.dynamicSearch
      }
    );
  };

  Places.prototype.success = function(data, options) {
    this.restaurants = data;
    this.options.initialPlaces = 0;
    this.options.dynamicSearch = false;

    if(options.dynamicSearch) {
      WOL.app.settings.setRadius(options.radius);
    }

    WOL.app.wheel.setRestaurants(data);
    WOL.app.wheel.draw();
  };

  Places.prototype.error = function(data) {
    WOL.app.lightbox.NoLocationLightbox = new ErrorLocationLightbox();
  };

  return Places;
}());
