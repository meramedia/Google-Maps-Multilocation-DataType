/// <reference path="libs/google.maps.d.ts" />
/// <reference path="libs/jquery.d.ts" />
/// <reference path="meramedia.googlemaps.interfaces.d.ts" />
/// <reference path="meramedia.googlemaps.Core.ts"/>
module Meramedia.GoogleMaps {
    // Default values that are available
    export module DefaultValues {
        export class Map {
            // Map settings
            static Zoom: number = 12;
            static Center: string = "0,0";
        }

        export class Marker {
            // Marker settings
            static ZIndex: number = 10;
        }

        export class CoreSettings {
            static DefaultWidth: number = 500;
            static DefaultHeight: number = 500;
            static MaxMarkers: number = -1;
            static MinMarkers: number = 0;
        }
    }

    export class FakeState {
        static Markers: google.maps.Marker[] = [];
    }

    // Maps marker. Transformable into a google maps marker
    export class Marker implements IMapsMarker {
        private static NextId: number = 0;

        // Internal
        Id: number;
        Name: string = null;
        Title: string = null;
        Visible: bool = true;
        Draggable: bool = false;
        Clickable: bool = false;
        ZIndex: number = DefaultValues.Marker.ZIndex;
        Link: string = null;
        Icon: string = null;
        Position: string = "0,0";

        Content: string = null;

        /// <summary>
        /// Must be set before applying ToGoogleMapsMarker
        /// </summary>
        ClickEvent: (m: Marker, m2: google.maps.Marker, e: google.maps.UIEvent) => void;
        RightClickEvent: (m: Marker, m2: google.maps.Marker, e: google.maps.UIEvent) => void;
        DragEndEvent: (m: Marker, m2: google.maps.Marker, e: google.maps.UIEvent) => void;
        DragStartEvent: (m: Marker, m2: google.maps.Marker, e: google.maps.UIEvent) => void;

        ValueUpdatedEvent: (m: Marker) => void;

        constructor () {
            this.Id = Marker.NextId++;
        }

        static FromObject(markerOptions: any) : Marker {
            /// <summary>
            /// Creates a marker from json marker options
            /// </summary>
            var marker = new Marker();
            marker.Name = H.IfDefined(markerOptions.Name, String.Empty);
            marker.Title = H.IfDefined(markerOptions.Title, null);
            marker.Visible = H.IfDefined(markerOptions.Visible, marker.Visible);
            marker.Draggable = H.IfDefined(markerOptions.Draggable, marker.Draggable);
            marker.Clickable = H.IfDefined(markerOptions.Clickable, marker.Clickable);
            marker.ZIndex = H.IfDefined(markerOptions.ZIndex, marker.ZIndex);
            marker.Link = H.IfDefined(markerOptions.Link, marker.Link);
            marker.Icon = H.IfDefined(markerOptions.Icon, marker.Icon);
            marker.Position = H.IfDefined(markerOptions.Position, "0,0");
            marker.Content = H.IfDefined(markerOptions.Content, null);

            return marker;
        }

        GetDisplayTitle(): string {
            if (H.IsDefined(this.Name)) {
                return this.Name + (H.IsDefined(this.Title) ? this.Title : String.Empty);
            }
            return this.Title;
        }

        LatLngPosition(): google.maps.LatLng {
            return H.IfDefined(this.Position, new google.maps.LatLng(0,0), new google.maps.LatLng(parseFloat(this.Position.split(',')[0]), parseFloat(this.Position.split(',')[1])))
        }

        private GetMarkerOptions() : google.maps.MarkerOptions {
            return {
                clickable: this.Clickable,
                draggable: this.Draggable,
                visible: this.Visible,
                icon: this.Icon,
                title: this.GetDisplayTitle(),
                zIndex: this.ZIndex,
                position: H.IfDefined(this.Position, new google.maps.LatLng(0,0), new google.maps.LatLng(parseFloat(this.Position.split(',')[0]), parseFloat(this.Position.split(',')[1])))
            };
        }

