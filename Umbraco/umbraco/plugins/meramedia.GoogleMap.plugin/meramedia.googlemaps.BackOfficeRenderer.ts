/// <reference path="libs/google.maps.d.ts" />
/// <reference path="libs/jquery.d.ts" />
/// <reference path="meramedia.googlemaps.Core.ts"/>
/// <reference path="meramedia.googlemaps.GoogleMap.ts"/>
/// <reference path="meramedia.googlemaps.interfaces.d.ts" />
module Meramedia.GoogleMaps {
    export class BackOfficeRenderer implements IMapStateListener {
        /// <summary>
        /// Handles the backoffice listening and rendering process
        /// </summary>

        /// <summary>
        /// All maps that this renderer is managing (every map on every tab)
        /// </summary>
        public Maps: {};//IMap[];

        /// <summary>
        /// The current popup menu, only 1 menu as you may only display one map at 
        /// a time with the popup on it.
        /// </summary>
        private Menu: JQuery;

        private InfoWindow: google.maps.InfoWindow;

        constructor () {
            this.Maps = {};
        }

        Start() {
            /// <summary>
            /// Start the rendering process
            /// </summary>
            var ghost = this;


            L.Log("Intialization performed, continuing rendering", this);
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

        }

        MarkerAddedEvent(map: GoogleMap, marker: Marker): void {
            var ghost = this;
            var MarkerUpdatedEvent = function () {
                ghost.Save(map);
            };
            marker.ValueUpdatedEvent = MarkerUpdatedEvent;
            marker.RightClickEvent = function (m, m2, e) {
                var list = $('<ul><li class="add_marker_content">Add content</li></ul>');
                var popup = $('<div class="markerPopup"></div>').append(list).append('<div class="markerArrow"></div>');
               
                var pos = ghost.GetAslatLng(map, m2);
                
                 popup.css('left',pos.x - 2);
                popup.css('top', pos.y - list.height() - 60);
                console.log(pos);

                list.children('.add_marker_content').click(function () {
                    ghost.RemoveMenu();

                    if (typeof ghost.InfoWindow !== 'undefined') {
                        ghost.InfoWindow.close();
                    }

                    // Create the textarea for the information
                    var textarea = $('<textarea id="marker_content"></textarea>');
                    textarea.val(H.IfDefined(marker.Content, String.Empty));
                    textarea.keyup(function () {
                        marker.Content = $(this).val();
                    });

                    // Create the infowindow with the textarea we created earlier
                    ghost.InfoWindow = new google.maps.InfoWindow({
                        content: textarea.get(0)
                    });
                    ghost.InfoWindow.open(map.State.Map, m2);
                }).hover(function () {
                    $(this).parentsUntil('.markerPopup').siblings('.markerArrow').addClass('active');
                }, function () {
                    $(this).parentsUntil('.markerPopup').siblings('.markerArrow').removeClass('active');
                });
                
                ghost.ReplaceMenu(map, popup);
            };
            marker.DragEndEvent = MarkerUpdatedEvent;
        }

        private GetAslatLng(map: GoogleMap, marker: google.maps.Marker): google.maps.Point {
            return map.State.Projection.fromLatLngToContainerPixel(marker.getPosition());
        }
        
        MarkerRemovedEvent(map: GoogleMap, marker: Marker): void {
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
        var item = $(this).parent().next('.area');
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
        if (!$(this).parent().next('.area').is(':visible')) {
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
