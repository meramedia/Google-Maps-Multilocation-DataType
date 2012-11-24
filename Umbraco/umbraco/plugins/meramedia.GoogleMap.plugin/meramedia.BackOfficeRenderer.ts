/// <reference path="../../../TypeScript/Google/google.maps.d.ts" />
/// <reference path="../../../TypeScript/Bing/Microsoft.Maps.All.d.ts" />
/// <reference path="../../../TypeScript/JQuery/jquery.d.ts" />
/// <reference path="libs/meramedia.maps.d.ts" />
/// <reference path="meramedia.Helpers.d.ts"/>
/// <reference path="meramedia.GoogleMap.d.ts"/>
/// <reference path="meramedia.BingMap.d.ts"/>
module Meramedia.Backoffice {
    export interface IMapConnection {
        AddEventListener(object: any, event: string, e: (event: any) => void) : any;
    }

    //#region GoogleMap
	export class BackofficeMarker extends GoogleMaps.Marker {
        constructor () {
            super();
        }
    }
	
    export class GoogleBackofficeMap extends GoogleMaps.GoogleMap {
        private MarkerList: UI.Markers.MarkerList;
        private SearchBar: UI.SearchBar;
        private MapsMenu: UI.MapMenu;

        constructor (settings: GoogleMaps.RenderSettings, listeners?: Maps.IMapStateListener[]) {
            super(settings, listeners);

            Context.Initialize();

            this.MarkerList = new UI.Markers.MarkerList(this);
            this.AddListener(this.MarkerList);
        }

        public Initialize(): void;
        public Initialize(mapOptions?: GoogleMaps.MapOptions): void {
            super.Initialize(mapOptions);

            this.SearchBar = new UI.SearchBar(this);
            this.MapsMenu = new UI.MapMenu(this);
        }
    }

    export class GoogleMapConnection implements IMapConnection {
        AddEventListener(object: google.maps.Marker, event: string, e: (event: any) => void ): any;
        AddEventListener(object: google.maps.Map, event: string, e: (event: any) => void ): any;
        AddEventListener(object: any, event: string, e: (event: any) => void ): any {
            if (object instanceof google.maps.Marker) {
                google.maps.event.addListener(<google.maps.Marker>object, event, e);
            } else if (object instanceof google.maps.Map) {
                google.maps.event.addListener(<google.maps.Map>object, event, e);
            }
        }
    }
    //#endregion

    ////#region Bing
	//export class BingBackofficeMarker extends BingMaps.BingMarker {
    //    constructor () {
    //        super();
    //    }
    //}

    //export class BingBackofficeMap extends BingMaps.BingMap {
    //    constructor () {
    //        super();
    //    }
    //}

    //export class BingMapConnection implements IMapConnection {
    //    AddEventListener(object: any, event: string, e: (event: any) => void ): any {
    //        return null;
    //    }
    //}
    ////#endregion

    export class BaseManager {
        private static _instances: { } = {};
        public static Instance(mapObj: any): IMapConnection {
            var key = "undefined";
            //if (mapObj instanceof BingBackofficeMap || mapObj instanceof BingBackofficeMarker) {
            //    key = "Bing";
            //} else if (mapObj instanceof GoogleBackofficeMap || mapObj instanceof BackofficeMarker) {
                key = "Google";
            //}

            if (!Helpers.H.IsDefined(_instances[key])) {
                //switch (key) {
                    //case "Bing":
                    //    _instances[key] = new BingMapConnection();
                    //    break;
                    //case "Google":
                        _instances[key] = new GoogleMapConnection();
                        //break;
                //}            
            }
            return _instances[key];
        }
    }

    export class Context {
        public static Geocoder: google.maps.Geocoder;

        public static Initialize(): void {
            if ($.isEmptyObject(Context.Geocoder)) {
                Context.Geocoder = new google.maps.Geocoder();
            }
        }

        //private static GetPixelPosition(map: BingBackofficeMap, marker: BackofficeMarker): any;
        private static GetPixelPosition(map: GoogleBackofficeMap, marker: BackofficeMarker): google.maps.Point {
        //private static GetPixelPosition(map: any, marker: any): any {
            //if (map instanceof BingBackofficeMap) {
            //    return null;
            //} else if (map instanceof GoogleBackofficeMap) {
                return map.GetState().Projection.fromLatLngToContainerPixel(marker.LatLngPosition());
            //}
            //throw new Helpers.InvalidArgumentException("Only Bing and Google maps are allowed");
        }
    }

    export module UI {
        export class GeneralSettings {
            private SettingsWrapper: JQuery;
            
            constructor (map: GoogleMaps.GoogleMap) {
                this.SettingsWrapper = map.GetMapWrapper().closest('.gmapContainer').find('.area.generalSettings');
            }

            public Show(): void {
                this.SettingsWrapper.show();
            }

            public Hide(): void {
                this.SettingsWrapper.hide();
            }
        }

        export class PopupMenu implements Maps.IMapStateListener {
            private static MenuWrapper: JQuery;
            private static Menu: JQuery;
            private Map: GoogleBackofficeMap;

            constructor (map: GoogleBackofficeMap) {
                var ghost = this;
                PopupMenu.MenuWrapper = $('<div class="markerPopup"></div>');
                PopupMenu.Menu = $('<ul></ul>');
                PopupMenu.MenuWrapper.append(PopupMenu.Menu)
                                     .append('<div class="markerArrow"></div>');
                this.Map = map;
                this.Map.AddListener(this);
            }

            public Clear(): void {
                this.Hide();
                this.Remove();
            }

            private Remove(): void {
                PopupMenu.Menu.children().remove();
            }

            public Add(text: string, clickAction: (e: JQueryEventObject) => void): void {
                var item = $('<li>');
                item.html(text)
                    .click(clickAction);
                PopupMenu.Menu.append(item);
            }