        public Update(toGoogleMapsMarker: bool = false): void {
            var marker = this.MapsMarker();
            if (!toGoogleMapsMarker) {
                this.Visible = marker.getVisible();
                this.Draggable = marker.getDraggable();
                this.Clickable = marker.getClickable();
                this.ZIndex = marker.getZIndex();
                this.Icon = (marker.getIcon() == null ? null : marker.getIcon().url);
                this.Position = marker.getPosition().toString().replace('(', '').replace(')', '');
            } else {
                marker.setVisible(this.Visible);
                marker.setClickable(this.Clickable);
                marker.setZIndex(this.ZIndex);
                marker.setIcon(this.Icon);
                marker.setTitle(this.GetDisplayTitle());
                marker.setPosition(this.LatLngPosition());
            }
        }

        public SetIcon(icon: string): void {
            this.Icon = icon;
            this.Update(true);
        }

        public SetTitle(title: string): void {
            this.Title = title;
            this.Update(true);
        }

        public SetVisible(visible: bool): void {
            this.Visible = visible;
            this.Update(true);
        }

        public SetDraggable(draggable: bool): void {
            this.Draggable = draggable;
            this.Update(true);
        }

        public SetLink(link: string): void {
            this.Link = link;
            this.Update(true);
        }

        public SetPosition(position: string): void {
            this.Position = position;
            this.Update(true);
        }

        public SetClickable(clickable: bool): void {
            this.Clickable = clickable;
            this.Update(true);
        }

        public SetMapsPosition(position: any, position2: any): void;
        public SetMapsPosition(position: google.maps.LatLng): void;
        public SetMapsPosition(position: any, position2?: any): void {
            if (H.IsDefined(position2)) {
                this.Position = position + "," + position2;
            } else {
                this.Position = position.toString().replace('(', '').replace(')', '');
            }
            this.Update(true);
        }

        MapsMarker(): google.maps.Marker {
            if (!H.IsDefined(FakeState.Markers[this.Id])) {
                var ghost = this;
                var MapsMarker = new google.maps.Marker(this.GetMarkerOptions());
                google.maps.event.addListener(MapsMarker, 'click', function (e) {
                    ghost.Update();
                    if (ghost.ClickEvent) {
                        ghost.ClickEvent(ghost, MapsMarker, e);
                    }
                });
                google.maps.event.addListener(MapsMarker, 'rightclick', function (e) {
                    ghost.Update();
                    if (ghost.RightClickEvent) {
                        ghost.RightClickEvent(ghost, MapsMarker, e);
                    }
                });
                google.maps.event.addListener(MapsMarker, 'dragstart', function (e) {
                    ghost.Update();
                    if (ghost.DragStartEvent) {
                        ghost.DragStartEvent(ghost, MapsMarker, e);
                    }
                });
                google.maps.event.addListener(MapsMarker, 'dragend', function (e) {
                    ghost.Update();
                    if (ghost.DragEndEvent) {
                        ghost.DragEndEvent(ghost, MapsMarker, e);
                    }
                });

                FakeState.Markers[this.Id] = MapsMarker;
            }
            return FakeState.Markers[this.Id];
        }
    }

    export enum STATE_CHANGE {
        MAP_LEFT_CLICK,
        MAP_RIGHT_CLICK,
        CENTER_CHANGED,
        ZOOM_CHANGED,
        MAPTYPEID_CHANGED
    }
    
    // Core settings for the backoffice
    // Prevents min markers/max markers
    export class CoreSettings {
        AllowCustomLink: bool;
        MaxMarkers: number = DefaultValues.CoreSettings.MaxMarkers;
        MinMarkers: number = DefaultValues.CoreSettings.MinMarkers;
        DefaultWidth: number = DefaultValues.CoreSettings.DefaultWidth;
        DefaultHeight: number = DefaultValues.CoreSettings.DefaultHeight;

