/// <reference path="libs/google.maps.d.ts" />
/// <reference path="libs/jquery.d.ts" />
/// <reference path="meramedia.googlemaps.Core.ts"/>
/// <reference path="meramedia.googlemaps.GoogleMap.ts"/>
/// <reference path="meramedia.googlemaps.interfaces.d.ts" />
module Meramedia.GoogleMaps {
    export class BackofficeMarker extends Marker {
        constructor() {
            super();
        }
    }

    export class BackOfficeRenderer implements IMapStateListener {
        /// <summary>
        /// Handles the backoffice listening and rendering process
        /// </summary>

        /// <summary>
        /// All maps that this renderer is managing (every map on every tab)
        /// </summary>
        private Maps: { };
        private SearchMarkers: { };

        /// <summary>
        /// The current popup menu, only 1 menu as you may only display one map at 
        /// a time with the popup on it.
        /// </summary>
        private Menu: JQuery;

        private InfoWindow: google.maps.InfoWindow;

        private GeoCoder : google.maps.Geocoder;

        constructor () {
            this.Maps = {};
            this.SearchMarkers = {};
        }

        Start() {
            /// <summary>
            /// Start the rendering process
            /// </summary>
            var ghost = this;

            L.Log("Intialization performed, continuing rendering", this);
            
            // Create a geocoder for looking up adresses
            this.GeoCoder = new google.maps.Geocoder();

            $('.gmapContainer').each(function () {
                // Retrieve map object id
                var mapId = $('.map', this).attr('id');

                // Retrieve backoffice settings
                var settings = $(this).find('input.mapSettings').val();
                var content = $(this).find('input.hiddenLocations').val();

                L.Log("Rendering is set with settings", this, content);

                var renderSettings: RenderSettings = null;
                if (typeof content === "undefined" || String.IsNullOrEmpty(content)) {
                    renderSettings = new RenderSettings(mapId, new MapSettings());
                }
                else {
                    renderSettings = new RenderSettings(mapId, JSON.parse(content));
                }

                ghost.Maps[mapId] = new GoogleMap(renderSettings, [ghost]);
            });

            // Render only visible maps
            var activeTabId = $('.tabOn').attr('id'); // Current tab
            var activeTabContent = $("#" + activeTabId + "layer").find('.map');
            activeTabContent.ready(function () {
                for (var i = 0; i < activeTabContent.length; i++) {
                    var id = $(activeTabContent[i]).attr('id');
                    L.Log("Rendering active map", id);

                    var map = (<GoogleMap>ghost.Maps[id]);
                    if (typeof map !== 'undefined' && map != null) {
                        map.Initialize();
                    }
                }
            });

            // Bind our tab browsing so that we will re-render maps on browsing tabs
            // This fixes issues with browsers not rendering hidden iframes properly
            this.BindTabBrowsing();
        }

        private BindTabBrowsing(): void {
            /// <summary>
            /// Bind the tab browsing to re-initialize maps when the user
            /// browse between tabs
            /// </summary>
            var ghost = this;
            $('a[id*=TabView]').click(function () {
                console.log("Clicked tab view");
                var id = $(this).attr('id').replace(/^(.*\_tab\d+).*$/, "$1") + 'layer';
                $('#' + id).find('.map').each(function () {
                    var mapId = $(this).attr('id');
                    var map: IMap = <IMap>ghost.Maps[mapId];

                    if (typeof map !== 'undefined' && map != null) {
                        // Check if the map object is already initialized
                        if (!map.IsInitialized()) {
                            L.Log("Initializing map", ghost, mapId);
                            map.Initialize();
                        }
                        else {
                            // Re-render the map
                            L.Log("Re-rendering the map", ghost, mapId);
                            // TODO: Force save of the map
                            // TODO: Re-render the map
                        }
                    }
                    return null;
                });
            });
        }

        RerenderDoneEvent(map: GoogleMap) {

        }