            public Display(x:number, y: number, xDiff: number = 0, yDiff: number = 0 ): void {
                this.Map.GetMapWrapper().append(PopupMenu.MenuWrapper);

                PopupMenu.MenuWrapper.show();
                PopupMenu.MenuWrapper.css('left', x + xDiff);
                PopupMenu.MenuWrapper.css('top', (y - PopupMenu.MenuWrapper.height()) + yDiff);
                PopupMenu.Menu.children('li').last().hover(
                    function () {
                        $(this).closest('.markerPopup')
                               .children('.markerArrow')
                               .addClass('active');
                    }, function () {
                        $(this).closest('.markerPopup')
                               .children('.markerArrow')
                               .removeClass('active');
                    }
                );
            }

            public Hide(): void {
                PopupMenu.MenuWrapper.hide();
            }

            public StateChangedEvent(map: Maps.IMap, state: Maps.Core.STATE_CHANGE, e?: any): void {
                this.Clear();
            }

            //#region Unused methods
            public RerenderDoneEvent(map: Maps.IMap): void {}
            public InitializationDoneEvent(map: Maps.IMap): void {}
            public MarkerAddedEvent(map: Maps.IMap, marker: Maps.IMapsMarker): void {}
            public MarkerRemovedEvent(map: Maps.IMap, marker: Maps.IMapsMarker): void {}
            //#endregion
        }

        export class SearchMarkerList {
            private Markers: Maps.IMapsMarker[];
            private Menu: PopupMenu;
            private Map: Maps.IMap;

            constructor(map: GoogleBackofficeMap) {
                this.Markers = [];
                this.Menu = new PopupMenu(map);
                this.Map = map;
            }

            public ClearMenu(): void {
                this.Menu.Hide();
                this.Menu.Clear();
            }

            public Add(marker: Maps.IMapsMarker) {
                this.Markers.push(marker);

                // Bind click event
                var ghost = this;
                BaseManager.Instance(marker).AddEventListener(marker.MapsMarker(), 'rightclick', function(e) {
                //google.maps.event.addListener(marker.MapsMarker(), 'rightclick', function (e) {
                    ghost.Menu.Clear();

                    ghost.Menu.Add("Replace with marker", function (e) {
                        ghost.Menu.Hide();

                        var newMarker = new BackofficeMarker();
                        newMarker.SetClickable(true);
                        newMarker.SetDraggable(true);
                        newMarker.SetMapsPosition(marker.LatLngPosition());
                        ghost.Map.AddMarker(newMarker);
                        ghost.RemoveMarker(marker);
                    });
                    var pixelPosition = Context.GetPixelPosition(ghost.Map, marker);
                    ghost.Menu.Display(pixelPosition.x, pixelPosition.y, 0, -20);
                });
            }

            public RemoveMarker(marker: Maps.IMapsMarker) {
                for (var i = 0; i < this.Markers.length; i++) {
                    if (this.Markers[i] == marker) { 
                        //this.Markers[i].MapsMarker().setMap(<google.maps.Map>null);
                        this.Map.RemoveMarker(marker);
                        this.Markers.splice(i, 1);
                        break;
                    }
                }
            }

            public ClearMarkers(): void {
                for (var i = 0; i < this.Markers.length; i++) {
                    // We don't need to remove it through the map as it's not added to the internal list of the map
                    this.Markers[i].MapsMarker().setMap(<google.maps.Map>null);
                    delete this.Markers[i];
                }
                this.Markers = [];
            }

            public GetMarkers(): Maps.IMapsMarker[] {
                return this.Markers;
            }

            public HideMenu() {
                this.Menu.Hide();
            }
        }

        export class SearchBar {
            private Input: JQuery;
            private Button: JQuery;
            private SearchMarkers: SearchMarkerList;
            private Map: Maps.IMap;
            private Autocomplete: google.maps.places.Autocomplete;

            constructor (map: GoogleBackofficeMap) {
                this.Map = map;

                var dialog = map.GetMapWrapper().closest('.gmapContainer').find('.area.searchDialog');
                this.Input = dialog.find('.place');
                this.Button = dialog.find('input.button');
                this.SearchMarkers = new SearchMarkerList(map);

                var ghost = this;
                // Bind button click
                this.Button.click(function (e) {
                    // TODO: Loadingbar
                    var searchTerm = ghost.Input.val();
                    ghost.SearchMarkers.ClearMenu();
                    ghost.ClearMarkers();

                    var loadingbar = $('<div class="loadingbar"></div>');
                    ghost.Map.GetMapWrapper().append(loadingbar);

                    Context.Geocoder.geocode({ 'address': searchTerm }, function (data, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            $.each(data, function () {
                                var result = this;
                                var title = result.formatted_address;
                                var position = result.geometry.location;

                                // Create a searchmarker and add it to the map
                                var marker = new BackofficeMarker();
                                marker.SetTitle(title);
                                marker.SetMapsPosition(position);
                                marker.SetIcon('/umbraco/plugins/meramedia.GoogleMap.plugin/images/searchIcon.png');
                                marker.SetClickable(true);
                                map.AddMarker(marker, false, false);

                                ghost.SearchMarkers.Add(marker);
                            });
                            ghost.Map.FitMarkerBounds(ghost.SearchMarkers.GetMarkers());
                            var zoom = ghost.Map.GetMap().getZoom();
                            if (zoom > 12) {
                                ghost.Map.GetMap().setZoom(12);
                            }
                        }
                        loadingbar.remove();
                    });
                });

                this.Input.keydown(function (e) {
                    if (e.keyCode == 13) {
                        e.preventDefault();
                        ghost.Button.triggerHandler('click');
                    }
                });

                if ($.isEmptyObject(this.Autocomplete)) {
                    this.Autocomplete = new google.maps.places.Autocomplete(<HTMLInputElement>this.Input.get(0));
                    this.Autocomplete.bindTo('bounds', this.Map.GetMap());
                }
            }

            private ClearMarkers(): void {
                this.SearchMarkers.ClearMarkers();
            }
        }

        export class MapMenu implements Maps.IMapStateListener {
            private PopupMenu: PopupMenu;

