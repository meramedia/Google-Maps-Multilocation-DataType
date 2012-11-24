/// <reference path="../libs/google.maps.d.ts" />
/// <reference path="../libs/jquery.d.ts" />
/// <reference path="googlemap.interfaces.d.ts" />
module Meramedia.GoogleMaps {
    export class Icon implements IMarkerIcon {
        public Id: number;
        public Url: string;

        constructor (obj: any) {
            this.Id = obj.id;
            this.Url = obj.url;
        }
    }

    export class RenderMap extends GoogleMap {
        MarkerList: JQuery;
        SearchMarkers: any;

        constructor(settings: RenderSettings, listeners?: IMapStateListener[]) {
            super(settings, listeners);
            //this.MarkerList = {};
            this.SearchMarkers = {};
        }
        
    }

    export class BackofficeRenderer implements IMapStateListener {
        // GUI list containing markers
        //private MarkerList: any;
        private IconList: any[];
        private Maps: any;

        // Searchmarkers
        private SearchMarkers: any;

        constructor () {
            //this.MarkerList = {};
            this.Maps = {};
            this.IconList = [];
            //this.SearchMarkers = {};
        }

        MapInitializationDoneEvent(map: RenderMap): void {
            //this.ClearMap(map);

            // Set the graphical parts of the lsit
            map.MarkerList = $("#" + map.ContainerId).find('[id^=markerList]');

            //// Set location
            //map.Context.SetDefaultLocation(map.container, map.map, map.settings.MapOptions.center);

            // Bind Google autocomplete search
            var $mapContainer = $("#" + map.ContainerId);
            var $container = this.GetContainer(map.ContainerId);
            var input = $container.find('input.place')[0];
            var autocomplete : google.maps.places.Autocomplete = new google.maps.places.Autocomplete(input);
            autocomplete.bindTo('bounds', map.GoogleMap);

            // Bind search button
            var ghost = this;
            $container.find('input.search').click(function (e) {
                e.preventDefault();

                // Remove old search markers
                ghost.ClearSearchMarkers(map);

                // Find the location (name)
                var searchTerm = $container.find('input.place').val();
                var geocoder = new google.maps.Geocoder();
                geocoder.geocode({ 'address': searchTerm }, function (data, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        $.each(data, function () {
                            var location: Marker = new Meramedia.GoogleMaps.Marker();
                            location.Title = this.formatted_address;
                            location.Position = this.geometry.location.Ya + "," + this.geometry.location.Za;
                            location.Icon = "/umbraco/plugins/meramedia.GoogleMap.plugin/searchIcon.png";
                            map.CreateMarker(location);
                            ghost.SearchMarkers[location.Id] = location;

                            // Bind event on the search marker
                            google.maps.event.addListener(location.GoogleMarker, 'rightclick', function () {
                                // Remove the search marker
                                ghost.RemoveSearchMarker(location, map);
                                google.maps.event.clearListeners(location.GoogleMarker, 'rightclick');

                                // Add marker as regular marker
                                location.Icon = null;
                                map.CreateMarker(location);
                            });
                        });

                        // Zoom to fit so we can see all search markers
                        map.ZoomToFit();
                    }
                });
            });
        }

        StateChangedEvent(map: RenderMap, event?: string): void {

        }

        LocationCreatedEvent(map: RenderMap, location: Marker): void {

        }

        ForcedSaveEvent(map: RenderMap): void {

        }

        MarkerRemovedEvent(map: RenderMap, marker: Marker): void {

        }

        MarkerCreatedEvent(map: RenderMap, marker: Marker): void {
            this.UpdateMarkerLocationValue(map, marker);
            this.AddMarkerToList(map, marker);
        }

        MarkerUpdatedEvent(map: RenderMap, marker: Marker): void {
            this.UpdateMarkerLocationValue(map, marker);
        }

        /* 
            Remove all search markers
        */
        private ClearSearchMarkers(map: RenderMap): void {
            for (var key in this.SearchMarkers) {
                map.RemoveMarker(this.SearchMarkers[key]);
                delete this.SearchMarkers[key];
            }
        }

        /*
            Remove a single search marker
        */
        private RemoveSearchMarker(marker: Marker, map: RenderMap): void {
            map.RemoveMarker(marker);
            delete this.SearchMarkers[marker.Id];
        }

        private GetContainer(containerId: string): any {
            return $(this.Maps[containerId].container);
        }

        private GetMarkerContainer(marker: Marker): any {
            return $('#marker_' + marker.Id);
        }

        /* 
            Clear map before re-rendering
        */
        private ClearMap(map: RenderMap) {
            // Clear mapobject markerlist
            var markerList = map.MarkerList;
            if (markerList != undefined) {
                markerList.html('');
            }
        }

