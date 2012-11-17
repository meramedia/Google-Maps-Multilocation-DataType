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

    // Maps marker. Transformable into a google maps marker
    export class Marker implements IMapsMarker {
        private static NextId: number = 0;

        // Internal
        Id: number;
        Name: string;
        Title: string;
        Visible: bool = true;
        Draggable: bool = false;
        Clickable: bool = false;
        ZIndex: number = DefaultValues.Marker.ZIndex;
        Link: string = null;
        Icon: string = null;
        Position: string;

        Content: string;

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

            return marker;
        }

        GetDisplayTitle(): string {
            return H.IfDefined(this.Name, this.Name + "\n" + this.Title, this.Title);
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

        private UpdateValues(marker: google.maps.Marker): void {
            this.Visible = marker.getVisible();
            this.Draggable = marker.getDraggable();
            this.Clickable = marker.getClickable();
            this.ZIndex = marker.getZIndex();
            this.Icon = (marker.getIcon() == null ? null : marker.getIcon().url);
            this.Position = marker.getPosition().toString().replace('(','').replace(')','');
        }

        //private MapsMarker: google.maps.Marker;
        ToGoogleMapsMarker(): google.maps.Marker {
            var ghost = this;
            var MapsMarker = new google.maps.Marker(this.GetMarkerOptions());
            google.maps.event.addListener(MapsMarker, 'click', function (e) { 
                ghost.UpdateValues(MapsMarker);
                if (ghost.ClickEvent) {
                    ghost.ClickEvent(ghost, MapsMarker, e);
                }
            });
            google.maps.event.addListener(MapsMarker, 'rightclick', function (e) { 
                ghost.UpdateValues(MapsMarker);
                if (ghost.RightClickEvent) {
                    ghost.RightClickEvent(ghost, MapsMarker, e);
                }
            });
            google.maps.event.addListener(MapsMarker, 'dragstart', function (e) { 
                ghost.UpdateValues(MapsMarker);
                if (ghost.DragStartEvent) {
                    ghost.DragStartEvent(ghost, MapsMarker, e);
                }
            });
            google.maps.event.addListener(MapsMarker, 'dragend', function (e) { 
                ghost.UpdateValues(MapsMarker);
                if (ghost.DragEndEvent) { 
                    ghost.DragEndEvent(ghost, MapsMarker, e); 
                } 
            });
            return MapsMarker;
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
        Markers: Marker[];
        CoreSettings: CoreSettings;
        MapOptions: MapOptions;

        // Internal settings
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
        //UserCustomizable: bool = false;

        Projection: google.maps.MapCanvasProjection;
        Overlay: google.maps.OverlayView;

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
        }

        MapContainer(): JQuery {
            return $('#' + this.State.ContainerId);
        }

        AddMarker(marker: Marker, pushMarker = true): void {
            var gMapsMarker = marker.ToGoogleMapsMarker();

            // Set the map for the marker -> the marker is added to the map
            if (pushMarker) {
                this.State.MapSettings.Markers.push(marker);
            }
            gMapsMarker.setMap(this.State.Map);

            for (var i = 0; i < this.State.Listeners.length; i++) {
                this.State.Listeners[i].MarkerAddedEvent(this, marker);
            }
        }

        GetState(): MapState {
            return this.State;
        }

        Initialize(): void;
        Initialize(mapOptions?: MapOptions/*, markers?: Marker[], rerender?: bool*/): void {
            L.Log("Initializing map", this, this.State.ContainerId);

            var ghost = this;

            // Create our map
            this.State.Map = new google.maps.Map(
                                    document.getElementById(this.State.ContainerId),
                                    (H.IsDefined(mapOptions) ? mapOptions : this.State.MapSettings.MapOptions.AsGoogleMapOptions())
                             );

            // Create a projection that we may use layer on to map latLng -> pixel coordinates
            this.State.Overlay.setMap(this.State.Map);
            google.maps.event.addListener(this.State.Map, 'idle', function () {
                ghost.State.Projection = ghost.State.Overlay.getProjection();
            });

            // The maps has been created, lets add all our stored settings 
            // to it.

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

        IsInitialized(): bool {
            return this.State.Initialized;
        }
    }
}