            constructor(map: GoogleBackofficeMap) {
                this.PopupMenu = new PopupMenu(map);
                map.AddListener(this);
            }

            public StateChangedEvent(map: Maps.IMap, state: Maps.Core.STATE_CHANGE, e?: any): void { 
                var ghost = this;
                switch (state) {
                    case Maps.Core.STATE_CHANGE.MAP_RIGHT_CLICK:
                        ghost.PopupMenu.Clear();
                        ghost.PopupMenu.Add('Add marker here', function () {
                            ghost.PopupMenu.Hide();
                        
                            var marker = new Marker();
                            marker.SetClickable(true);
                            marker.SetDraggable(true);
                            marker.SetMapsPosition(e.latLng); 
                            map.AddMarker(marker);
                        });
                        ghost.PopupMenu.Display(e.pixel.x, e.pixel.y);
                        break;
                }
            }

            public RerenderDoneEvent(map: Maps.IMap) : void { }
            public InitializationDoneEvent(map: Maps.IMap): void { }
            public MarkerAddedEvent(map: Maps.IMap, marker: Maps.IMapsMarker): void { }
            public MarkerRemovedEvent(map: Maps.IMap, marker: Maps.IMapsMarker): void { }
        }

        export module Markers {
            export class ListItem {
                private Marker: BackofficeMarker;
                private Item: JQuery;
                private List: JQuery;
                private Map: GoogleBackofficeMap;

                constructor (marker: BackofficeMarker, list: JQuery, map: GoogleBackofficeMap) {
                    var ghost = this;
                    this.Marker = marker;
                    this.Map = map;

                    //#region Item creation
                    this.Item = list.closest('.gmapContainer').find('.markerItemDummy').clone();
                    this.Item.removeClass('markerItemDummy').addClass('markerItem');
                    list.append(this.Item);
                    this.Item.show();
                    //#endregion

                    var displayNameField = this.Item.find('div.name');

                    //#region Eventbinding
                    this.Item.find('a.settings').click(function (e) {
                        e.preventDefault();
                        var dialog = $(this).closest('.markerItem')
                                            .children('.settingsDialog');

                        if (dialog.is(':visible')) {
                            $(this).html($(this).attr('data-hidden'));
                        } else {
                            $(this).html($(this).attr('data-visible'));
                        }
                        dialog.toggle();
                    });

                    this.Item.find('a.remove').click(function (e) {
                        e.preventDefault();
                        ghost.Map.RemoveMarker(ghost.Marker);
                    });
                    //#endregion

                    var nameField = this.Item.find('input[name=name]');
                    var linkField = this.Item.find('input[name=link]');

                    //#region Settings updates
                    nameField.keyup(function () {
                        displayNameField.html($(this).val());
                        marker.SetName($(this).val());
                    });

                    linkField.keyup(function () {
                        alert("hello");
                        marker.SetLink($(this).val());
                    });
                    //#endregion

                    //#region Set values
                    nameField.val(marker.GetName())
                             .triggerHandler('keyup');

                    linkField.val(marker.GetLink());
                    //#endregion

                    //#region Update position title
                    var positionField = this.Item.find('.position');
                    var updatePositionValue = function (data, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            if (data.length > 0) {
                                positionField.text(data[0].formatted_address);
                                marker.SetTitle(data[0].formatted_address);
                            } else {
                                positionField.text(marker.GetPosition());
                            }
                        }
                    };
                      
                    Context.Geocoder.geocode({ 'address': marker.GetPosition() }, updatePositionValue);
                    marker.DragEndEvent = function (m, m2, e) {
                        Context.Geocoder.geocode({ 'address': m2.getPosition().toString() }, updatePositionValue); 
                    }
                    //#endregion

                    //#region Icons
                    var iconsString = map.GetMapWrapper().closest('.gmapContainer').find('input.markerIconList').val();
                    var icons = JSON.parse(iconsString);

                    var iconList = this.Item.find('[name=markerIcon]');
                    $.each(icons, function () {
                        var selected = false;
                        if (Helpers.H.IsDefined(marker.GetIcon()) && marker.GetIcon() == this.url) {
                            selected = true;
                        }
                        iconList.append('<option value="' + this.id + '" data-url="' + this.url + '"' + (selected ? 'selected="selected"' : '') + '>' + this.name + '</option>');
                    });
                    //#endregion

                    iconList.change(function (e) {
                        var selected = $(this).children('option:selected');
                        var iconUrl = selected.attr('data-url');

                        if (selected.val() === 'default') {
                            iconUrl = '/umbraco/plugins/meramedia.GoogleMap.plugin/images/default.png';
                            marker.SetIcon(null);
                        } else {
                            marker.SetIcon(iconUrl);
                        }

                        var preview = $(this).siblings('.iconPreview');
                        preview.children().remove();
                        preview.append('<img src="' + iconUrl + '"/>');
                    })
                    .triggerHandler('change');
                }

                public GetMarker() : BackofficeMarker {
                    return this.Marker;
                }

                public Dispose(): void {
                    this.Marker = null;
                    this.Item.remove();
                    delete this;
                }
            }

            export class MarkerList implements Maps.IMapStateListener {
                private ListItems: ListItem[];
                private List: JQuery;
                private Menu: PopupMenu;
                private InfoWindow: google.maps.InfoWindow;
                private ContentEditor: JQuery;
                private ContentEditorWrapper: JQuery;

                constructor (map: GoogleBackofficeMap) {
                    this.ListItems = [];
                    this.Menu = new PopupMenu(map);
                    this.List = map.GetMapWrapper().closest('.gmapContainer').find('.markerList');
                    this.ContentEditor = $('<textarea></textarea>');
                    this.ContentEditorWrapper = $('<div class="infoWindow"></div>');
                    this.ContentEditorWrapper.append(this.ContentEditor);
                    this.ContentEditorWrapper.append('<br/><small style="clear:both;">HTML is allowed</small>');
                    this.InfoWindow = new google.maps.InfoWindow();
                }

