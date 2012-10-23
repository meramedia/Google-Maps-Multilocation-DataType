/** 
* TODO: Clean up any prototype code (experimental/old unused)
* TODO: Mark all internal methods with prefix "_"
* TODO: Clean up and remove jquery dependency as much as possible
*           - Remove the need of "find" to speed up things a bit
* TODO: Clean up code copied from other extension (meramedia.Context.SetDefaultLocation)
*/
var LoadedApi = false;
var meramedia = (typeof meramedia == 'undefined' || meramedia == null) ? {} : meramedia;

// Debug settings
meramedia.debug = false;
meramedia.log = (console == undefined || meramedia.debug != undefined && !meramedia.debug ? function (msg) { } : function (msg) { console.log(msg); });
meramedia.warn = (console == undefined || meramedia.debug != undefined && !meramedia.debug ? function (msg) { } : function (msg) { console.warn(msg); });

// Define context
meramedia.Context = (typeof meramedia.Context == 'undefined' || meramedia.Context == null) ? { maps: new Array() } : meramedia.Context;
meramedia.Context.DefaultSearchIcon = "/umbraco/plugins/meramedia.GoogleMap.plugin/searchIcon.png";
meramedia.Context.CurrentMarkerId = 0;
meramedia.Context.SetDefaultLocation = (meramedia.Context.SetDefaultLocation == undefined) ? meramedia.Context.SetDefaultLocation = function (container, map, currentCenter) {
    /* Cloned code from http://our.umbraco.org/projects/backoffice-extensions/google-maps-datatype */
    var DefaultLocation = $('#' + container.id).find('input.mapSettings').val();
    if ( DefaultLocation != null && DefaultLocation != undefined ) {
        DefaultLocation = JSON.parse(DefaultLocation).defaultLocation;
    }

    if (typeof currentCenter != 'undefined' && currentCenter != null && currentCenter.lat() != 0 && currentCenter.lng() != 0) {
        coords = currentCenter;
    }
    else if (DefaultLocation == undefined) {
        coords = new google.maps.LatLng(37.4419, -122.1419);
    }
    else if (DefaultLocation.match(/^\-*[\d\.]+,\-*[\d\.]+,\d+/)) {
        var loc = DefaultLocation.split(',');
        coords = new google.maps.LatLng(parseFloat(loc[0]), parseFloat(loc[1]));
        zoom = parseInt(loc[2]);
    } else if (DefaultLocation.match(/^\-*[\d\.]+,\-*[\d\.]+$/)) {
        var loc = DefaultLocation.split(',');
        coords = new google.maps.LatLng(parseFloat(loc[0]), parseFloat(loc[1]));
    } else {
        coords = new google.maps.LatLng(37.4419, -122.1419);
    }

    map.setCenter(coords);
} : meramedia.Context.SetDefaultLocation;

