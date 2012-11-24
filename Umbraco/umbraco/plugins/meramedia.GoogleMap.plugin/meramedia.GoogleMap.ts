/// <reference path="../../../TypeScript/Google/google.maps.d.ts" />
/// <reference path="../../../TypeScript/JQuery/jquery.d.ts" />
/// <reference path="libs/meramedia.maps.d.ts" />
/// <reference path="meramedia.Helpers.d.ts"/>
/// <reference path="core/meramedia.Maps.Core.ts"/>
module Meramedia.GoogleMaps {
    class FakeState {
        static Markers: google.maps.Marker[] = [];
    }

    // Maps marker. Transformable into a google maps marker
    export class Marker implements Maps.IMapsMarker {
        private static NextId: number = 0;

        // Internal
        Id: number;
        private Name: string = null;
        private Title: string = null;
        private Visible: bool = true;
        private Draggable: bool = false;
        private Clickable: bool = false;
        private ZIndex: number = Maps.Core.DefaultValues.Marker.ZIndex;
        private Link: string = null;
        private Icon: string = null;
        private Position: string;

        private Content: string = null;

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

        public static FromObject(markerOptions: any) : Marker {
            /// <summary>
            /// Creates a marker from json marker options
            /// </summary>
            var marker = new Marker();
            marker.Name = Helpers.H.IfDefined(markerOptions.Name, Helpers.String.Empty);
            marker.Title = Helpers.H.IfDefined(markerOptions.Title, null);
            marker.Visible = Helpers.H.IfDefined(markerOptions.Visible, marker.Visible);
            marker.Draggable = Helpers.H.IfDefined(markerOptions.Draggable, marker.Draggable);
            marker.Clickable = Helpers.H.IfDefined(markerOptions.Clickable, marker.Clickable);
            marker.ZIndex = Helpers.H.IfDefined(markerOptions.ZIndex, marker.ZIndex);
            marker.Link = Helpers.H.IfDefined(markerOptions.Link, marker.Link);
            marker.Icon = Helpers.H.IfDefined(markerOptions.Icon, marker.Icon);
            marker.Position = Helpers.H.IfDefined(markerOptions.Position, Maps.Core.DefaultValues.Map.Center);
            marker.Content = Helpers.H.IfDefined(markerOptions.Content, null);

            return marker;
        }

        public GetDisplayTitle(): string {
            if (Helpers.H.IsDefined(this.Name) && !Helpers.String.IsNullOrEmpty(this.Name)) {
                return this.Name + (Helpers.H.IsDefined(this.Name) && !Helpers.String.IsNullOrEmpty(this.Title) ? "\n" + this.Title : Helpers.String.Empty);
            }
            return this.Title;
        }

        public LatLngPosition(): google.maps.LatLng {
            if (Helpers.H.IsDefined(this.Position)) {
                return new google.maps.LatLng(parseFloat(this.Position.split(',')[0]), parseFloat(this.Position.split(',')[1]));
            }
            return new google.maps.LatLng(0, 0);
        }

        private GetMarkerOptions() : google.maps.MarkerOptions {
            return {
                clickable: this.Clickable,
                draggable: this.Draggable,
                visible: this.Visible,
                icon: this.Icon,
                title: this.GetDisplayTitle(),
                zIndex: this.ZIndex,
                position: this.LatLngPosition()//(Helpers.H.IsDefined(this.Position, new google.maps.LatLng(0,0), new google.maps.LatLng(parseFloat(this.Position.split(',')[0]), parseFloat(this.Position.split(',')[1])))
            };
        }

