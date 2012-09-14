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
    this.Zoom = 12;
    this.Center = "0,0";
    this._Width = null;
    this._Height = null;
    this.MapTypeId = google.maps.MapTypeId.ROADMAP;
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
function GoogleMap( /* String */_id, /* Map options */_mapOptions, /*Object*/_settings, /*Array*/listeners, /*Array*/ _markerAddOnInitialize) {
    var self = this;
    this.mapOptions = null;
    if (typeof _mapOptions == 'undefined' || _mapOptions == null) {
        this.mapOptions = {
            zoom: 8,
            center: new google.maps.LatLng(0, 0),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
    }
    else {
        this.mapOptions = _mapOptions;
    }

    this.settings = (typeof _settings == 'undefined' || _settings == null) ? new MapSettings() : _settings;
    this._markerAddOnInitialize = _markerAddOnInitialize;

    this.id = _id;
    this.searchMarkers = new Array();

    this.listeners = (listeners == undefined ? [] : listeners);

    // Contains all current markers, set to an empty array if nothing is set in the input
    this.markers = {};
    this.numMarkers = 0;

    this._updatedBounds = false;
    this._initialized = false;

    this.IsInitialized = function () {
        return this._initialized;
    }

    this._ZoomToFit = function () {
        var latlngbounds = new google.maps.LatLngBounds();
        for (var key in this.markers) {
            latlngbounds.extend(this.markers[key].getPosition());
        }

        for (var i = 0; i < this.searchMarkers.length; i++) {
            latlngbounds.extend(this.searchMarkers[i].getPosition());
        }

        // Fit the map to our calculated bounds
        this._updatedBounds = true;
        this.map.fitBounds(latlngbounds);
    };

    this.ZoomToFit = this._ZoomToFit;

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

        searchMarker.setMap(this.map);
        this.searchMarkers.push(searchMarker);

        // Right click -> Gets added to list
        google.maps.event.addListener(searchMarker, 'rightclick', function () {
            self.CreateMarker(searchMarker.getPosition(), null, searchMarker.getTitle());
            self.RemoveMarker(searchMarker, true);
        });
    };

    this._ClearSearchMarkers = function () {
        for (var i = 0; i < this.searchMarkers.length; i++) {
            if (this.searchMarkers != null)
                this.searchMarkers[i].setMap(null);
        }

        this.searchMarkers = new Array();
    };

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

    this.Rerender = function (_mapOptions) {
        this.Initialize(true, _mapOptions);
    };

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

    this.RegisterBaseEvents = function () {
        google.maps.event.addListenerOnce(self.map, 'bounds_changed', function (event) {
            if (self.numMarkers == 1 && self._updatedBounds) {
                self._updatedBounds = false;
                self.map.setZoom(10);
            }
        });
    };

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

    this.Initialize = function (rerender, _mapOptions) {
        if (rerender == null || rerender == undefined)
            rerender = false;

        if (this.IsInitialized() && !rerender)
            return;

        if (rerender) {
            self.mapOptions = _mapOptions;
        }

        // The active google map
        this.map = new google.maps.Map(document.getElementById(this.id), this.mapOptions);

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
                        draggable: true,
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

    this._GetMarkerId = function () {
        return meramediaGoogleMaps.Context.CurrentMarkerId++;
    }
};