        InitializationDoneEvent(map: GoogleMap): void {
            // Activate autocomplete searchbar
            var ghost = this;
            var container = map.MapContainer().parentsUntil('.gmapContainer').parent();
            var input = container.find('input.place')[0];
            var autocomplete = new google.maps.places.Autocomplete(<HTMLInputElement>input);
            autocomplete.bindTo('bounds', map.State.Map);

            // Bind search button
            var searchButton = container.find('input.search');
            searchButton.click(function (e) {
                e.preventDefault();
                ghost.ClearSearchMarkers();
                var button = $(this);
                button.hide();

                var searchTerm = $(this).siblings('.place').val();
                ghost.GeoCoder.geocode({ 'address': searchTerm }, function (data, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        $.each(data, function () {
                            var result = this;
                            var title = result.formatted_address;
                            var position = result.geometry.location;

                            // Add a searchmarker to the map
                            var searchMarker = new BackofficeMarker();
                            searchMarker.SetTitle(title);
                            searchMarker.SetMapsPosition(position);
                            searchMarker.SetIcon("/umbraco/plugins/meramedia.GoogleMap.plugin/searchIcon.png");
                            map.AddMarker(searchMarker, false, false);

                            // Add the marker to our temporary list as 
                            // there is no other managing of these markers as they are temporary markers
                            ghost.AddSearchMarker(searchMarker);

                            // TODO: Bind click event
                        });
                    }
                    button.show();
                }); 
            });

            var searchArea = container.find('input.place');
            searchArea.keypress(function (e) {
                if(e.keyCode == 13) {
                  e.preventDefault();
                  searchButton.triggerHandler('click');
                  return false;
                }
            });
        }

        MarkerAddedEvent(map: GoogleMap, marker: BackofficeMarker): void {
            // TODO: This method ended up getting quite bloated. Should be cleaned up a bit.
            var ghost = this;
            var mapWrapper = map.MapContainer();
            var MarkerUpdatedEvent = function () {
                ghost.Save(map);

                // Update address on move
                ghost.GeoCoder.geocode({ 'address': marker.Position }, function (data, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        if (data.length > 0) {
                            item.find('.position a').html(data[0].formatted_address);
                        }
                    }
                });
            };

            marker.ValueUpdatedEvent = MarkerUpdatedEvent;
            marker.RightClickEvent = function (_, googleMarker, e) {
                var list = $('<ul><li class="add_marker_content">Edit content</li><li class="remove_marker">Remove marker</li></ul>');
                var popup = $('<div class="markerPopup"></div>').append(list).append('<div class="markerArrow"></div>');

                list.children('.add_marker_content').click(function () {
                    ghost.RemoveMenu();

                    if (typeof ghost.InfoWindow !== 'undefined') {
                        ghost.InfoWindow.close();
                    }

                    // Create the textarea for the information
                    var wrapper = $('<div>');
                    var textarea = $('<textarea id="marker_content"></textarea>');
                    textarea.val(H.IfDefined(marker.Content, String.Empty));
                    textarea.keyup(function () {
                        marker.Content = $(this).val();
                        ghost.Save(map);
                    });
                    wrapper.append(textarea).append('<br/><small style="clear:both;">HTML is allowed</small>');

                    // Create the infowindow with the textarea we created earlier
                    ghost.InfoWindow = new google.maps.InfoWindow({
                        content: wrapper.get(0)
                    });
                    ghost.InfoWindow.open(map.State.Map, googleMarker);
                });

                list.children('.remove_marker').click(function () {
                    ghost.RemoveMenu();
                    map.RemoveMarker(marker);
                });

                list.children().last()
                    .hover(function () {
                        $(this).parentsUntil('.markerPopup').siblings('.markerArrow').addClass('active');
                    }, function () {
                        $(this).parentsUntil('.markerPopup').siblings('.markerArrow').removeClass('active');
                    });

                ghost.ReplaceMenu(map, popup);

                var pos = ghost.ToPixelPosition(map, googleMarker);
                popup.css('left', pos.x - 2);
                popup.css('top', pos.y - list.outerHeight() - 30);
            };
            marker.DragEndEvent = MarkerUpdatedEvent;