                public MarkerAddedEvent(map: GoogleBackofficeMap, marker: BackofficeMarker): void {
                    var ghost = this;
                    var item = new ListItem(marker, this.List, map);
                    this.ListItems.push(item);

                    this.List.siblings('.noMarkersText').hide();

                    marker.RightClickEvent = function(m, mapsMarker, e) {
                        ghost.Menu.Clear();
                        ghost.Menu.Add('Edit content', function () {
                            ghost.Menu.Hide();

                            // Display infowindow
                            ghost.ContentEditor.val(m.GetContent());
                            ghost.ContentEditor.unbind('keyup'); 
                            ghost.ContentEditor.bind('keyup', function () {
                                m.SetContent($(this).val());
                                // TODO: Save?
                            });
                            ghost.InfoWindow.setContent(<HTMLElement>(ghost.ContentEditorWrapper.get(0)));
                            ghost.InfoWindow.open(map.GetMap(), m.MapsMarker());
                        });

                        ghost.Menu.Add('Remove', function () {
                            map.RemoveMarker(m);
                            ghost.Menu.Hide();
                        });

                        var pixelPosition = Context.GetPixelPosition(map, marker);
                        ghost.Menu.Display(pixelPosition.x, pixelPosition.y, 0, -20);
                    };

                    //marker.DragEndEvent = function (m, mapsMarker, e) {
                    //    Context.Geocoder.geocode({ 'address': m.GetPosition() }, function (data, status) {
                    //        if (status == google.maps.GeocoderStatus.OK) {
                    //            if (data.length > 0) {
                    //                marker.SetTitle(data[0].formatted_address);
                    //            }
                    //        }
                    //    });
                    //};
                }
        
                public MarkerRemovedEvent(map: GoogleMaps.GoogleMap, marker: BackofficeMarker): void {
                    // TODO: Remove marker from the list
                    for (var i = 0; i < this.ListItems.length; i++) {
                        var item = this.ListItems[i];
                        if (item.GetMarker().Id === marker.Id) {
                            item.Dispose();
                            this.ListItems.splice(i, 1);
                            break;
                        }
                    }

                    if (this.ListItems.length == 0) {
                        this.List.siblings('.noMarkersText').show();
                    }
                }

                //#region Unused
                public RerenderDoneEvent(map: Maps.IMap) : void {}
                public InitializationDoneEvent(map: Maps.IMap): void {}
                public StateChangedEvent(map: Maps.IMap, state: Maps.Core.STATE_CHANGE, e?: any): void {}
                //#endregion
            }
        }
    }

    export class Initializer {
        private static Maps: { };
        public static Start() {
            Initializer.Maps = {};
            var ghost = Initializer;
            //var renderer = new Renderer();
            $('.gmapContainer').each(function () {
                // Retrieve map object id
                var mapId = $('.map', this).attr('id');
                // Retrieve backoffice settings
                var settings = $(this).find('input.mapSettings').val();
                var content = $(this).find('input.hiddenLocations').val();

                var renderSettings: GoogleMaps.RenderSettings = null;
                if (typeof content === "undefined" || Helpers.String.IsNullOrEmpty(content)) {
                    renderSettings = new GoogleMaps.RenderSettings(mapId, new GoogleMaps.MapSettings());
                } else {
                    renderSettings = new GoogleMaps.RenderSettings(mapId, JSON.parse(content));
                }
                ghost.Maps[mapId] = new GoogleBackofficeMap(renderSettings);
            });

            // Render only visible maps
            var initFunction = function () {
                var activeTabId = $('.tabOn').attr('id'); // Current tab
                var activeTabContent = $("#" + activeTabId + "layer").find('.map');
                for (var i = 0; i < activeTabContent.length; i++) {
                    var id = $(activeTabContent[i]).attr('id');
                    var map = <GoogleMaps.GoogleMap>ghost.Maps[id];
                    if (typeof map !== 'undefined' && map != null) {
                        // Check if the map object is already initialized
                        if (!map.IsInitialized()) {
                            Helpers.L.Log("Initializing map", ghost, id);
                            map.Initialize();
                        }
                        else {
                            // Re-render the map
                            // L.Log("Re-rendering the map", ghost, id);
                            // TODO: Force save of the map
                            // TODO: Re-render the map
                        }
                    }
                }
            };
            $('a[id*=TabView]').click(initFunction);
            initFunction();

            // Save handler
            $('form').submit(function (e) {
                Initializer.Save();
            });
        }

        private static Save(): void {
            for (var key in Initializer.Maps) {
                var map = Initializer.Maps[key];
                var settings = JSON.stringify(map.GetState().MapSettings);
                Helpers.L.Debug("Saving settings", this, settings);
                map.GetMapWrapper().closest('.gmapContainer').children('input.hiddenLocations').val(settings);
            }
        }
    }
}
$(function () {
    $('.helpButton').click(function () {
        $(this).parent('.helpArea').toggleClass('hidden');
    });

    $('.toggleController').click(function (e) {
        e.preventDefault();
        var item = $(this).parent().next();
        if (item.is(':visible')) {
            $(this).html($(this).attr('data-visible'));
        } else {
            $(this).html($(this).attr('data-hidden'));
        }
        item.toggle('blind');
    }).each(function () {
        if (!$(this).parent().next().is(':visible')) {
            $(this).html($(this).attr('data-visible'));
        } else {
            $(this).html($(this).attr('data-hidden'));
        }
    });
    google.maps.event.addDomListener(window, 'load', Meramedia.Backoffice.Initializer.Start); 
});


//module Meramedia.GoogleMaps {
//    export class Menu {
//        private m: JQuery;
        
//        constructor () {
//            this.m = null;
//        }

//        public Show(map?: GoogleMap) {
//            if (this.m != null) {
//                this.m.show();
//                if (H.IsDefined(map)) {
//                    map.GetMapWrapper().append(this.m);
//                }
//            }
//        }

//        public Replace(m: JQuery, map?: GoogleMap): Menu {
//            this.Close(;)
//            this.Remove();
            
