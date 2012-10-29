/**
 * A listener that listens for events that are occurring on the Google Map on our backoffice interface.
 * The events will then result in an updated interface. This is to separate the GUI from the Google Map.
 *
 * You may create custom listeners as long as they implement all event methods marker Event below.
 */
function MapStateListener() {
    var self = this;

    /* Event */
    this.MapInitializedEvent = function (mapObject) {
    	/// <summary>
    	/// Map initialization event
    	/// </summary>
    	/// <param name="mapObject" type="GoogleMap">The map object</param>
        this._ClearMap(mapObject);

        // Set the graphical parts of the lsit
        mapObject.markerList = $(mapObject.container).find('[id^=markerList]');

        // Set location
        meramedia.Context.SetDefaultLocation(mapObject.container, mapObject.map, mapObject.settings.MapOptions.center);

        // Bind Google autocomplete search
        var input = $(mapObject.container).find('input.place')[0];
        var autocomplete = new google.maps.places.Autocomplete(input);

        autocomplete.bindTo('bounds', mapObject.map);

        // Bind search button
        var map = mapObject.map;
        $(mapObject.container).find('input.search').click(function (e) {
            e.preventDefault();

            // Register search button
            var searchTerm = $(mapObject.container).find('input.place').val();
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({ 'address': searchTerm }, function (data, status) {
                // Remove old search markers
                mapObject._ClearSearchMarkers();

                if (status == google.maps.GeocoderStatus.OK) {
                    $.each(data, function () {
                        var result = this;
                        var title = result.formatted_address;
                        var position = result.geometry.location;

                        mapObject.CreateSearchMarker(position, title);
                    });

                    mapObject._ZoomToFit();
                }
            });
        });

        //// Bind height/width values
        //$(mapObject.container).find('input.mapWidth, input.mapHeight').keyup(function () {
        //    self._UpdateSaveValue(mapObject);
        //});
    };

    /* Event */
    this.StateChangeEvent = function (mapObject) {
    	/// <summary>
    	/// State changed event
    	/// </summary>
        /// <param name="mapObject" type="GoogleMap">The map object</param>
    };

    /* Event */
    this.MarkerDragedEvent = function (mapObject, marker) {
    	/// <summary>
    	/// Marker draged event
    	/// </summary>
    	/// <param name="mapObject" type="GoogleMap">The map object</param>
    	/// <param name="marker" type="google.maps.Marker">The draged marker</param>
        this.MarkerUpdatedEvent(mapObject, marker);
    };

    /* Event */
    this.MarkerAddedEvent = function (mapObject, marker) {
    	/// <summary>
    	/// Event called when a marker is added to the map
    	/// </summary>
    	/// <param name="mapObject" type="GoogleMap">The map</param>
    	/// <param name="marker" type="google.maps.Marker">The marker that was added to the map</param>
        this._AddMarkerTolist(mapObject, marker);
    };

    /* Event */
    this.MarkerRemovedEvent = function (mapObject, marker) {
        // Update storage value
        //this._UpdateSaveValue(mapObject);

        // Remove from list
        marker.container.remove();
    };

    /* Event */
    this.MarkerUpdatedEvent = function (mapObject, marker) {
        // Update marker location value
        this._UpdateMarkerLocationValue(mapObject, marker);

        // Update storage value
        //this._UpdateSaveValue(mapObject);

        // TODO: Update any other stuff needed
    };

    /* Event */
    this.RerenderBeginEvent = function (mapObject) {
        this._UpdateSaveValue(mapObject);
    };

    this.RerenderFinishedEvent = function (mapObject) {
        
    };

    /* Event */
    this.MarkerLeftClickEvent = function (mapObject, marker) {
        // Do nothing atm
    };

    /* Event */
    this.MarkerCreatedEvent = function (mapObject, marker) {
        // Add the marker to the list of added markers
        this._AddMarkerTolist(mapObject, marker);

        // Find position value
        this._UpdateMarkerLocationValue(mapObject, marker);
    };

    /* Internal method */
    this._UpdateMarkerLocationValue = function (mapObject, marker) {
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({ 'location': marker.getPosition() }, function (data, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (data.length > 0) {
                    var result = data[0];

                    var title = result.formatted_address;
                    if (marker.name != undefined && marker.name != null) {
                        title = marker.name + "\n" + title;
                    }

                    marker._title = result.formatted_address;
                    marker.setTitle(title);
                    marker.container.find('span.position').html(result.formatted_address);

                    //self._UpdateSaveValue(mapObject);
                }
                else {
                    marker.container.find('span.position').html(marker.getPosition());
                }
            }
        });
    };

    /* Internal method */
    this._AddMarkerTolist = function (mapObject, marker2) {
        var map = mapObject.map;
        var markerId = marker2.id;

        var markerList = [];

        var val = $(mapObject.container).find('.markerValueList').val();
        if (val != '' && val != undefined) {
            markerList = $.parseJSON(val);
        }

        // Create our list element
        // TODO: Maybe move this somewhere outside javascript in the future?
        var element = ('<li id="google-marker-' + markerId + '">' +
                            '<div class="name">' +
                                '<div class="label">' +
                                    '<label for="marker_' + markerId + '_name">Marker name</label>' +
                                        '<p>Specific name for the location, ex. "H&auml;lsans hus"</p>' +
                                '</div>' +
                                '<div>' +
                                    '<input type="text" name="marker_' + markerId + '_name" value="' + (marker2.name != undefined && marker2.name != null ? marker2.name : '') + '">' +
                                '</div>' +
                            '</div>' +
                            (mapObject.settings.BackOfficeSettings.AllowCustomLinks ? 
                            '<div class="link">' +
                                '<div class="label">' + 
                                    '<label for="marker_' + markerId + '_link">External link</label>' +
                                '</div>' +
                                '<div>' +
                                    '<input type="text" name="marker_' + markerId + '_link" value="' + (marker2.link != null ? marker2.link : '') + '">' +
                                '</div>' +
                            '</div>'
                            : '') +
                            //(mapObject.settings.BackOfficeSettings.AllowCustomContent ?
                            //'<div class="link">' +
                            //    '<div class="label">' +
                            //        '<label for="marker_' + markerId + '_content">Popup content</label>' +
                            //    '</div>' +
                            //    '<div>' +
                            //        '<input type="text" name="marker_' + markerId + '_content" value="' + (marker2.content != null ? marker2.content : '') + '">' +
                            //    '</div>' +
                            //'</div>'
                            //: '') +
                            '<div>' +
                                '<div class="label">' +
                                    '<label for="marker_' + markerId + '_position">Position</label>' +
                                '</div>' +
                                '<div>' +
                                    '<a class="changePosition" title="Click to go to marker" id="' + markerId + '" data-position="' + marker2.getPosition().lat() + "," + marker2.getPosition().lng() + '" href="#" title="Remove marker from map">' +
                                        '<span class="position">' + marker2.getPosition() + '</span>' +
                                    '</a>' +
                                '</div>' +
                            '</div>' +
                            '<div>' +
                                '<div class="label">' +
                                    '<label for="marker_' + markerId + '_icon">Marker icon</label>' +
                                '</div>' +
                                '<div>' +
                                    '<select class="dropdownSource" name="marker_' + markerId + '_icon">' +
                                        '<option selected="selected" value="default">Default</option>');

        var selectedIcon = null;
        for (var i = 0; i < markerList.length; i++) {
            element += '<option value=' + markerList[i].id + '>' + markerList[i].url + '</option>';
            if (markerList[i].url == marker2.getIcon())
                selectedIcon = markerList[i].id;
        }

        element += '</select><span class="iconPreview"></span>' +
                                    '<dl class="dropdownTarget dropdown"></dl>' +
                                '</div>' +
                            '</div>' +
                            '<a class="removeMarker" href="#"></a>' +
                        '</li>';

        var markerHtml = $(element);

        // Set name
        markerHtml.find('#marker_' + markerId).val(marker2.name);

        // Set preview icon
        if (marker2.getIcon() != null)
            markerHtml.find('span.iconPreview').html('<img src="' + marker2.getIcon() + '"/>');

        // Bind events
        markerHtml.find('a.changePosition').click(function (e) {
            e.preventDefault();
            map.setCenter(marker2.getPosition());

            // Animate to show which one is selected
            marker2.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function () { marker2.setAnimation(null); }, 1000);
        });

        // Remove marker click
        markerHtml.find('a.removeMarker').click(function (e) {
            e.preventDefault();
            mapObject.RemoveMarker(marker2);
        });

        // Change in name value
        markerHtml.find('input[name=marker_' + markerId + '_name]').keyup(function () {
            marker2.name = $(this).val();
        });

        // Change in link value
        markerHtml.find('input[name=marker_' + markerId + '_link]').keyup(function () {
            marker2.link = $(this).val();
        });

        // Only register event if we really need it
        if (mapObject.HasRegisteredUpdate == undefined || !mapObject.HasRegisteredUpdate)
        {
            $('input[class*=editorIcon]').click(function () {
                self._UpdateSaveValue(mapObject);
            });

            mapObject.HasRegisteredUpdate = true; // TODO: Move to a better "location"
        }
        

        if (selectedIcon != null) {
            //console.log(markerHtml.find('.dropdownSource').children('option[value=' + selectedIcon + ']'));
            markerHtml.find('.dropdownSource').children('option:selected').attr('selected', false);
            markerHtml.find('.dropdownSource').children('option[value=' + selectedIcon + ']').attr('selected', true);
        }

        // Dropdown menu, replaces the preview icon on every value change
        markerHtml.find('.dropdownSource').change(function () {
            var value = $(this).val();
            var iconImage = $(this).find('option[value=' + value + ']').html();

            if (value == "default")
                marker2.setIcon(null);
            else
                marker2.setIcon(iconImage);

            if (marker2.getIcon() == null)
                $(this).parent().children('span.iconPreview').html("");
            else
                $(this).parent().children('span.iconPreview').html('<img src="' + iconImage + '"/>');

            // Update internal values
            //self._UpdateSaveValue(mapObject);
        });

        mapObject.markers[markerId] = marker2;
        mapObject.markerList.append(markerHtml);

        marker2.container = markerHtml;

        //self._UpdateSaveValue(mapObject);
    };

    this.ForceSaveSettingsEvent = function (mapObject) {
        this._UpdateSaveValue(mapObject);
    };

    /* Internal method */
    this._UpdateSaveValue = function (mapObject) {
        var temp = [];
        var map = mapObject.map;
        var mapSettings = new MapSettings();
        mapSettings.MapOptions.zoom = map.getZoom();
        mapSettings.MapOptions.center = map.getCenter().lat() + "," + map.getCenter().lng();
        mapSettings.MapOptions.mapTypeId = map.getMapTypeId();
        mapSettings._Width = $(mapObject.container).find('input.mapWidth').val();
        mapSettings._Height = $(mapObject.container).find('input.mapHeight').val();
        
        mapSettings.CoreSettings.AllowCustomLinks = mapObject.settings.BackOfficeSettings.AllowCustomLinks;

        for (var key in mapObject.markers) {
            var marker = mapObject.markers[key];
            var obj = new LocationMarker();
            obj.Position = marker.getPosition().lat() + "," + marker.getPosition().lng();
            obj.Title = marker._title; //marker.getTitle();
            obj.Icon = (marker.getIcon() == undefined || marker.getIcon == null) ? null : marker.getIcon();
            obj.Name = marker.name;
            obj.Link = marker.link;
            temp.push(obj);
        }

        mapSettings.Markers = temp;

        var val = $.getJSON(mapSettings);
        $(mapObject.container).find('input[id*=hiddenLocations_]').attr('value', val);
    }

    // Clear map before re-rendering
    // [mapObject] = The map object to clear for
    this._ClearMap = function (mapObject) {
        // Clear mapobject markerlist
        if (mapObject.markerList != undefined) {
            mapObject.markerList.html('');
        }
    };
}