        // coreSettings = json object
        constructor (coreSettings?: any /*CoreSettings json*/) {
            // Check if we have something defined
            if (H.IsDefined(coreSettings)) {
                this.AllowCustomLink = H.IfDefined(coreSettings.AllowCustomLinks, this.AllowCustomLink);
                this.MaxMarkers = H.IfDefined(coreSettings.MaxMarkers, this.MaxMarkers);
                this.MinMarkers = H.IfDefined(coreSettings.MinMarkers, this.MinMarkers);
                this.DefaultHeight = H.IfDefined(coreSettings.DefaultHeight, this.DefaultHeight);
                this.DefaultWidth = H.IfDefined(coreSettings.DefaultWidth, this.DefaultWidth);
            }
        }
    }

    // Map options for rendering the map
    // Zoom, center, mapTypeId
    export class MapOptions implements IMapOptions {
        Zoom: number = DefaultValues.Map.Zoom;
        Center: string = DefaultValues.Map.Center;
        MapTypeId: google.maps.MapTypeId = google.maps.MapTypeId.ROADMAP;
    
        // mapOptions = json object
        constructor (mapOptions?: any) {
            if (H.IsDefined(mapOptions)) {
                this.Zoom = H.IfDefined(mapOptions.Zoom, this.Zoom);
                this.Center = H.IfDefined(mapOptions.Center, this.Center);
                this.MapTypeId = H.IfDefined(mapOptions.MapTypeId, google.maps.MapTypeId.ROADMAP); // TODO: Works?
            }
        }

        /// Get the center position "x,y" as a google.maps.LatLng object
        private GetCenterAsLatLng(): google.maps.LatLng {
            return new google.maps.LatLng(parseFloat(this.Center.split(",")[0]), parseFloat(this.Center.split(",")[1]));
        }

        // Returns the MapOptions as a google.maps.MapOptions object
        AsGoogleMapOptions(): google.maps.MapOptions {
            return {
                zoom: this.Zoom,
                center: this.GetCenterAsLatLng(),
                mapTypeId: this.MapTypeId
            };
        }
    }

    // MapSettings
    export class MapSettings implements IMapSettings {
        /// <summary>
        /// Map settings class for storing settings for the map.
        /// This class may be serialized to store settings as json or other 
        /// types of data representation methods.
        /// </summary>
        
        Markers: Marker[];
        CoreSettings: CoreSettings;
        MapOptions: MapOptions;

        Width: number;
        Height: number;

        constructor (mapSettings?: any /* Json object */) {
            this.Markers = new Array();

            if (H.IsDefined(mapSettings)) {
                // Parse markers
                if (H.IsDefined(mapSettings.Markers)) {
                    for (var i = 0; i < mapSettings.Markers.length; i++) {
                        this.Markers.push(Marker.FromObject(mapSettings.Markers[i]));
                    }
                }

                if (H.IsDefined(mapSettings.MapOptions)) {
                    this.MapOptions = new MapOptions(mapSettings.MapOptions);
                }
                else {
                    this.MapOptions = new MapOptions();
                }

                if (H.IsDefined(mapSettings.CoreSettings)) {
                    this.CoreSettings = new CoreSettings(mapSettings.CoreSettings);
                }
                else {
                    this.CoreSettings = new CoreSettings();
                }
            }

        }
    }

    // Settings for rendering the map
    export class RenderSettings implements IRenderSettings {
        MapSettings: MapSettings;
        ContainerId: string;

        // ContainerId = container id for the map
        // mapSettings = mapsettings for the map
        constructor (ContainerId: string,  mapSettings: MapSettings) {
            if (!H.IsDefined(ContainerId)) {
                throw new ArgumentException("ContainerId must be defined");
            }

            this.ContainerId = ContainerId;

            // Convert the MapSettings to the correct object
            if (H.IsDefined(mapSettings)) {
                this.MapSettings = new MapSettings(mapSettings);
            }
            else {
                this.MapSettings = new MapSettings();
            }
        }
    }