/*
    Settings for the display of a map.
    Also contains default settings of the map.
*/
function MapSettings() {
    // Mixed settings,
    // information about the map
    this.Markers = null;
    this.MapOptions = {
        zoom: 12,
        center: "0,0",
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    this._Width = null;
    this._Height = null;
    this.MapTypeId = google.maps.MapTypeId.ROADMAP;

    // Settings valid for the frontoffice and backoffice
    this.CoreSettings = {
        AllowCustomLinks: false // Stored to map
    }

    // Settings valid in the backoffice only!
    this.BackOfficeSettings = {
        AllowCustomLinks: false, // Retrieved from backoffice
        MaxMarkers: -1,
        MinMarkers: 0,
        DefaultWidth: 500,
        DefaultHeight: 500,
    };

    // True = movable markers, false = non-movable
    this.UserCustomizable = true;
}

function LocationMarker() {
    this.Name = null; // The name of the marker (custom name entered by the user)
    this.Title = null; // Title of the marker (geographical position)
    this.Position = null; // Position of the marker
    this.Content = null; // TODO: Not currently in use 
    this.Icon = null; // Icon for marker
    this.Link = null; // Link after click on marker on the map
}

// Load map api from Google
function LoadMapsApi(cb) {
    if (!LoadedApi) {
        $.ajax({
            type: "get",
            dataType: "script",
            url: 'http://maps.google.com/maps/api/js',
            data: {
                v: "3.9",
                libraries: 'places',
                sensor: false,
                callback: cb
            },
            error: function () { alert('Could not load Google Maps API'); }
        });
    }
    else {
        meramedia.warn("Already loaded Google Maps api");
        cb();
    }
}

// Creates a Google map with the given identifiers
// _id = id of the map object
// _settings = The map settings object (see class:MapSettings)
// listeners = state listeners (see class:MapStateListener)
// _markerAddOnInitialize Markers as an array [marker, marker] etc.
function GoogleMap( /* String */ _id, /*Object*/ _settings, /*Array*/ listeners, /*Array*/ _markerAddOnInitialize) {
    var self = this; // View hack

    this.settings = _settings;
    if (_settings == undefined || _settings == null)
        this.settings = new MapSettings();

    this.settings.MapOptions.center = new google.maps.LatLng(this.settings.MapOptions.center.split(',')[0], this.settings.MapOptions.center.split(',')[1]);

    // Markers to add on initialization
    this._markerAddOnInitialize = _markerAddOnInitialize;

    // Id of the map object
    this.id = _id;

    // All our search markers
    this.searchMarkers = new Array();

    // Any listeners we have on ourselves
    this.listeners = (listeners == undefined ? [] : listeners);

    // Contains all current markers, set to an empty array if nothing is set in the input
    this.markers = {}; this.numMarkers = 0;

    // Private variables
    this._updatedBounds = false;
    this._initialized = false; // true = initialized the map, false = not initialized yet (need to call .Initialize())
    this.IsInitialized = function () {
        return this._initialized;
    }

    // Zooms the map to fit around the markers that are on the map
    this._ZoomToFit = function () {
        var latlngbounds = new google.maps.LatLngBounds();

        // Fit for regular markers
        for (var key in this.markers) {
            latlngbounds.extend(this.markers[key].getPosition());
        }

        // Fit for search markers
        for (var i = 0; i < this.searchMarkers.length; i++) {
            latlngbounds.extend(this.searchMarkers[i].getPosition());
        }

        // Fit the map to our calculated bounds
        this._updatedBounds = true;
        this.map.fitBounds(latlngbounds);
    };
    this.ZoomToFit = this._ZoomToFit;

    // Remove a marker from the map
    // [marker] = Google marker
    // [isSearchMarker] = true/false depending if the marker is a search marker or regular marker
    this.RemoveMarker = function (marker, isSearchMarker) {
        meramedia.log("[GoogleMaps] Removing marker " + marker.id + " from map");
        if (typeof isSearchMarker == 'undefined' || isSearchMarker == null || !isSearchMarker) {
            delete this.markers[marker.id];

            for (var i = 0; i < self.listeners.length; i++) {
                self.listeners[i].MarkerRemovedEvent(self, marker);
            }

            self.numMarkers--;
        }
        else {
            // Search marker, nothing for me to do here!
        }

        marker.setMap(null);
    };

    // Creates a search marker with a given position, title and map
    // [position] = latlng
    // [title] = string, optional
    this.CreateSearchMarker = function (position, title) {
        var searchMarker = this.CreateMarker(
            position,
            null,
            title,
            {
                clickable: true,
                draggable: false,
                position: position,
                title: (title == null ? "" : title),
                visible: true,
                zIndex: 100,
                icon: meramedia.Context.DefaultSearchIcon
            },
            false
        );

        // Add marker to map
        searchMarker.setMap(this.map);

        // Add marker to our internal list
        this.searchMarkers.push(searchMarker);

        // Right click -> Gets added to list
        google.maps.event.addListener(searchMarker, 'rightclick', function () {
            self.CreateMarker(searchMarker.getPosition(), null, searchMarker.getTitle());
            self.RemoveMarker(searchMarker, true);
        });
    };

    // Remove all search markers from the map
    this._ClearSearchMarkers = function () {
        for (var i = 0; i < this.searchMarkers.length; i++) {
            if (this.searchMarkers != null)
                this.searchMarkers[i].setMap(null);
        }

        this.searchMarkers = new Array();
    };

    // Create a new marker on the map
    this.CreateMarker = function (position, name, title, _markerOptions, addToMap) {
        meramedia.log("[GoogleMaps] Creating marker " + name);

        var markerOptions = null;
        if (typeof addToMap == 'undefined' || addToMap == null) addToMap = true;
        if (typeof _markerOptions == 'undefined' || _markerOptions == null) {
            markerOptions = {
                clickable: true,
                draggable: true,
                position: position,
                title: (title == null ? "" : title),
                visible: true,
                zIndex: 10
            };
        }
        else {
            markerOptions = _markerOptions;
        }

        // Set title correctly
        if (name != undefined && name != null ? name + "\n" : "") {
            markerOptions.title = name + "\n" + (title == undefined || title == null ? (_markerOptions != null ? _markerOptions.title : "") : title);
        }

        // Create our marker
        var tempMarker = new google.maps.Marker(markerOptions);
        tempMarker.id = this._GetMarkerId();
        tempMarker.name = name;
        tempMarker._title = title;

        // Check if we want to add it to our map
        if (addToMap) {
            meramedia.log("[GoogleMaps] Adding marker to the map");
            if (self.settings.MaxMarkers != -1 && self.numMarkers >= self.settings.MaxMarkers) {
                alert("You may only add " + self.numMarkers + " markers to the map");
                return null;
            }

            // Put it on our map
            tempMarker.setMap(this.map);
            // Add it so we can find it again 
            for (var i = 0; i < self.listeners.length; i++) {
                self.listeners[i].MarkerCreatedEvent(self, tempMarker);
            }

            this.RegisterMarkerEvents(tempMarker);

            self.numMarkers++;
            self.markers[tempMarker.id] = tempMarker;
        }
        else {
            meramedia.warn("[GoogleMap] Skipping the process of adding the marker to the map");
        }

        return tempMarker;
    }

    // Rerender the map 
    this.Rerender = function (_mapOptions) {
        meramedia.log("[GoogleMap] Re-rendering the map...");
        this.Initialize(true, _mapOptions);
    };

    // Register marker events
    this._RegisterMarkerEvents = function (marker) {
        google.maps.event.addListener(marker, 'rightclick', function () {
            self.RemoveMarker(marker);
        });

        google.maps.event.addListener(marker, 'dragend', function (e) {
            for (var i = 0; i < self.listeners.length; i++) {
                self.listeners[i].MarkerUpdatedEvent(self, marker);
            }
        });
    };
    this.RegisterMarkerEvents = this._RegisterMarkerEvents;

    // Register base events that we will always need, even if the map is not user customizable
    this.RegisterBaseEvents = function () {
        google.maps.event.addListenerOnce(self.map, 'bounds_changed', function (event) {
            if (self.numMarkers == 1 && self._updatedBounds) {
                self._updatedBounds = false;
                self.map.setZoom(10);
            }
        });
    };

    // Register events on the map
    this._RegisterEvents = function () {
        // Bind our events
        google.maps.event.addListener(self.map, 'rightclick', function (e) {
            self.CreateMarker(e.latLng, null, null);
        });

        google.maps.event.addListener(self.map, 'center_changed', function (e) {
            for (var i = 0; i < self.listeners.length; i++) {
                self.listeners[i].StateChangeEvent(self, "center_changed");
            }
        });

        google.maps.event.addListener(self.map, 'zoom_changed', function (e) {
            for (var i = 0; i < self.listeners.length; i++) {
                self.listeners[i].StateChangeEvent(self, "zoom_changed");
            }
        });

        google.maps.event.addListener(self.map, 'maptypeid_changed', function (e) {
            for (var i = 0; i < self.listeners.length; i++) {
                self.listeners[i].StateChangeEvent(self, "maptypeid_changed");
            }
        });
    };
    this.RegisterEvents = this._RegisterEvents;

    // Set the user customizable option. If not customizable we will not
    // be able to move markers etc. Will not register any new events on markers
    this.SetUserCustomizable = function (setUserCustomizable) {
        meramedia.warn("[GoogleMaps] Settings UserCustomizable to " + setUserCustomizable);
        if (setUserCustomizable) {
            this.RegisterEvents = this._RegisterEvents;
            this.RegisterMarkerEvents = this._RegisterMarkerEvents;
        }
        else {
            meramedia.warn("[GoogleMaps] Unbinding RegisterEvents and RegisterMarkerEvents");
            this.RegisterEvents = function () { }
            this.RegisterMarkerEvents = function () {
            }
        }
    };

    // Initializes the Google map
    this.Initialize = function (rerender, _mapOptions) {
        meramedia.log("[GoogleMaps] Initializing map");

        if (rerender == null || rerender == undefined)
            rerender = false;

        meramedia.log("[GoogleMaps] Rerender: " + rerender);

        // Skip initialization if we already are past this
        if (this.IsInitialized() && !rerender) {
            meramedia.log("[GoogleMaps] Skipping initialization, already intialized!");
            return;
        }

        if (rerender) {
            meramedia.log("[GoogleMaps] Re-rendering map");
            self.settings.MapOptions = _mapOptions;
        }

        // set customizable setting
        this.SetUserCustomizable(this.settings.UserCustomizable);

        // The active google map
        this.map = new google.maps.Map(document.getElementById(this.id), this.settings.MapOptions);

        this.RegisterEvents(); // Events in back
        this.RegisterBaseEvents(); // Events in front/back

        // Set initialized flag so that we don't initialize again
        self._initialized = true;

        // If we are not re-rendering we must notify all listeners that our initialization process is done
        // This must be done before the adding of the markers!
        if (!rerender) {
            meramedia.log("[GoogleMaps] Notifying listeners about initalization DONE!");
            for (var i = 0; i < self.listeners.length; i++) {
                self.listeners[i].MapInitializedEvent(self);
            }
        }

        // Add markers
        if (!rerender && this._markerAddOnInitialize != null && this._markerAddOnInitialize != undefined) {
            meramedia.log("[GoogleMaps] Adding markers to map from mapSettings");

            // Fetch markers from saved content
            $.each(this._markerAddOnInitialize, function () {
                meramedia.log("[GoogleMaps] Creating marker at position " + this.Position);
                var marker = self.CreateMarker(
                    null,
                    (this.Name == undefined ? null : this.Name),
                    null,
                    {
                        clickable: true,
                        draggable: self.settings.UserCustomizable,
                        position: new google.maps.LatLng(this.Position.split(',')[0], this.Position.split(',')[1]),
                        title: (this.Title == null ? "" : this.Title),
                        visible: true,
                        icon: (this.Icon == undefined) ? null : this.Icon,
                        zIndex: 10,
                        link: (this.Link == undefined ? null : this.Link)
                    }
                );

                meramedia.log("[GoogleMaps] (" + marker.id + ") Created marker");

                // Marker link
                //marker.link = ;
                marker.party = "Hello world";

                // Should we move this to some other place and create two separate functions.
                // However we should try and separate all backoffice and front settings...
                // 1. Backoffice settings
                // 2. Front settings
                google.maps.event.addListener(marker, 'click', function () {
                    for (var i = 0; i < self.listeners.length; i++) {
                        self.listeners[i].MarkerLeftClickEvent(self, marker);
                    }
                });
            });
        }
    }

    // Returns an unique marker id..
    this._GetMarkerId = function () {
        return meramedia.Context.CurrentMarkerId++;
    }
};