            // Create the marker list entry
            L.Log("Creating marker item for user list", this);
            var mainWrapper = mapWrapper.parentsUntil('.gmapContainer').parent();
            var item = this.CreateMarkerListItem(map, mainWrapper, marker);
            mainWrapper.find('.markerList').append(item);
            item.show();

            // Update the position to a name instead if possible
            ghost.GeoCoder.geocode({ 'address': marker.Position }, function (data, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (data.length > 0) {
                        item.find('.position a').html(data[0].formatted_address);
                    }
                }
            });

            //// Update the icon
            //// Dropdown menu, replaces the preview icon on every value change
            //markerHtml.find('.dropdownSource').change(function () {
            //    var value = $(this).val();
            //    var iconImage = $(this).find('option[value=' + value + ']').html();

            //    if (value == "default")
            //        marker2.setIcon(null);
            //    else
            //        marker2.setIcon(iconImage);

            //    if (marker2.getIcon() == null)
            //        $(this).parent().children('span.iconPreview').html("");
            //    else
            //        $(this).parent().children('span.iconPreview').html('<img src="' + iconImage + '"/>');

            //    // Update internal values
            //    //self._UpdateSaveValue(mapObject);
            //});
        }

        private CreateMarkerListItem(map: GoogleMap, wrapper: JQuery, marker: BackofficeMarker): JQuery {
            var ghost = this;
            // Add marker to the marker list
            var markerItem = wrapper.find('.markerItemDummy').clone();
            markerItem.removeClass('markerItemDummy').addClass('markerItem');
            markerItem.attr('id', 'marker-' + marker.Id);
            markerItem.show();
            
            markerItem.find('.name').html(marker.Name);

            // Bind events
            markerItem.find('.fakeLink.settings').click(function (e) {
                e.preventDefault();
                var dialog = markerItem.find('.settingsDialog');

                if (!dialog.is(':visible')) {
                    $(this).html($(this).attr('data-visible'));
                } else {
                    $(this).html($(this).attr('data-hidden'));
                }
                dialog.toggle('blind');
            });

            markerItem.find('.fakeLink.remove').click(function (e) {
                e.preventDefault();
                map.RemoveMarker(marker);
            });

            // Populate the marker item
            markerItem.find('[name=name]').keyup(function () {
                markerItem.find('.name').html($(this).val());
                marker.Name = $(this).val();
                marker.Update(true);
                ghost.Save(map);
            }).val(marker.Name);
            
            markerItem.find('[name=link]').keyup(function() {
                console.log("updating link", $(this).val());
                marker.Link = $(this).val();
                marker.Update(true);
                ghost.Save(map);
            }).val(marker.Link);

            markerItem.find('.position a').html(marker.Position);
            markerItem.find('.position a').click(function (e) {
                e.preventDefault();
                map.State.Map.setCenter(marker.LatLngPosition());
            });

            return markerItem;
        }

        private ToPixelPosition(map: GoogleMap, marker: google.maps.Marker): google.maps.Point {
            return map.State.Projection.fromLatLngToContainerPixel(marker.getPosition());
        }

        MarkerRemovedEvent(map: GoogleMap, marker: BackofficeMarker): void {
            // Remove marker from the list
            var mainWrapper = map.MapContainer().parentsUntil('.gmapContainer').parent();
            mainWrapper.find('.markerList #marker-' + marker.Id).remove();
            this.Save(map);
        }

        StateChangedEvent(map: GoogleMap, state: STATE_CHANGE, e?: any): void {
            var ghost = this;
            var event: google.maps.UIEvent = e;

            this.RemoveMenu().Save(map);
            switch (state) {
                case STATE_CHANGE.MAP_RIGHT_CLICK:
                    // On right click we will display a popup box where the user may
                    // add new markers.
                    // FUTURE: May add some more options here?
                    var list = $('<ul><li class="add_marker_action" data-position="' + e.latLng.lat() + ',' + e.latLng.lng() + '">Add marker here</li></ul>');
                    list.children('.add_marker_action').click(function () {
                        var position = $(this).attr('data-position');
                        ghost.RemoveMenu();

                        // Add marker to map
                        var marker = new Marker();
                        marker.Position = e.latLng.lat() + "," + e.latLng.lng();
                        marker.Clickable = marker.Draggable = true;

                        map.AddMarker(marker);
                        ghost.Save(map);
                    }).hover(function () {
                        $(this).parentsUntil('.markerPopup').siblings('.markerArrow').addClass('active');
                    }, function () {
                        $(this).parentsUntil('.markerPopup').siblings('.markerArrow').removeClass('active');
                    });

                    this.Menu = $('<div class="markerPopup"></div>').append(list).append('<div class="markerArrow"></div>');
                    map.MapContainer().append(this.Menu);

                    // Minor touches to move the menu to a more pleasing position
                    this.Menu.css('left', event.pixel.x - 5);
                    this.Menu.css('top', event.pixel.y - list.height() - 10);
                    break;
                case STATE_CHANGE.MAP_LEFT_CLICK:
                    break;
            }

            ghost.Save(map);
        }

        private ReplaceMenu(map: GoogleMap, newMenu: JQuery): BackOfficeRenderer {
            this.RemoveMenu();
            this.Menu = newMenu;
            map.MapContainer().append(this.Menu);

            return this;
        }

        private RemoveMenu(): BackOfficeRenderer {
            /// <summary>
            /// Removes "add marker" popup menu from the map
            /// </summary>
            if (typeof this.Menu !== 'undefined' && this.Menu != null) {
                this.Menu.remove();
                this.Menu = null;
            }
            return this;
        }

        private AddSearchMarker(marker: BackofficeMarker): void {
            this.SearchMarkers[marker.Id] = marker;
        }

        private RemoveSearchMarker(marker: BackofficeMarker): void {
            marker.MapsMarker().setMap(<google.maps.Map>null);
            this.SearchMarkers[marker.Id].remove();
        }

        private ClearSearchMarkers(): void {
            for(var marker in this.SearchMarkers) {
                if (H.IsDefined(marker)) {
                    var m: BackofficeMarker = this.SearchMarkers[marker];
                    m.MapsMarker().setMap(<google.maps.Map>null);
                }
            }
            this.SearchMarkers = {};
        }

        private Save(map: GoogleMap): BackOfficeRenderer {
            /// <summary>
            /// Save settings to our input field allowing for the backoffice to save
            /// it to the database
            /// </summary>
            var settings = JSON.stringify(map.State.MapSettings);
            L.Debug("Saving settings", this, settings);
            $("#" + map.State.ContainerId).parentsUntil('.gmapContainer')
                                          .siblings('input.hiddenLocations')
                                          .attr('value', settings);
            return this;
        }
    }
}


$(function () {
    /// <summary>
    /// Initializes our application
    /// The rendering process
    /// </summary>
    $('.helpButton').click(function () {
        $(this).parent('.helpArea').toggleClass('hidden');
    });

    // Toggle controller binding to view/hide areas
    $('.toggleController').click(function (e) {
        e.preventDefault();
        var item = $(this).parent().next();
        if (item.is(':visible')) {
            $(this).html($(this).attr('data-visible'));
        }
        else {
            $(this).html($(this).attr('data-hidden'));
        }
        item.toggle('blind');
    });

    // Initialize the text for all toggle controller links
    $('.toggleController').each(function () {
        if (!$(this).parent().next().is(':visible')) {
            $(this).html($(this).attr('data-visible'));
        }
        else {
            $(this).html($(this).attr('data-hidden'));
        }
        return null;
    });


    function PerformRendering() {
        /// <summary>
        /// Called when the google maps api has finished loading.
        /// Performs the initialization of our renderer
        /// </summary>
        var renderer = new Meramedia.GoogleMaps.BackOfficeRenderer();
        renderer.Start(); // Start our rendering process
    }
    google.maps.event.addDomListener(window, 'load', PerformRendering);
});