function StartApplication() {
    // Extensions 
    google.maps.Marker.CurrentMarkerId = 0;

    // Application
    $('div.gmapContainer').each(function () {
        var id = $('div.map', this).attr('id');

        // Contains "backoffice" settings
        var settings = $(this).find('input.mapSettings').val();

        // Contains our saved markers etc.
        var content = $(this).find('input.hiddenLocations').val();

        //console.log(content);
        if (content != null && content != '') {
            content = $.parseJSON(content);
        }
        else {
            content = new MapSettings();
        }

        // Set our backoffice settings
        content.BackOfficeSettings = $.parseJSON(settings);

        // Create the map
        meramedia.Context.maps[id] = new GoogleMap(
            id,
            content,
            [new MapStateListener(this)],
            (content == null ? null : content.Markers)
        );

        meramedia.Context.maps[id].container = this;
    });

    // Render only visible map
    var activeTab = $('.tabOn');
    var activeTabContent = $("#" + activeTab.attr('id') + "layer").find('.map');
    activeTabContent.ready(function () {
        for (var i = 0; i < activeTabContent.length; i++) {
            var activeId = $(activeTabContent[i]).attr('id');
            meramedia.Context.maps[activeId].Initialize();
        }
    });

    // Check tab browsing
    $('a').click(function () {
        var id = $(this).attr('id');
        if (id && id.indexOf('TabView') > -1) {
            id = id.replace(/^(.*\_tab\d+).*$/, "$1") + 'layer';

            $('#' + id).each(function () {
                $('div.map', this).each(function () {
                    var id = jQuery(this).attr('id');
                    var mapObject = meramedia.Context.maps[id];

                    if (!mapObject.IsInitialized()) {
                        mapObject.Initialize();
                    } else {
                        // Force rerender from listeners
                        mapObject.ForceSave();

                        var mapSettings = $(mapObject.container).find('input.hiddenLocations').attr('value');

                        if (mapSettings != undefined && mapSettings != null && mapSettings != '') {
                            mapSettings = $.parseJSON(mapSettings);
                        }
                        else {
                            mapSettings = new MapSettings();
                        }

                        // Fetch re-render markers
                        var content = $(mapObject.container).find('input.hiddenLocations').val();
                        if (content != null && content != '') {
                            content = $.parseJSON(content);
                        }

                        //if (content.Markers != undefined) {
                        //    meramedia.log("[GoogleMap] Rerendering with " + content.Markers.length + " markers");
                        //}

                        mapObject.Rerender({
                            zoom: mapSettings.MapOptions.zoom,
                            center: new google.maps.LatLng(mapSettings.MapOptions.center.split(',')[0], mapSettings.MapOptions.center.split(',')[1]),
                            mapTypeId: mapSettings.MapOptions.mapTypeId
                        }, (content.Markers != undefined ? content.Markers : null));
                    }
                });
            });
        }
    });
}

// Starting the application for the backoffice
$(function () {
    LoadMapsApi('StartApplication');
});