        public Update(updateMapsMarker: bool = false): void {
            var marker = this.MapsMarker();
            if (!updateMapsMarker) {
                this.Visible = marker.getVisible();
                this.Draggable = marker.getDraggable();
                this.Clickable = marker.getClickable();
                this.ZIndex = marker.getZIndex();
                this.Icon = (marker.getIcon() == null ? null : marker.getIcon().toString());
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

        //#region __Setters
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

        public SetContent(content: string): void {
            this.Content = content;
        }

        public SetName(name: string): void {
            this.Name = name;
            this.Update(true);
        }
        //#endregion
        //#region __Getters
        public GetContent(): string {
            return this.Content;
        }

        public GetName(): string {
            return this.Name;
        }

        public GetLink(): string {
            return this.Link;
        }

        public GetPosition(): string {
            return this.Position;
        }

        public GetIcon(): string {
            return this.Icon;
        }
        //#endregion

        public SetMapsPosition(position: any, position2: any): void;
        public SetMapsPosition(position: google.maps.LatLng): void;
        public SetMapsPosition(position: any, position2?: any): void {
            if (Helpers.H.IsDefined(position2)) {
                this.Position = position + "," + position2;
            } else {
                this.Position = position.toString().replace('(', '').replace(')', '');
            }
            this.Update(true);
        }

        public MapsMarker(): google.maps.Marker {
            if (!Helpers.H.IsDefined(FakeState.Markers[this.Id])) {
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

    // Map options for rendering the map
    // Zoom, center, mapTypeId
    export class MapOptions implements Maps.IMapOptions {
        Zoom: number = Maps.Core.DefaultValues.Map.Zoom;
        Center: string = Maps.Core.DefaultValues.Map.Center;
        MapTypeId: google.maps.MapTypeId = google.maps.MapTypeId.ROADMAP;
    
        // mapOptions = json object
        constructor (mapOptions?: any) {
            if (Helpers.H.IsDefined(mapOptions)) {
                this.Zoom = Helpers.H.IfDefined(mapOptions.Zoom, this.Zoom);
                this.Center = Helpers.H.IfDefined(mapOptions.Center, this.Center);
                this.MapTypeId = Helpers.H.IfDefined(mapOptions.MapTypeId, google.maps.MapTypeId.ROADMAP); // TODO: Works?
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
    export class MapSettings implements Maps.IMapSettings {
        /// <summary>
        /// Map settings class for storing settings for the map.
        /// This class may be serialized to store settings as json or other 
        /// types of data representation methods.
        /// </summary>
        
        Markers: Marker[];
        CoreSettings: Maps.Core.CoreSettings;
        MapOptions: MapOptions;

        Width: number;
        Height: number;

        constructor (mapSettings?: any /* Json object */) {
            this.Markers = new Array();

            if (Helpers.H.IsDefined(mapSettings)) {
                // Parse markers
                if (Helpers.H.IsDefined(mapSettings.Markers)) {
                    for (var i = 0; i < mapSettings.Markers.length; i++) {
                        this.Markers.push(Marker.FromObject(mapSettings.Markers[i]));
                    }
                }

                if (Helpers.H.IsDefined(mapSettings.MapOptions)) {
                    this.MapOptions = new MapOptions(mapSettings.MapOptions);
                }
                else {
                    this.MapOptions = new MapOptions();
                }

                if (Helpers.H.IsDefined(mapSettings.CoreSettings)) {
                    this.CoreSettings = new Maps.Core.CoreSettings(mapSettings.CoreSettings);
                }
                else {
                    this.CoreSettings = new Maps.Core.CoreSettings();
                }
            }

        }
    }

    // Settings for rendering the map
    export class RenderSettings implements Maps.IRenderSettings {
        MapSettings: MapSettings;
        ContainerId: string;

        // ContainerId = container id for the map
        // mapSettings = mapsettings for the map
        constructor (ContainerId: string,  mapSettings: MapSettings) {
            if (!Helpers.H.IsDefined(ContainerId)) {
                throw new Helpers.ArgumentException("ContainerId must be defined");
            }

            this.ContainerId = ContainerId;

            // Convert the MapSettings to the correct object
            if (Helpers.H.IsDefined(mapSettings)) {
                this.MapSettings = new MapSettings(mapSettings);
            }
            else {
                this.MapSettings = new MapSettings();
            }
        }
    }

    export class MapState implements Maps.IMapState {
        ContainerId: string;
        
        Map: google.maps.Map;
        MapSettings: MapSettings;
        Listeners: Maps.IMapStateListener[];
        
        Initialized: bool = false;
        UpdatedBounds: bool = false;

        Projection: google.maps.MapCanvasProjection;
        Overlay: google.maps.OverlayView;

        //Panorama: google.maps.StreetViewPanorama;

        constructor (settings: RenderSettings, listeners?: Maps.IMapStateListener[]) {
            this.ContainerId = settings.ContainerId;
            //this.UserCustomizable = settings.UserCustomizable;
            this.MapSettings = settings.MapSettings;
            this.Listeners = Helpers.H.IfDefined(listeners, []);
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
    export class GoogleMap implements Maps.IMap {
        State: MapState;

        constructor (settings: RenderSettings, listeners?: Maps.IMapStateListener[]) {
            if (settings == null) {
                throw new Helpers.MissingArgumentException("settings (IRenderSettings) must be set");
            } 
            if (document.getElementById(settings.ContainerId) == null) {
                throw new Helpers.InvalidArgumentException("Invalid GoogleMap container id");
            }

            // Create our MapState
            this.State = new MapState(settings, listeners);
            this.State.Overlay = new google.maps.OverlayView();
            this.State.Overlay.draw = function () { };
        }

        public GetContainerId(): string {
            return this.State.ContainerId;
        }

        private RegisterEvents(): void {
            /// <summary>
            /// Registers events for the map.
            /// When an event has been performed listeners will be notified of this.
            /// </summary>
            Helpers.L.Log("Registering events", this);
            var ghost = this;

            google.maps.event.addListener(this.State.Map, 'click', function (e) {
                ghost.State.Update();
                for (var i = 0; i < ghost.State.Listeners.length; i++) {
                    ghost.State.Listeners[i].StateChangedEvent(ghost, Maps.Core.STATE_CHANGE.MAP_LEFT_CLICK, e);
                }
            });

            google.maps.event.addListener(this.State.Map, 'rightclick', function (e) {
                ghost.State.Update();
                for (var i = 0; i < ghost.State.Listeners.length; i++) {
                    ghost.State.Listeners[i].StateChangedEvent(ghost, Maps.Core.STATE_CHANGE.MAP_RIGHT_CLICK, e);
                }
            });

            google.maps.event.addListener(this.State.Map, 'center_changed', function (e) {
                ghost.State.Update();
                for (var i = 0; i < ghost.State.Listeners.length; i++) {
                    ghost.State.Listeners[i].StateChangedEvent(ghost, Maps.Core.STATE_CHANGE.CENTER_CHANGED, e);
                }
            });

            google.maps.event.addListener(this.State.Map, 'zoom_changed', function (e) {
                ghost.State.Update();
                for (var i = 0; i < ghost.State.Listeners.length; i++) {
                    ghost.State.Listeners[i].StateChangedEvent(ghost, Maps.Core.STATE_CHANGE.ZOOM_CHANGED, e);
                }
            });

            google.maps.event.addListener(this.State.Map, 'maptypeid_changed', function () {
                ghost.State.Update();
                for (var i = 0; i < ghost.State.Listeners.length; i++) {
                    ghost.State.Listeners[i].StateChangedEvent(ghost, Maps.Core.STATE_CHANGE.MAPTYPEID_CHANGED);
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

        public FitMarkerBounds(markers?: Marker[]): void {
            var latlngbounds = new google.maps.LatLngBounds();
            if (!Helpers.H.IsDefined(markers)) {
                markers = this.GetMarkers();
            }
            for (var i = 0; i < markers.length; i++) {
                latlngbounds.extend((<Marker>markers[i]).MapsMarker().getPosition());
            }
            this.FitBounds(latlngbounds);
        }

        public FitBounds(bounds: any): void {
            this.GetMap().fitBounds(bounds);
        }

        public AddListener(listener: Maps.IMapStateListener): void {
            for (var i = 0; i < this.State.Listeners.length; i++) {
                if (this.State.Listeners[i] == listener) {
                    return;
                }
            }
            this.State.Listeners.push(listener);

            if (this.IsInitialized()) {
                listener.InitializationDoneEvent(this);
            }
        }

        public RemoveListener(listener: Maps.IMapStateListener): void {
            for (var i = 0; i < this.State.Listeners.length; i++) {
                if (this.State.Listeners[i] == listener) {
                    this.State.Listeners.splice(i, 1);
                    return;
                }
            }
        }

        public CreateMarker(latLng: google.maps.LatLng, pushMarker = true, notifyObservers = true): Marker {
            var marker = new Marker();
            if (pushMarker) {
                this.State.MapSettings.Markers.push(marker);
            }
            marker.MapsMarker().setMap(this.State.Map);
            if (notifyObservers) {
                for (var i = 0; i < this.State.Listeners.length; i++) {
                    this.State.Listeners[i].MarkerAddedEvent(this, marker);
                }
            }
            return marker;
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

        public GetMap(): google.maps.Map {
            return this.State.Map;
        }

        //public Initialize(): void;
        public Initialize(mapOptions?: MapOptions): void {
            Helpers.L.Log("Initializing map", this, this.State.ContainerId);

            var ghost = this;

            // Create our map
            this.State.Map = new google.maps.Map(
                                    document.getElementById(this.State.ContainerId),
                                    (Helpers.H.IsDefined(mapOptions) ? mapOptions : this.State.MapSettings.MapOptions.AsGoogleMapOptions())
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
                if (Helpers.H.IsDefined(this.State.MapSettings.Markers)) {
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

        public GetMapWrapper(): JQuery {
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

        public GetMarkers(): Marker[] {
            return this.State.MapSettings.Markers;
        }

        public IsInitialized(): bool {
            /// <summary>
            /// Returns True if the map have been initialized, False otherwise
            /// </summary>
            return this.State.Initialized;
        }
    }
}