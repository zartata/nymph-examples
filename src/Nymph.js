/*
Nymph 0.0.1alpha nymph.io
(C) 2014 Hunter Perrin
license LGPL
*/
// Uses AMD or browser globals for jQuery.
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as a module.
        define('Nymph', ['jquery', 'NymphOptions', 'Promise'], factory);
    } else {
        // Browser globals
        factory(jQuery, NymphOptions, Promise);
    }
}(function($, NymphOptions, Promise){
	var sortProperty = null,
		sortParent = null,
		sortCaseSensitive = null,
		arraySortProperty = function(a, b){
			var property = sortProperty;
			var parent = sortParent;
			var notData = property === "guid" || property === "cdate" || property === "mdate";
			if (parent !== null && ((a.data[parent] instanceof Entity && typeof (notData ? a.data[parent][property] : a.data[parent].data[property]) !== "undefined") || (b.data[parent] instanceof Entity && typeof (notData ? b.data[parent][property] : b.data[parent].data[property]) !== "undefined"))) {
				if (!sortCaseSensitive && typeof (notData ? a.data[parent][property] : a.data[parent].data[property]) === "string" && typeof (notData ? b.data[parent][property] : b.data[parent].data[property]) === "string") {
					var aprop = (notData ? a.data[parent][property] : a.data[parent].data[property]).toUpperCase();
					var bprop = (notData ? b.data[parent][property] : b.data[parent].data[property]).toUpperCase();
					if (aprop !== bprop)
						return aprop.localeCompare(bprop);
				} else {
					if ((notData ? a.data[parent][property] : a.data[parent].data[property]) > (notData ? b.data[parent][property] : b.data[parent].data[property]))
						return 1;
					if ((notData ? a.data[parent][property] : a.data[parent].data[property]) < (notData ? b.data[parent][property] : b.data[parent].data[property]))
						return -1;
				}
			}
			// If they have the same parent, order them by their own property.
			if (!sortCaseSensitive && typeof (notData ? a[property] : a.data[property]) === "string" && typeof (notData ? b[property] : b.data[property]) === "string") {
				var aprop = (notData ? a[property] : a.data[property]).toUpperCase();
				var bprop = (notData ? b[property] : b.data[property]).toUpperCase();
				return aprop.localeCompare(bprop);
			} else {
				if ((notData ? a[property] : a.data[property]) > (notData ? b[property] : b.data[property]))
					return 1;
				if ((notData ? a[property] : a.data[property]) < (notData ? b[property] : b.data[property]))
					return -1;
			}
			return 0;
		};

	Nymph = {
		// The current version of Nymph.
		version: "0.0.1alpha",

		// === Class Variables ===

		restURL: null,

		// === Events ===

		init: function(NymphOptions){
			this.restURL = NymphOptions.restURL;
			return this;
		},

		// === Methods ===

		newUID: function(name){
			var that = this;
			return new Promise(function(resolve, reject){
				$.ajax({
					type: 'PUT',
					url: that.restURL,
					dataType: 'text',
					data: {'action': 'uid', 'data': name},
					success: function(data) {
						resolve(data);
					},
					error: function(jqXHR, textStatus, errorThrown){
						reject({jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown});
					}
				});
			});
		},

		getUID: function(name){
			var that = this;
			return new Promise(function(resolve, reject){
				$.ajax({
					type: 'GET',
					url: that.restURL,
					dataType: 'text',
					data: {'action': 'uid', 'data': name},
					success: function(data) {
						resolve(data);
					},
					error: function(jqXHR, textStatus, errorThrown){
						reject({jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown});
					}
				});
			});
		},

		deleteUID: function(name){
			var that = this;
			return new Promise(function(resolve, reject){
				$.ajax({
					type: 'DELETE',
					url: that.restURL,
					data: {'action': 'uid', 'data': name},
					success: function(data) {
						resolve(data);
					},
					error: function(jqXHR, textStatus, errorThrown){
						reject({jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown});
					}
				});
			});
		},

		saveEntity: function(entity){
			var that = this;
			return new Promise(function(resolve, reject){
				$.ajax({
					type: entity.guid == null ? 'PUT' : 'POST',
					url: that.restURL,
					dataType: 'json',
					data: {'action': 'entity', 'data': JSON.stringify(entity)},
					success: function(data) {
						if (typeof data.guid !== "undefined" && data.guid > 0) {
							resolve(entity.init(data));
						} else {
							reject({textStatus: "Server error"});
						}
					},
					error: function(jqXHR, textStatus, errorThrown){
						reject({jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown});
					}
				});
			});
		},

		getEntity: function(){
			var that = this, args = arguments;
			return new Promise(function(resolve, reject){
				that.getEntityData.apply(that, args).then(function(data){
					if (data != null) {
						resolve(that.initEntity(data));
					} else {
						resolve(null);
					}
				}, function(errObj){
					reject(errObj);
				});
			});
		},

		getEntityData: function(){
			var that = this,
				args = arguments;
			return new Promise(function(resolve, reject){
				$.ajax({
					type: 'GET',
					url: that.restURL,
					dataType: 'json',
					data: {'action': 'entity', 'data': JSON.stringify(args)},
					success: function(data) {
						if (typeof data.guid !== "undefined" && data.guid > 0) {
							resolve(data);
						} else {
							resolve(null);
						}
					},
					error: function(jqXHR, textStatus, errorThrown){
						reject({jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown});
					}
				});
			});
		},

		getEntities: function(){
			var that = this,
				args = arguments;
			return new Promise(function(resolve, reject){
				$.ajax({
					type: 'GET',
					url: that.restURL,
					dataType: 'json',
					data: {'action': 'entities', 'data': JSON.stringify(args)},
					success: function(data) {
						resolve($.map(data, that.initEntity));
					},
					error: function(jqXHR, textStatus, errorThrown){
						reject({jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown});
					}
				});
			});
		},

		initEntity: function(entityJSON){
			var entity;
			if (typeof entityJSON.class === "string" && typeof window[entityJSON.class] !== "undefined" && typeof window[entityJSON.class].prototype.init === "function") {
				entity = new window[entityJSON.class]();
			} else if (typeof require !== 'undefined' && require('Nymph'+entityJSON.class).prototype.init === "function") {
				entity = new require('Nymph'+entityJSON.class)();
			} else {
				throw new NymphClassNotAvailableError(entityJSON.class+" class cannot be found.")
			}
			return entity.init(entityJSON);
		},

		deleteEntity: function(entity, plural){
			var that = this;
			return new Promise(function(resolve, reject){
				$.ajax({
					type: 'DELETE',
					url: that.restURL,
					dataType: 'json',
					data: {'action': plural ? 'entities' : 'entity', 'data': JSON.stringify(entity)},
					success: function(data) {
						resolve(data);
					},
					error: function(jqXHR, textStatus, errorThrown){
						reject({jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown});
					}
				});
			});
		},

		deleteEntities: function(entities){
			return this.deleteEntity(entities, true);
		},


		psort: function(array, property, parentProperty, caseSensitive, reverse) {
			// Sort by the requested property.
			if (typeof property !== "undefined") {
				sortProperty = property;
				sortParent = parentProperty;
				sortCaseSensitive = (caseSensitive == true);
				array.sort(arraySortProperty);
			}
			if (reverse)
				array.reverse();
			return array;
		},
		sort: function(array, property, caseSensitive, reverse) {
			// Sort by the requested property.
			if (typeof property !== "undefined") {
				sortProperty = property;
				sortParent = null;
				sortCaseSensitive = (caseSensitive == true);
				array.sort(arraySortProperty);
			}
			if (reverse)
				array.reverse();
			return array;
		}
	};

	NymphClassNotAvailableError = function(message){
		this.name = 'NymphClassNotAvailableError';
		this.message = message;
		this.stack = (new Error()).stack;
	};
	NymphClassNotAvailableError.prototype = new Error;

	return Nymph.init(NymphOptions);
}));