        /*
            Add a marker to the UI list.
            TODO: Rewrite this and separate the different actions a bit
        */
        private AddMarkerToList(map: RenderMap, marker: Marker) : void {
            var googleMap: google.maps.Map = map.GoogleMap;
            var markerId = marker.Id;

            // Create a new list element
            var element = ('<li id="google-marker-' + markerId + '">' +
                            '<div class="name">' +
                                '<div class="label">' +
                                    '<label for="marker_' + markerId + '_name">Marker name</label>' +
                                        '<p>Specific name for the location, ex. "H&auml;lsans hus"</p>' +
                                '</div>' +
                                '<div>' +
                                    '<input type="text" name="marker_' + markerId + '_name" value="' + (marker.Name != undefined && marker.Name != null ? marker.Name : '') + '">' +
                                '</div>' +
                            '</div>' +
                            (map.AllowCustomLinks ? 
                            '<div class="link">' +
                                '<div class="label">' + 
                                    '<label for="marker_' + markerId + '_link">External link</label>' +
                                '</div>' +
                                '<div>' +
                                    '<input type="text" name="marker_' + markerId + '_link" value="' + (marker.Link != null ? marker.Link : '') + '">' +
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
                                    '<a class="changePosition" title="Click to go to marker" id="' + markerId + '" data-position="' + marker.Position + '" href="#" title="Remove marker from map">' +
                                        '<span class="position">' + marker.Position + '</span>' +
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

                            for (var key = 0; key < this.IconList[map.ContainerId].length; key++) {
                                var icon = this.IconList[map.ContainerId][key];
                                element += '<option value="' + icon.Id + '"' + (marker.Icon == icon.Url ? ' selected="true"' : '' ) + '>' + icon.Url + '</option>';
                            }

                            element += '</select>' + 
                                        '<span class="iconPreview"></span>' +
                                        '<dl class="dropdownTarget dropdown"></dl>' +
                                    '</div>' +
                                '</div>' +
                                '<a class="removeMarker" href="#"></a>' +
                            '</li>';

            // Fetch marker list
            if (!Helpers.IsDefined(map.MarkerList)) {
                map.MarkerList = this.GetContainer(map.ContainerId).find('[id^=markerList]');
            }

            var markerList = map.MarkerList.append(element);

            // Bind events
            markerList.find('a.changePosition').click(function (e) {
                e.preventDefault();
                map.GoogleMap.setCenter(marker.LatLngPosition);

                // Animate to show which one is selected
                marker.GoogleMarker().setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function () { marker.GoogleMarker().setAnimation(null); }, 1400);
            });
        }

        /* 
            Updates the location value of a marker
        */
        private UpdateMarkerLocationValue(map: RenderMap, marker: Marker) : void {
            var geocoder = new google.maps.Geocoder();
            var ghost = this;
            geocoder.geocode({ 'address': null, 'location': marker.LatLngPosition }, function (data, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (data.length > 0) {
                        var result = data[0];
                        marker.Title = result.formatted_address;
                        marker.UpdateMarkerOptions();

                        // Get the marker container
                        ghost.GetMarkerContainer(marker).find('span.position').html(result.formatted_address);
                        // TODO: Update save values
                        // TODO: Update marker list
                    }
                    else {
                        ghost.GetMarkerContainer(marker).find('span.position').html(marker.Position);
                    }
                }
            });
        };

        StartApplication(): void {
            var ghost = this;

            // Application
            $('div.gmapContainer').each(function () {
                var containerId = $('div.map', this).attr('id');

                // Retrieve all iconlists
                // Get the icon list
                var val = $(this).find('input.markerValueList').val();
                if (!Helpers.IsNullOrEmpty(val)) {
                    var iconList: Icon[] = new Icon[];
                    var list = JSON.parse(val);
                    for (var i = 0; i < list.length; i++) {
                        iconList.push(new Icon(list[i]));
                    }
                    ghost.IconList[containerId] = iconList;
                }

                // Contains backoffice settings
                var settings = JSON.parse($(this).find('input.mapSettings').val());

                // Contains saved markers etc.
                var content = JSON.parse($(this).find('input.hiddenLocations').val());

                // Settings
                if (!Helpers.IsDefined(content)) {
                    content = new MapSettings();
                }
                else {
                    content.CoreSettings = settings;
                }

                var renderSettings: RenderSettings = new RenderSettings(containerId, content, true);
                var map: GoogleMap = new GoogleMap(renderSettings, [ghost]);
                ghost.Maps[containerId] = { map: map, container: this };
                map.Initialize();

                //var id = $('div.map', this).attr('id');

                //// Contains "backoffice" settings
                //var settings = $(this).find('input.mapSettings').val();

                //// Contains our saved markers etc.
                //var content = $(this).find('input.hiddenLocations').val();

                ////console.log(content);
                //if (content != null && content != '') {
                //    content = JSON.parse(content);
                //}
                //else {
                //    content = new MapSettings();
                //}

                //// Set our backoffice settings
                //content.BackOfficeSettings = JSON.parse(settings);

                //// Create the map
                //maps[id] = new GoogleMap(
                //    content,
                //    [new BackofficeRenderer()]
                //);

                ////meramedia.Context.maps[id].container = this;

                return null;
            });

            //// Render only visible map
            //var activeTab = $('.tabOn');
            //var activeTabContent = $("#" + activeTab.attr('id') + "layer").find('.map');
            //activeTabContent.ready(function () {
            //    for (var i = 0; i < activeTabContent.length; i++) {
            //        var activeId = $(activeTabContent[i]).attr('id');
            //        meramedia.Context.maps[activeId].Initialize();
            //    }
            //});
        }
    }

    // Starting the application for the backoffice
    $(function () {
        LoadMapsApi('StartApplication');
    });
}

function StartApplication() {
    var renderer = new Meramedia.GoogleMaps.BackofficeRenderer();
    renderer.StartApplication();
}