//            this.m = m;
//            if (H.IsDefined(map)) {
//                this.Show(map);
//            }
//            return this;
//        }

//        private Remove(): void {
//            if (this.m != null) {
//                this.m.remove();
//                this.m = null;
//            }
//        }

//        public Close() : Menu {
//            if (this.m != null) {
//                this.m.hide();
//            }
//            return this;
//        }
//    }

//    export class MarkerList {
//        public static Lists: { }; // GoogleMap{};
//        private Markers: BackofficeMarker[];

//        constructor () {
//            if (!H.IsDefined(MarkerList.Lists)) {
//                MarkerList.Lists = {};
//            }
//            this.Markers = [];
//        }

//        public Add(marker: BackofficeMarker, map: GoogleMap): MarkerList {
//            var wrapper;
//            if (typeof MarkerList.Lists[map.GetContainerId()] !== 'undefined') {
//                wrapper = MarkerList.Lists[map.GetContainerId()];
//            } else {
//                wrapper = map.GetMapWrapper().closest('.gmapContainer').find('.markerList');
//                MarkerList.Lists[map.GetContainerId()] = wrapper;
//            }
//            return this;
//        }

//        public Remove(marker: BackofficeMarker, map: GoogleMap, index?: number): MarkerList {
//            map.RemoveMarker(marker);
//            if (H.IsDefined(index)) {
//                this.Markers.splice(index, 1);
//            } else {
//                for (var i = 0; i < this.Markers.length; i++) {
//                    this.Remove(this.Markers[i], map, i);
//                }
//            }
//            return this;
//        }

//        public Clear(map: GoogleMap): MarkerList {
//            for (var i = 0; i < this.Markers.length; i++) {
//                this.Remove(this.Markers[i], map, i);
//            }
//            return this;
//        }
//    }

//    export enum MARKER_LIST_EVENT {
//        REMOVE,
//        POSITION
//    }

//    export class MarkerListItem {
//        private ListItem: JQuery;
//        private Map: GoogleMap;
//        private Marker: BackofficeMarker;

//        constructor (marker: BackofficeMarker, map: GoogleMap) {
//            this.Map = map;
//            this.Marker = marker;
//        }

//        public Bind(event: MARKER_LIST_EVENT, x: (event: JQueryEventObject, marker:BackofficeMarker) => void ) {
//            switch (event) {
//                case MARKER_LIST_EVENT.REMOVE:
//                    // Bind remove event
//                    this.ListItem.find('.fakeLink.remove').click(function (event) {
//                        x(event, this.Marker);
//                    });
//                    break;
//                //case MARKER_LIST_EVENT.SETTINGS:
//                //    // Bind settings event
//                //    x(
//                //    //ghost.Map.State.Map.setCenter(ghost.Marker.LatLngPosition());
//                //    //break;
//            }
//        }

//        public AddMarkerToUIList(): JQuery {
//            var ghost = this;

//            // Add marker to the marker list
//            this.ListItem = this._Marker_GenerateListItem(this.Map);
//            this._Marker_PopulateListItem(this.ListItem, this.Marker, this.Map);
//            this._Marker_AddMarkerEvents(this.ListItem, this.Marker, this.Map);
            
//            return this.ListItem;
//        }

//        private _Marker_GenerateListItem(map: GoogleMap): JQuery {
//            var markerItem = map.GetMapWrapper().find('.markerItemDummy').clone();
//            markerItem.removeClass('markerItemDummy').addClass('markerItem');
//            markerItem.show();

//            return null;
//        }

//        private _Marker_PopulateListItem(listItem: JQuery, marker: BackofficeMarker, map: GoogleMap) : JQuery {
//            listItem.attr('id', 'marker-' + marker.Id);
//            listItem.find('.name').html(marker.Name);
//            listItem.find('.position a').html(marker.Position);

//            return listItem;
//        }

//        private _Marker_AddToMarkerList(listItem: JQuery, map: BackofficeMarker): JQuery {
//            return null;
//        }

//        private _Marker_AddMarkerEvents(listItem: JQuery, marker: BackofficeMarker) {
//            var ghost = this;
            
//            listItem.find('.fakeLink.remove').click(function (e) {
//                e.preventDefault();
//                map.RemoveMarker(marker);
//            });

//            listItem.find('.fakeLink.settings').click(function (e) {
//                e.preventDefault();
//                var dialog = listItem.find('.settingsDialog');

//                if (!dialog.is(':visible')) {
//                    $(this).html($(this).attr('data-visible'));
//                } else {
//                    $(this).html($(this).attr('data-hidden'));
//                }
//                dialog.toggle('blind');
//            });

//            listItem.find('[name=name]').keyup(function () {
//                listItem.find('.name').html($(this).val());
//                marker.Name = $(this).val();
//                marker.Update(true);
//                //ghost.Save(map);
//            }).val(marker.Name);
            
//            listItem.find('[name=link]').keyup(function () {
//                console.log("updating link", $(this).val());
//                marker.Link = $(this).val();
//                marker.Update(true);
//                //ghost.Save(map);
//            }).val(marker.Link);

//            listItem.find('.position a').click(function (e) {
//                e.preventDefault();
                
//            });
//        }
//    }

//    export class UI {
//        private Maps: { };
//        private SearchMarkers: MarkerList;
//        private MapContainers: { };
//        private Menu: Menu;

//        private InfoWindow: google.maps.InfoWindow;
//        private Geocoder: google.maps.Geocoder;

//        constructor () {
//            this.Maps = {};
//            this.SearchMarkers = new MarkerList();
//            this.MapContainers = {};
//            this.Menu = new Menu();
//        }

//        public Initialize(): UI {
//            this.Geocoder = new google.maps.Geocoder();

//            return this;
//        }

//        public GetGeocoder(): google.maps.Geocoder {
//            return this.Geocoder;
//        }

//        public Add(map: GoogleMap): UI {
//            this.Maps[map.GetContainerId()] = map;
//            return this;
//        }

