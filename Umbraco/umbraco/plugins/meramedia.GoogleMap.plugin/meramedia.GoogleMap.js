/** 
* TODO: Comment code a bit more descriptive
* TODO: Clean up any prototype code (experimental/old unused)
* TODO: Mark all internal methods with prefix "_"
* TODO: Clean up and remove jquery dependency as much as possible
*           - Remove the need of "find" to speed up things a bit
* TODO: Clean up code copied from other extension (meramediaGoogleMaps.Context.SetDefaultLocation)
*/
var LoadedApi = false;
var meramediaGoogleMaps = (typeof meramediaGoogleMaps == 'undefined' || meramediaGoogleMaps == null) ? {} : meramediaGoogleMaps;

// Define constants
meramediaGoogleMaps.constants = {
    defaultSearchIcon: '/umbraco/plugins/meramedia.GoogleMap.plugin/searchIcon.png'
}

// Define context
meramediaGoogleMaps.Context = (typeof meramediaGoogleMaps.Context == 'undefined' || meramediaGoogleMaps.Context == null) ? { maps: new Array()} : meramediaGoogleMaps.Context; ;
meramediaGoogleMaps.Context.CurrentMarkerId = 0;
meramediaGoogleMaps.Context.SetDefaultLocation = (meramediaGoogleMaps.Context.SetDefaultLocation == undefined) ? meramediaGoogleMaps.Context.SetDefaultLocation = function (container, map, currentCenter) {
    /* Copied code from http://our.umbraco.org/projects/backoffice-extensions/google-maps-datatype */
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
} : meramediaGoogleMaps.Context.SetDefaultLocation;

function MapSettings() {
    this.Markers = null;
    this.MapOptions = {
        zoom: 12,
        center: "0,0",
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this._Width = null;
    this._Height = null;
    this.MapTypeId = google.maps.MapTypeId.ROADMAP;
    
    // True = movable markers, false = non-movable
    this.UserCustomizable = true;
}

function LocationMarker() {
    this.Name = null;
    this.Title = null;
    this.Position = null;
    this.Content = null;
    this.Icon = null;
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
        alert("Already loaded Google Maps api");
        cb();
    }
}

/**
* Creates a Google map with the given identifiers
*
* _markers Markers as a dictionary
*/
function GoogleMap( /* String */_id, /*Object*/_settings, /*Array*/listeners, /*Array*/ _markerAddOnInitialize) {
    var self = this;

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
    this.markers = {};
    this.numMarkers = 0;

    // Private variables
    this._updatedBounds = false;
    this._initialized = false;
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
    this.RemoveMarker = function (marker, isSearchMarker) {
        if (typeof isSearchMarker == 'undefined' || isSearchMarker == null || !isSearchMarker) {
            delete this.markers[marker.id];

            for (var i = 0; i < self.listeners.length; i++) {
                self.listeners[i].MarkerRemovedEvent(self, marker);
            }

            self.numMarkers--;

        }
        else {
            // Search marker
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
                title: title,
                visible: true,
                zIndex: 100,
                icon: meramediaGoogleMaps.constants.defaultSearchIcon
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
        var markerOptions = null;
        if (typeof addToMap == 'undefined' || addToMap == null) addToMap = true;
        if (typeof _markerOptions == 'undefined' || _markerOptions == null) {
            markerOptions = {
                clickable: true,
                draggable: true,
                position: position,
                title: title,
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
            if (self.settings.maxMarkers != -1 && self.numMarkers >= self.settings.maxMarkers) {
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

        return tempMarker;
    }

    // Rerender the map 
    this.Rerender = function (_mapOptions) {
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
        if (setUserCustomizable) {
            this.RegisterEvents = this._RegisterEvents;
            this.RegisterMarkerEvents = this._RegisterMarkerEvents;
        }
        else {
            this.RegisterEvents = function () { }
            this.RegisterMarkerEvents = function () { }
        }
    };

    // Initializes the Google map
    this.Initialize = function (rerender, _mapOptions) {
        if (rerender == null || rerender == undefined)
            rerender = false;

        // Skip initialization if we already are past this
        if (this.IsInitialized() && !rerender)
            return;

        if (rerender) {
            self.settings.MapOptions = _mapOptions;
            //self.mapOptions = _mapOptions;
        }

        // set customizable setting
        this.SetUserCustomizable(this.settings.UserCustomizable);

        // The active google map
        this.map = new google.maps.Map(document.getElementById(this.id), this.settings.MapOptions);

        this.RegisterEvents(); // Events in back
        this.RegisterBaseEvents(); // Events in front/back

        self._initialized = true;

        if (!rerender) {
            for (var i = 0; i < self.listeners.length; i++) {
                self.listeners[i].MapInitializedEvent(self);
            }
        }

        // Add markers
        if (this._markerAddOnInitialize != null && this._markerAddOnInitialize != undefined) {
            // Fetch markers from saved content
            $.each(this._markerAddOnInitialize, function () {
                self.CreateMarker(
                    null,
                    (this.Name == undefined ? null : this.Name),
                    null,
                    {
                        clickable: true,
                        draggable: self.settings.UserCustomizable,
                        position: new google.maps.LatLng(this.Position.split(',')[0], this.Position.split(',')[1]),
                        title: this.Title,
                        visible: true,
                        icon: (this.Icon == undefined) ? null : this.Icon,
                        zIndex: 10
                    }
                );
            });
        }
    }

    // Returns an unique marker id..
    this._GetMarkerId = function () {
        return meramediaGoogleMaps.Context.CurrentMarkerId++;
    }
};