    export class MapState implements IMapState {
        ContainerId: string;
        
        Map: google.maps.Map;
        MapSettings: MapSettings;
        Listeners: IMapStateListener[];
        
        Initialized: bool = false;
        UpdatedBounds: bool = false;

        Projection: google.maps.MapCanvasProjection;
        Overlay: google.maps.OverlayView;

        //Panorama: google.maps.StreetViewPanorama;

        constructor (settings: RenderSettings, listeners?: IMapStateListener[]) {
            this.ContainerId = settings.ContainerId;
            //this.UserCustomizable = settings.UserCustomizable;
            this.MapSettings = settings.MapSettings;
            this.Listeners = H.IfDefined(listeners, []);
        }

        Update(): void {
            /// <summary>
            /// Make automatic updates/getters
            /// </summary>
            var center = this.Map.getCenter();
            this.MapSettings.MapOptions.Center = center.lat() + "," + center.lng();
            this.MapSettings.MapOptions.MapTypeId = this.Map.getMapTypeId();
            this.MapSettings.MapOptions.Zoom = this.Map.getZoom();
        }
    }

    // Google maps
    export class GoogleMap implements IMap {
        State: MapState;

        constructor (settings: RenderSettings, listeners?: IMapStateListener[]) {
            if (settings == null) {
                throw new MissingArgumentException("settings (IRenderSettings) must be set");
            } 
            if (document.getElementById(settings.ContainerId) == null) {
                throw new InvalidArgumentException("Invalid GoogleMap container id");
            }

            // Create our MapState
            this.State = new MapState(settings, listeners);
            this.State.Overlay = new google.maps.OverlayView();
            this.State.Overlay.draw = function () { };
        }

        private RegisterEvents(): void {
            /// <summary>
            /// Registers events for the map.
            /// When an event has been performed listeners will be notified of this.
            /// </summary>
            L.Log("Registering events", this);
            var ghost = this;

            google.maps.event.addListener(this.State.Map, 'click', function (e) {
                ghost.State.Update();
                for (var i = 0; i < ghost.State.Listeners.length; i++) {
                    ghost.State.Listeners[i].StateChangedEvent(ghost, STATE_CHANGE.MAP_LEFT_CLICK, e);
                }
            });

            google.maps.event.addListener(this.State.Map, 'rightclick', function (e) {
                ghost.State.Update();
                for (var i = 0; i < ghost.State.Listeners.length; i++) {
                    ghost.State.Listeners[i].StateChangedEvent(ghost, STATE_CHANGE.MAP_RIGHT_CLICK, e);
                }
            });

            google.maps.event.addListener(this.State.Map, 'center_changed', function (e) {
                ghost.State.Update();
                for (var i = 0; i < ghost.State.Listeners.length; i++) {
                    ghost.State.Listeners[i].StateChangedEvent(ghost, STATE_CHANGE.CENTER_CHANGED, e);
                }
            });

            google.maps.event.addListener(this.State.Map, 'zoom_changed', function (e) {
                ghost.State.Update();
                for (var i = 0; i < ghost.State.Listeners.length; i++) {
                    ghost.State.Listeners[i].StateChangedEvent(ghost, STATE_CHANGE.ZOOM_CHANGED, e);
                }
            });

            google.maps.event.addListener(this.State.Map, 'maptypeid_changed', function () {
                ghost.State.Update();
                for (var i = 0; i < ghost.State.Listeners.length; i++) {
                    ghost.State.Listeners[i].StateChangedEvent(ghost, STATE_CHANGE.MAPTYPEID_CHANGED);
                }
            });

            // Streetview addon
            //google.maps.event.addListener(this.State.Panorama, 'pov_changed', function () {
            //    //var panoCell = document.getElementById('pano_cell');
            //    //panoCell.firstChild.nodeValue = ghost.State.Panorama.getPano();
            //    console.log(ghost.State.Panorama.getPov().heading);
            //});

            //google.maps.event.addListener(this.State.Panorama, 'position_changed', function () {
            //    var positionCell = document.getElementById('position_cell');
            //    positionCell.firstChild.nodeValue = ghost.Panorama.getPosition();
            //});

        }