//        public Get(id: string): GoogleMap {
//            return this.Maps[id];
//        }

//        public Remove(map: GoogleMap): UI {
//            delete this.Maps[map.GetContainerId()];
//            return this;
//        }

//        public GetMenu(): Menu {
//            return this.Menu;
//        }

//        public GetSearchMarkers(): MarkerList {
//            return this.SearchMarkers;
//        }

//        public GetMapContainer(map: GoogleMap): JQuery {
//            if (typeof this.MapContainers[map.State.ContainerId] === 'undefined') {
//                this.MapContainers[map.State.ContainerId] = map.GetMapWrapper().closest('.gmapContainer');
//            }
//            return this.MapContainers[map.State.ContainerId];
//        }

//        public AddMarkerToUIList(marker: BackofficeMarker, map: GoogleMap): JQuery {
//            var ghost = this;

//            // Add marker to the marker list
//            var markerItem = this._Marker_GenerateListItem(map);
//            this._Marker_PopulateListItem(markerItem, marker, map);
//            this._Marker_AddMarkerEvents(markerItem, marker, map);
            
//            markerItem.find('.position a').click(function (e) {
//                e.preventDefault();
//                map.State.Map.setCenter(marker.LatLngPosition());
//            });
//            return markerItem;
//        }

//        private _Marker_GenerateListItem(map: GoogleMap): JQuery {
//            var markerItem = map.GetMapWrapper().find('.markerItemDummy').clone();
//            markerItem.removeClass('markerItemDummy').addClass('markerItem');
//            markerItem.show();

//            // Bind events
//            markerItem.find('.fakeLink.settings').click(function (e) {
//                e.preventDefault();
//                var dialog = markerItem.find('.settingsDialog');

//                if (!dialog.is(':visible')) {
//                    $(this).html($(this).attr('data-visible'));
//                } else {
//                    $(this).html($(this).attr('data-hidden'));
//                }
//                dialog.toggle('blind');
//            });

//            return null;
//        }

//        private _Marker_PopulateListItem(listItem: JQuery, marker: BackofficeMarker, map: GoogleMap) : JQuery {
//            listItem.attr('id', 'marker-' + marker.Id);
//            listItem.find('.name').html(marker.Name);
//            listItem.find('.position a').html(marker.Position);

//            return listItem;
//        }

//        private _Marker_AddToMarkerList(listItem: JQuery, map: BackofficeMarker): JQuery {
//            return null;
//        }

//        private _Marker_AddMarkerEvents(listItem: JQuery, marker: BackofficeMarker, map: GoogleMap) {
//            var ghost = this;
//            listItem.find('.fakeLink.remove').click(function (e) {
//                e.preventDefault();
//                map.RemoveMarker(marker);
//            });
//            listItem.find('[name=name]').keyup(function () {
//                listItem.find('.name').html($(this).val());
//                marker.Name = $(this).val();
//                marker.Update(true);
//                ghost.Save(map);
//            }).val(marker.Name);
//            listItem.find('[name=link]').keyup(function () {
//                console.log("updating link", $(this).val());
//                marker.Link = $(this).val();
//                marker.Update(true);
//                ghost.Save(map);
//            }).val(marker.Link);
//        }

//        //public AddSearchMarker(marker: BackofficeMarker, map: GoogleMap): UI {
//        //    if (typeof this.SearchMarkers[map.GetContainerId()] === 'undefined') {
//        //        this.SearchMarkers[map.GetContainerId()] = {};
//        //    }
//        //    this.SearchMarkers[map.GetContainerId()][marker.Id] = marker;

//        //    return this;
//        //}

//        //public RemoveSearchMarker(marker: BackofficeMarker, map: GoogleMap): UI {
//        //    if (typeof this.SearchMarkers[map.GetContainerId()] !== 'undefined') {
//        //        var m: BackofficeMarker = this.SearchMarkers[map.GetContainerId()][marker.Id];
//        //        m.MapsMarker().setMap(<google.maps.Map>null);
//        //        delete this.SearchMarkers[map.GetContainerId()][marker.Id];
//        //    }
//        //    return this;
//        //}

//        //public ClearSearchMarkers(map: GoogleMap): UI {
//        //    if (H.IsDefined(this.SearchMarkers[map.GetContainerId()])) {
//        //        var markerList = this.SearchMarkers[map.GetContainerId()];
//        //        for (var id in markerList) {
//        //            if (H.IsDefined(id)) {
//        //                var m: BackofficeMarker = markerList[id];
//        //                m.MapsMarker().setMap(<google.maps.Map>null);
//        //            }
//        //        }
//        //    }

//        //    delete this.SearchMarkers[map.GetContainerId()];
//        //    this.SearchMarkers[map.GetContainerId()] = {};

//        //    return this;
//        //}

//        public Save(map: GoogleMap): UI {
//            var settings = JSON.stringify(map.State.MapSettings);
//            L.Debug("Saving settings", this, settings);
//            this.GetMapContainer(map).children('input.hiddenLocations').val(settings);

//            return this;
//        }

//        private ToPixelPosition(map: GoogleMap, marker: google.maps.Marker): google.maps.Point {
//            return map.State.Projection.fromLatLngToContainerPixel(marker.getPosition());
//        }

//        public SetInfoWindow(window: google.maps.InfoWindow): UI {
//            this.InfoWindow = window;
//            return this;
//        }

//        public GetInfoWindow(): google.maps.InfoWindow {
//            if (!H.IsDefined(this.InfoWindow)) {
//                return null;
//            }
//            return this.InfoWindow;
//        }

//        public BindBrowsing(): void {
//            var ghost = this;
//            $('a[id*=TabView]').click(function () {
//                console.log("Clicked tab view");
//                var id = $(this).attr('id').replace(/^(.*\_tab\d+).*$/, "$1") + 'layer';
//                $('#' + id).find('.map').each(function () {
//                    var mapId = $(this).attr('id');
//                    var map: IMap = <IMap>ghost.Maps[mapId];