        public AddMarker(marker: Marker, pushMarker = true, notifyObservers = true): void {
            /// <summary>
            /// Adds a marker to the map
            /// </summary>
            var gMapsMarker = marker.MapsMarker();

            // Set the map for the marker -> the marker is added to the map
            if (pushMarker) {
                this.State.MapSettings.Markers.push(marker);
            }

            gMapsMarker.setMap(this.State.Map);

            if (notifyObservers) {
                for (var i = 0; i < this.State.Listeners.length; i++) {
                    this.State.Listeners[i].MarkerAddedEvent(this, marker);
                }
            }
        }

        public RemoveMarker(marker: Marker) : void {
            /// <summary>
            /// Removes the given marker from the map
            /// </summary>
            marker.MapsMarker().setMap(<google.maps.Map>null);
            for (var i = 0; i < this.State.MapSettings.Markers.length; i++) {
                var foundMarker = this.State.MapSettings.Markers[i];
                if (typeof foundMarker !== 'undefined' && foundMarker.Id == marker.Id) {
                    //delete this.State.MapSettings.Markers[i];
                    this.State.MapSettings.Markers.remove(i);
                }
            }

            // Notify listeners
            for (var i = 0; i < this.State.Listeners.length; i++) {
                this.State.Listeners[i].MarkerRemovedEvent(this, marker);
            }
        }

        public Initialize(): void;
        public Initialize(mapOptions?: MapOptions): void {
            L.Log("Initializing map", this, this.State.ContainerId);

            var ghost = this;

            // Create our map
            this.State.Map = new google.maps.Map(
                                    document.getElementById(this.State.ContainerId),
                                    (H.IsDefined(mapOptions) ? mapOptions : this.State.MapSettings.MapOptions.AsGoogleMapOptions())
                             );

            // TODO: Maybe some map customization?
            //this.State.Map.setOptions({
            //    styles: [
            //        {
            //            stylers: [
            //              { saturation: -73 },
            //              { visibility: "simplified" }
            //            ]
            //        }
            //    ]
            //});

            // Create a projection that we may use layer on to map latLng -> pixel coordinates
            this.State.Overlay.setMap(this.State.Map);
            google.maps.event.addListener(this.State.Map, 'idle', function () {
                ghost.State.Projection = ghost.State.Overlay.getProjection();
            });

            //// TODO: StreetView
            //this.State.Panorama = this.State.M ap.getStreetView();

            // TODO: Perform the rest of the rendering process

            if (!this.State.Initialized) {
                this.RegisterEvents();

                if (H.IsDefined(this.State.MapSettings.Markers)) {
                    $.each(ghost.State.MapSettings.Markers, function (i, v: Marker) {
                        ghost.AddMarker(v, false);
                    });
                }
            }
            this.State.Initialized = true;

            for (var i = 0; i < this.State.Listeners.length; i++) {
                this.State.Listeners[i].InitializationDoneEvent(this);
            }
        }

        public GetMapContainer(): JQuery {
            /// <summary>
            /// Returns the map container as a JQuery object
            /// </summary>
            return $('#' + this.State.ContainerId);
        }

        public GetState(): MapState {
            /// <summary>
            /// Returns the internal state for the map
            /// </summary>
            return this.State;
        }

        public IsInitialized(): bool {
            /// <summary>
            /// Returns True if the map have been initialized, False otherwise
            /// </summary>
            return this.State.Initialized;
        }
    }
}