//                    if (typeof map !== 'undefined' && map != null) {
//                        // Check if the map object is already initialized
//                        if (!map.IsInitialized()) {
//                            L.Log("Initializing map", ghost, mapId);
//                            map.Initialize();
//                        }
//                        else {
//                            // Re-render the map
//                            L.Log("Re-rendering the map", ghost, mapId);
//                            // TODO: Force save of the map
//                            // TODO: Re-render the map
//                        }
//                    }
//                    return null;
//                });
//            });
//        }
//    }
    
//    export class BackofficeMarker extends Marker {
//        constructor() {
//            super();
//        }
//    }

//    export class BackOfficeRenderer implements IMapStateListener {
//        /// <summary>
//        /// Handles the backoffice listening and rendering process
//        /// </summary>

//        private Interface: UI;

//        constructor () {
//            this.Interface = new UI();
//        }

//        public Start() {
//            /// <summary>
//            /// Start the rendering process
//            /// </summary>
//            var ghost = this;
//            ghost.Interface.Initialize();

//            L.Log("Intialization performed, continuing rendering", this);
//            $('.gmapContainer').each(function () {
//                // Retrieve map object id
//                var mapId = $('.map', this).attr('id');

//                // Retrieve backoffice settings
//                var settings = $(this).find('input.mapSettings').val();
//                var content = $(this).find('input.hiddenLocations').val();

//                L.Log("Rendering is set with settings", this, content);

//                var renderSettings: RenderSettings = null;
//                if (typeof content === "undefined" || String.IsNullOrEmpty(content)) {
//                    renderSettings = new RenderSettings(mapId, new MapSettings());
//                } else {
//                    renderSettings = new RenderSettings(mapId, JSON.parse(content));
//                }

//                ghost.Interface.Add(new GoogleMap(renderSettings, [ghost]));
//            });

//            // Render only visible maps
//            var activeTabId = $('.tabOn').attr('id'); // Current tab
//            var activeTabContent = $("#" + activeTabId + "layer").find('.map');
//            activeTabContent.ready(function () {
//                for (var i = 0; i < activeTabContent.length; i++) {
//                    var id = $(activeTabContent[i]).attr('id');
//                    L.Log("Rendering active map", id);

//                    var map = (<GoogleMap>ghost.Interface.Get(id));
//                    //var map = (<GoogleMap>ghost.Maps[id]);
//                    if (typeof map !== 'undefined' && map != null) {
//                        map.Initialize();
//                    }
//                }

//                return true;
//            });

//            // Bind our tab browsing so that we will re-render maps on browsing tabs
//            // This fixes issues with browsers not rendering hidden iframes properly
//            this.Interface.BindBrowsing();
//        }

//        public RerenderDoneEvent(map: GoogleMap) {
//            // TODO: Implement
//        }

//        public InitializationDoneEvent(map: GoogleMap): void {
//            var ghost = this;
            
//            // #region Searchbar
//            // Activate autocomplete searchbar
//            var container = map.GetMapWrapper().parentsUntil('.gmapContainer').parent();
//            var input = container.find('input.place')[0];
//            var autocomplete = new google.maps.places.Autocomplete(<HTMLInputElement>input);
//            autocomplete.bindTo('bounds', map.State.Map);

//            // Bind the search button and the search area to allow the user
//            // to search for locations
//            var searchButton = container.find('input.search');
//            searchButton.click(function (e) {
//                e.preventDefault();
//                ghost.Interface.GetSearchMarkers().Clear(map);
//                var button = $(this);
//                button.hide();

//                var searchTerm = $(this).siblings('.place').val();
//                ghost.Interface.GetGeocoder().geocode({ 'address': searchTerm }, function (data, status) {
//                    if (status == google.maps.GeocoderStatus.OK) {
//                        $.each(data, function () {
//                            var result = this;
//                            var title = result.formatted_address;
//                            var position = result.geometry.location;

//                            // Add a searchmarker to the mapF
//                            var searchMarker = new BackofficeMarker();
//                            searchMarker.SetTitle(title);
//                            searchMarker.SetMapsPosition(position);
//                            searchMarker.SetIcon("/umbraco/plugins/meramedia.GoogleMap.plugin/searchIcon.png");
//                            map.AddMarker(searchMarker, false, false);

//                            // Add the marker to our temporary list as 
//                            // there is no other managing of these markers as they are temporary markers
//                            //ghost.Interface.AddSearchMarker(searchMarker, map);
//                            ghost.Interface.GetSearchMarkers().Add(searchMarker, map);

//                            // TODO: Bind click event
//                        });
//                    }
//                    button.show();
//                }); 
//            });

//            var searchArea = container.find('input.place');
//            searchArea.keypress(function (e) {
//                if(e.keyCode == 13) {
//                  e.preventDefault();
//                  searchButton.triggerHandler('click');
//                  return false;
//                }
//            });
//            // #endregion
//        }

//        public MarkerAddedEvent(map: GoogleMap, marker: BackofficeMarker): void {
//            // TODO: This method ended up getting quite bloated. Should be cleaned up a bit.
//            var ghost : BackOfficeRenderer = this;
//            var mapWrapper = map.GetMapWrapper();
//            var MarkerUpdatedEvent = function () {
//                ghost.Interface.Save(map);

//                // Update address on move
//                ghost.Interface.GetGeocoder().geocode({ 'address': marker.Position }, function (data, status) {
//                    if (status == google.maps.GeocoderStatus.OK) {
//                        if (data.length > 0) {
//                            item.find('.position a').html(data[0].formatted_address);
//                        }
//                    }
//                });
//            };

//            marker.ValueUpdatedEvent = MarkerUpdatedEvent;
//            marker.RightClickEvent = function (_, googleMarker, e) {
//                var list = $('<ul><li class="add_marker_content">Edit content</li><li class="remove_marker">Remove marker</li></ul>');
//                var popup = $('<div class="markerPopup"></div>').append(list).append('<div class="markerArrow"></div>');

//                list.children('.add_marker_content').click(function () {
//                    //ghost.Interface.RemoveMenu();
//                    ghost.Interface.GetMenu().Close();

//                    if (ghost.Interface.GetInfoWindow() != null) {
//                        ghost.Interface.GetInfoWindow().close();
//                    }

//                    // Create the textarea for the information
//                    var wrapper = $('<div>');
//                    var textarea = $('<textarea id="marker_content"></textarea>');
//                    textarea.val(H.IfDefined(marker.Content, String.Empty));
//                    textarea.keyup(function () {
//                        marker.Content = $(this).val();
//                        ghost.Interface.Save(map);
//                    });
//                    wrapper.append(textarea).append('<br/><small style="clear:both;">HTML is allowed</small>');

//                    // Create the infowindow with the textarea we created earlier
//                    var infoWindow = new google.maps.InfoWindow({
//                         content: wrapper.get(0)
//                    });

//                    infoWindow.open(map.GetState().Map, googleMarker);
//                    ghost.Interface.SetInfoWindow(infoWindow);
//                    //ghost.InfoWindow = new google.maps.InfoWindow({
//                    //    content: wrapper.get(0)
//                    //});
//                    //ghost.InfoWindow.open(map.State.Map, googleMarker);
//                });

//                list.children('.remove_marker').click(function () {
//                    ghost.Interface.GetMenu().Close(); // Remove()
//                    map.RemoveMarker(marker);
//                });

//                list.children().last()
//                    .hover(function () {
//                        $(this).closest('.markerPopup').siblings('.markerArrow').addClass('active');
//                    }, function () {
//                        $(this).closest('.markerPopup').siblings('.markerArrow').removeClass('active');
//                    });

//                ghost.Interface.GetMenu().Replace(popup, map);//ReplaceMenu(map, popup);
                
//                var pos = ghost.Interface.ToPixelPosition(map, googleMarker);
//                popup.css('left', pos.x - 2);
//                popup.css('top', pos.y - list.outerHeight() - 30);
//            };
//            marker.DragEndEvent = MarkerUpdatedEvent;

//            // Create the marker list entry
//            L.Log("Creating marker item for user list", this);
//            var mainWrapper = mapWrapper.parentsUntil('.gmapContainer').parent();
//            var item = ghost.Interface.AddMarkerToUIList(map, mainWrapper, marker);
//            mainWrapper.find('.markerList').append(item);
//            item.show();

//            // Update the position to a name instead if possible
//            ghost.Interface.GetGeocoder().geocode({ 'address': marker.Position }, function (data, status) {
//                if (status == google.maps.GeocoderStatus.OK) {
//                    if (data.length > 0) {
//                        item.find('.position a').html(data[0].formatted_address);
//                    }
//                }
//            });

//            this.Interface.GetMapContainer(map).find('.noMarkersText').hide();

//            //// Update the icon
//            //// Dropdown menu, replaces the preview icon on every value change
//            //markerHtml.find('.dropdownSource').change(function () {
//            //    var value = $(this).val();
//            //    var iconImage = $(this).find('option[value=' + value + ']').html();

//            //    if (value == "default")
//            //        marker2.setIcon(null);
//            //    else
//            //        marker2.setIcon(iconImage);

//            //    if (marker2.getIcon() == null)
//            //        $(this).parent().children('span.iconPreview').html("");
//            //    else
//            //        $(this).parent().children('span.iconPreview').html('<img src="' + iconImage + '"/>');

//            //    // Update internal values
//            //    //self._UpdateSaveValue(mapObject);
//            //});
//        }

//        public MarkerRemovedEvent(map: GoogleMap, marker: BackofficeMarker): void {
//            // Remove marker from the list
//            var mainWrapper = map.GetMapWrapper().parentsUntil('.gmapContainer').parent();
//            mainWrapper.find('.markerList #marker-' + marker.Id).remove();
//            this.Interface.Save(map);

//            if (map.GetMarkers().length == 0) {
//                this.Interface.GetMapContainer(map).find('.noMarkersText').show();
//            }
//        }

//        public StateChangedEvent(map: GoogleMap, state: STATE_CHANGE, e?: any): void {
//            var ghost = this;
//            var event: google.maps.UIEvent = e;

//            this.Interface.GetMenu().Close();
//            this.Interface.Save(map);//RemoveMenu().Save(map);
//            switch (state) {
//                case STATE_CHANGE.MAP_RIGHT_CLICK:
//                    // On right click we will display a popup box where the user may
//                    // add new markers.
//                    // FUTURE: May add some more options here?
//                    var list = $('<ul><li class="add_marker_action" data-position="' + e.latLng.lat() + ',' + e.latLng.lng() + '">Add marker here</li></ul>');
//                    list.children('.add_marker_action').click(function () {
//                        var position = $(this).attr('data-position');
//                        ghost.Interface.GetMenu().Close(); //RemoveMenu();

//                        // Add marker to map
//                        var marker = new Marker();
//                        marker.Position = e.latLng.lat() + "," + e.latLng.lng();
//                        marker.Clickable = marker.Draggable = true;

//                        map.AddMarker(marker);
//                        ghost.Interface.Save(map);
//                    }).hover(function () {
//                        $(this).closest('.markerPopup').siblings('.markerArrow').addClass('active');
//                    }, function () {
//                        $(this).closest('.markerPopup').siblings('.markerArrow').removeClass('active');
//                    });

//                    var menu : JQuery = $('<div class="markerPopup"></div>').append(list).append('<div class="markerArrow"></div>');
//                    this.Interface.GetMenu().Replace(menu, map);

//                    // Minor touches to move the menu to a more pleasing position
//                    menu.css('left', event.pixel.x - 5);
//                    menu.css('top', event.pixel.y - list.height() - 10);
//                    break;
//                case STATE_CHANGE.MAP_LEFT_CLICK:
//                    break;
//            }

//            ghost.Interface.Save(map);
//        }
//    }
//}
 