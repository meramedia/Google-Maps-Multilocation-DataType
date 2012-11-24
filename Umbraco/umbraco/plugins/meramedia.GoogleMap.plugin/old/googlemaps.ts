/// <reference path="../libs/google.maps.d.ts" />
/// <reference path="../libs/jquery.d.ts" />
/// <reference path="googlemap.interfaces.d.ts"/>
var google = { maps: { Marker: {}, event: {} } }
module Meramedia.GoogleMaps {
    declare var MapsLoaded: bool;
    var DebugSession: bool = true;
    MapsLoaded = false;

    // TODO: Make this a bit cleaner and move it to some other "per-instance" setting
    export declare var StaticRenderSettings: RenderSettings;

    //#region Logging/Debugging

    // Declare console.log
    var internalConsole = (typeof console === 'undefined' || console == null) ? 
    {
        log: function() { },
        error: function() { },
        warn: function () { },
        info: function() { }
    } : console;

    export class JSONProvider {
        Parse(json: string) : any {
            return null;
        }

        Serialize(obj: any): string {
            return "";
        }
    }

    /**
        Class for logging / debugging
    */
    export class L {
        public static Log(msg: string, from?: any, optionalParameters?: any): void {
            WriteTo(msg, internalConsole.log, from, optionalParameters);
        }

        public static Debug(msg: string, from?: any, optionalParameters?: any): void {
            WriteTo("[DEBUG] " + msg, internalConsole.info, from, optionalParameters);
        }

        public static Warn(msg: string, from?: any, optionalParameters?: any): void {
            WriteTo(msg, internalConsole.warn, from, optionalParameters);
        }

        public static Error(msg: string, from?: any, optionalParameters?: any): void {
            WriteTo(msg, internalConsole.error, from, optionalParameters);
        }

        public static Info(msg: string, from?: any, optionalParameters?: any): void {
            WriteTo(msg, internalConsole.warn, from, optionalParameters);
        }

        public static Wtf(msg: string, from?: any, optionalParameters?: any): void {
            WriteTo(msg, internalConsole.error, from, optionalParameters);
        }

        private static WriteTo(msg: string, callMethod: (x?: any, y?: any) => void, from: Object, optionalParameters?: any): void {
            if (IsDebug()) {
                try {
                    if (!Helpers.IsDefined(optionalParameters)) {
                        callMethod.call(internalConsole, GetFrom(from) + msg);
                    }
                    else {
                        callMethod.call(internalConsole, GetFrom(from) + msg, optionalParameters);
                    }
                }
                catch(e) {
                    // IE
                    //console.log(GetFrom(from) + msg);
                }
            }
        }

        private static GetFrom(from?: any): string {
            var name = null;
            if(typeof from == "function") {
                name = from.name;
            }
            else {
                if (from != undefined && from != null) {
                    name = typeof from;
                }
            }

            return (name != null ? name + " " : "Meramedia.GoogleMaps: ");
        }

        private static IsDebug(): bool {
            return (DebugSession);
        }
    }
    //#endregion

    /* 
        Google maps marker
    */
    export class Marker implements IMapsMarker {
        public Id: number;
        public Name: string;
        public Title: string;
        public Position: string;
        public Icon: string;
        public Link: string;

        public Clickable: bool = true;
        public Draggable: bool = false;
        public Visible: bool = true;
        public Zindex: number = 10;

        private Marker: google.maps.Marker;

        //public Content: string; // Not currently in use

        constructor (
            location?: Marker, 
            name?: any = null, 
            title?: string = null, 
            position?: string = "64,22", 
            icon?: string = null, 
            link?: string = null, 
            content?: string = null
        ) {
            if (Helpers.IsDefined(location)) {
                this.Name = location.Name;
                this.Title = location.Title;
                this.Position = location.Position
                this.Icon = location.Icon;
                this.Link = location.Link;
                //this.Content = location.Content;
            }
            else {
                this.Name = name;
                this.Title = title;
                this.Position = position;
                this.Icon = icon;
                this.Link = link;
                //this.Content = content;
            }
        }

        private UpdateTitle() : void {
            this.GetGoogleMarker().setTitle((this.Name != null ? this.Name + "\n" : "") + (this.Title != null ? this.Title : ""));
        }

         /*
            Returns the location position as a google.maps.LatLng object
        */
        public GetLatLngPosition() : google.maps.LatLng {
            return new google.maps.LatLng(parseFloat(this.Position.split(",")[0]), parseFloat(this.Position.split(",")[1]));
        }

        public SetLatLngPosition(value: google.maps.LatLng) {
            this.Position = value.lat + "," + value.lng;
        }

        public UpdateMarkerOptions(): void {
            this.GetGoogleMarker().setOptions(this.GetMarkerOptions());
        }

        private GetMarkerOptions(): google.maps.MarkerOptions {
            return {
                clickable: this.Clickable,
                draggable: this.Draggable,
                position: this.GetLatLngPosition(),
                title: (this.Name != null ? this.Name + "\n" : "") + (this.Title != null ? this.Title : ""),
                visible: true,
                zIndex: this.Zindex,
                icon: (Helpers.IsDefined(this.Icon) ? this.Icon : null)
            };
        }

        public GetGoogleMarker(): google.maps.Marker {
             if(!Helpers.IsDefined(this.Marker)) {
                this.Marker = new google.maps.Marker();
            }
            this.Marker.setOptions(this.GetMarkerOptions());
            return this.Marker;
        }
    }

    //#region Settings classes

    /*
        Core settings.
        This is the backoffice settings to prevent users from adding more than x markers etc.
    */
    export class CoreSettings {
        AllowCustomLinks: bool;
        MaxMarkers: number = -1;
        MinMarkers: number = 0;
        DefaultWidth: number = 500;
        DefaultHeight: number = 500;

        constructor(coreSettings?: CoreSettings) {
            if(coreSettings != null && coreSettings != undefined) {
                this.AllowCustomLinks = coreSettings.AllowCustomLinks;
                this.MaxMarkers = Helpers.IfDefined(coreSettings.MaxMarkers, this.MaxMarkers);
                this.MinMarkers = Helpers.IfDefined(coreSettings.MinMarkers, this.MinMarkers);
                this.DefaultHeight = Helpers.IfDefined(coreSettings.DefaultHeight, this.DefaultHeight);
                this.DefaultWidth = Helpers.IfDefined(coreSettings.DefaultWidth, this.DefaultWidth);
            }
        }
    }

    export class MapSettings {
        public Markers: Marker[] = [];
        public CoreSettings: CoreSettings;
        public MapOptions: MapOptions = new MapOptions();

        //public GetHeight(): number {
        //    return this._Height;
        //}

        //public SetHeight(value: number) {
        //    return this._Height;
        //}

        //public GetWidth() : number {
        //    return this._Width;
        //}

        //public SetWidth(value: number) {
        //    this._Width = value;
        //}

        public Width: number;
        public Height: number;

        constructor(mapSettings?: MapSettings) {
            this.Markers = [];
            if (Helpers.IsDefined(mapSettings)) {
                // Copy markers
                if (Helpers.IsDefined(mapSettings.Markers)) {
                    for (var i = 0; i < mapSettings.Markers.length; i++) {
                        this.Markers.push(new Marker(mapSettings.Markers[i]));
                    }
                }

                // Copy other settings
                this.CoreSettings = new CoreSettings(mapSettings.CoreSettings);
                this.MapOptions = new MapOptions(mapSettings.MapOptions);
                this.Width = (Helpers.IfDefined(mapSettings.Width, 500));
                this.Height = (Helpers.IfDefined(mapSettings.Height, 500));
            }
        }
    }

    /*
        Class describing specific options for a GoogleMap instance
    */
    export class MapOptions {
        Zoom: number = 12;
        Center: string = "0,0"; // LatLng as string "latitude,longitude"
        MapTypeId: google.maps.MapTypeId;

        constructor (options?: any) { 
            if(options != null && options != undefined) {
                this.Zoom = Helpers.IfDefined(options.zoom, this.Zoom);
                this.Center = Helpers.IfDefined(options.center, this.Center);

                this.MapTypeId = <google.maps.MapTypeId>Helpers.IfDefined(options.mapTypeId, "roadmap");
            }
        }

        public ToGoogleMapOptions() : google.maps.MapOptions {
            return {
                zoom: this.Zoom,
                center: new google.maps.LatLng(parseFloat(this.Center.split(",")[0]), parseFloat(this.Center.split(",")[1])),
                mapTypeId: this.MapTypeId
            };
        }
    }

    /*
        Describes settings used for rendering the map
    */
    export class RenderSettings {
        public ContainerId: string; // ex. "gmapContainer_0"
        public MapSettings: MapSettings;
        public UserCustomizable : bool;

        constructor(containerId: string, mapSettings?: any /* json entry */, userCustomizable?: bool = false) {
            if(!Helpers.IsDefined(containerId)) {
                L.Error("Container id must be set", this, containerId);
                throw "ContainerId must be set!";
            }

            this.ContainerId = containerId;
            this.UserCustomizable = userCustomizable;
            if (mapSettings != undefined) {
                this.MapSettings = new MapSettings(mapSettings);
            }
            else {
                this.MapSettings = new MapSettings();
            }
        }
    }

    //#endregion

    //#region Internal classes 

    /*
        Current state of the map
    */
    class MapState {
        Initialized: bool = false; // Initialization flag
        UpdatedBounds: bool = false; // Update bounds flag
        UserCustomizable: bool = false;
        Map: google.maps.Map;
        MapSettings: MapSettings;
        ContainerId: string;
        Listeners: IMapStateListener[] = [];

        Markers: Marker[] = [];
        //SearchMarkers: Marker[];

        NumMarkers: number;

        constructor(
                    userCustomizable?: bool = false, 
                    mapSettings?: MapSettings = new MapSettings(), 
                    listeners?: IMapStateListener[] = [],
                    markers?: Marker[] = [],
                    searchMarkers?: Marker[] = []
        ) {
            this.NumMarkers = 0;
            this.UserCustomizable = userCustomizable;
            this.MapSettings = mapSettings;
            this.Listeners = listeners;
            this.Markers = markers;

            //this.SearchMarkers = searchMarkers;
        }
    }

    //#region Helpers

    export class Helpers {
        public static IfDefined(input: any, standard: any) : any {
            return (input == undefined || input == null ? standard : input);
        }

        public static IsNullOrEmpty(input: string) : bool {
            return !IsDefined(input) || input == "";
        }

        public static IsDefined(input: any) : bool {
            return (typeof input !== undefined && input != null);
        }
    }

    //#endregion

    //#endregion

    /*
        Google maps class.
    */
    export class GoogleMap {
        // Current state of the map
        private State: MapState;

        // Current id for generated ids
        private static CurrentLocationId: number = 0;

        constructor (settings: RenderSettings, listeners?: IMapStateListener[]/*, markers: Location[]*/) {
            if (settings == null)
                throw "ArgumentException: Settings must not be null";
            if (document.getElementById(settings.ContainerId) == null)
                throw "Exception: Invalid GoogleMap container";

            this.State = new MapState();
            this.State.ContainerId = settings.ContainerId;

            // Set our listeners if there are any
            if (Helpers.IsDefined(listeners)) {
                this.State.Listeners = Helpers.IfDefined(listeners, new IMapStateListener[]);
            }

            // Set the maps settings if there are any
            if (Helpers.IsDefined(settings.MapSettings)) {
                this.State.MapSettings = settings.MapSettings;
            }

            // Set user customizable
            this.State.UserCustomizable = settings.UserCustomizable;
            this.SetUserCustomizable(this.State.UserCustomizable);
        }

        /*
            Calls all listeners and calls the "ForcedSaveEvent"
        */
        public ForceSave(): void {
            for (var i = 0; i < this.State.Listeners.length; i++) {
                this.State.Listeners[i].ForcedSaveEvent(this);
            }
        }

        //#region Listeners

        /* 
            Add a map listener 
        */
        public AddListener(listener: IMapStateListener): void {
            this.State.Listeners.push(listener);
        }

        /*
            Remove a map listener
        */
        public RemoveListener(listener: IMapStateListener): void {
            var index = -1;
            var currentIndex = 0;
            for (var i = 0; i < this.State.Listeners.length; i++) {
                if (this.State.Listeners[i] == listener) {
                    delete this.State.Listeners[i];
                    break;
                }
            }
        }

        //#endregion

        public GetAllowCustomLinks() : bool {
            return this.State.MapSettings.CoreSettings.AllowCustomLinks;
        }

        /*
            Zooms the map to the correct center location
            and fits all markers within this view.
        */
        public ZoomToFit(): void {
            var bounds = new google.maps.LatLngBounds();

            for(var i = 0; i < this.State.Markers.length; i++) {
                bounds.extend(this.State.Markers[i].GetLatLngPosition());
            }

            // Fit the map to the calculated bounds
            this.State.UpdatedBounds = true;
            this.State.Map.fitBounds(bounds);
        }

        public RemoveMarker(marker: Marker): void {
            // Remove marker from map
            if (!Helpers.IsDefined(marker)) {
                L.Error("Trying to remove non-existing marker");
                return;
            }
            //marker.GetGoogleMarker().setMap(null);
            delete this.State.Markers[marker.Id];
            this.State.NumMarkers--;
        }

        public RemoveAllMarkers(): void {
            L.Log("Removing markers", this);
            for (var i = 0; i < this.State.Markers.length; i++) {
                this.RemoveMarker(this.State.Markers[i]);
            }
        }

        //#region Markers

        /* 
            Create a marker from a location
        */
        public CreateMarker(marker: Marker, addToMap?: bool = true): Marker {
            if(!Helpers.IsDefined(marker)) {
                L.Error("You must provide a location marker", this);
                throw "You must provide a location marker";
            }

            if(!Helpers.IsDefined(marker.Position)) {
                L.Error("Position/Location must be set for CreateMarker", this, marker);
                throw "Position/Location must be set for CreateMarker";
            }

            // Check that we may add a marker to the map
            if(<bool>Helpers.IfDefined(addToMap, true)) {
                L.Info("Adding the newly created marker to the map");
                if(this.GetCoreSettings().MaxMarkers != -1 && this.State.Markers.length >= this.GetCoreSettings().MaxMarkers) {
                    L.Error("Maximum number of markers have been reached " + this.GetCoreSettings().MaxMarkers);
                    alert("You may only add " + this.GetCoreSettings().MaxMarkers + " markers to the map");
                    return null;
                }
            }

            // Create the marker (with specific options)
            marker.Id = GoogleMap.GetNextMarkerId();
            marker.Name = marker.Name;
            marker.Title = marker.Title;

            // Add the marker to the map if this option is set
            if (addToMap) {
                // Add the marker to the map
                var ghost = this;
                marker.GetGoogleMarker().setMap(this.State.Map);
                for (var i = 0; i < this.State.Listeners.length; i++) {
                    this.State.Listeners[i].MarkerCreatedEvent(this, marker);
                }

                // Register marker events
                this.RegisterMarkerEvents(marker); 

                // Add markers
                this.State.Markers[marker.Id] = marker;
                this.State.NumMarkers++;

                L.Log("Added marker to the current map", this);
            }
            else {
                L.Warn("Skipping the process of adding the marker to the map!", this);
            }

            L.Log("Created marker", this, marker);

            return marker;
        }

        //#endregion

        /*
            Force a map re-render
        */
        public Rerender(): void {

        }

        //#region Initialization

        /*
            Initialized the map with the given options.
            If no options are given the options given in the GoogleMap constructor (rendersettings) are used.
            If there are no render settings exceptions are thrown
        */
        public Initialize(): void;
        public Initialize(mapOptions?: MapOptions, markers?: Marker[], rerender?: bool): void {
            L.Debug("Rendering map", this);
            if(this.State.Initialized && (rerender == undefined || !rerender)) {
                L.Warn("GoogleMap " + this.State.ContainerId + " is already initialized", this);
                return; // Already initialized
            }

            L.Debug("Map is not initialized, running initialization", this, ",IsMapOptionsDefined: " + Helpers.IsDefined(mapOptions));


            // Check if we have any specific MapOptions set
            if(!Helpers.IsDefined(mapOptions)) {
                if (Helpers.IsDefined(this.State.MapSettings.MapOptions)) {
                    // We have rendersettings options set
                    mapOptions = this.GetMapSettings().MapOptions;
                }
                else {
                    throw "Huge failure, have no MapOptions to use for rendering";
                    return;
                }
            }

            // Update options
            this.State.MapSettings.MapOptions = mapOptions;

            L.Log("Trying to create map instance with options", this);

            // Create our map
            this.State.Map = new google.maps.Map(
                                    document.getElementById(this.State.ContainerId), 
                                    mapOptions.ToGoogleMapOptions()
                             );

            // Register events
            this.RegisterMapEvents(); // Events in back
            this.RegisterGlobalEvents(); // Events in front/back

            // Create our markers
            var ghost : GoogleMap = this;
            L.Log("Notifying listeners about intialization done (Rerender?: " + Helpers.IfDefined(rerender, false) + ")");
            for (var i = 0; i < this.State.Listeners.length; i++) {
                this.State.Listeners[i].MapInitializationDoneEvent(ghost);
            }

            L.Log("Checking if we have markers to add to the map", this, this.GetMapSettings().Markers);

            // Set markers that we are gonna set
            if(!Helpers.IsDefined(markers) && Helpers.IsDefined(this.GetMapSettings().Markers)) {
                markers = this.GetMapSettings().Markers;
            }

            // Add markers to the map
            if(Helpers.IsDefined(markers)) {
                L.Log("Trying to add markers to the map", this, markers);

                var ghost = this;
                for (var i = 0; i < markers.length; i++) {
                    L.Log("Adding 1 more marker to the map", this, markers[i]);
                    var gmarker = ghost.CreateMarker(markers[i]);
                }
            }
        }
        //#endregion

        //#region Events

        /*
            Sets the usercustomizable flag and also reregisters event 
            functions.
        */
        public SetUserCustomizable(newValue: bool) : void {
            L.Log("Settings user customizable", this, newValue);

            this.State.UserCustomizable = newValue;

            if(!newValue) { // No events
                this.RegisterMapEvents = function () {};
                this.RegisterMarkerEvents = function () { };
            }
            else {
                this.RegisterMapEvents = this._RegisterMapEvents;
                this.RegisterMarkerEvents = this._RegisterMarkerEvents;
            }
        }

        /*
            Register base events that we will always need, even if the map is not user customizable
        */
        private RegisterGlobalEvents() : void {
            var ghost = this;

            // Bounds changed, we have probably used the ZoomToFit feature
            google.maps.event.addListenerOnce(this.State.Map, 'bounds_changed', function (event: google.maps.UIEvent) {
                // If we only have one marker we need to zoom out a bit to prevent a really close-up zoom level
                if (ghost.State.NumMarkers == 1 && ghost.State.UpdatedBounds) {
                    ghost.State.UpdatedBounds = false;
                    ghost.State.Map.setZoom(10);
                }
            });
        }


        /*
            Dummy method to bind later for user customizable = true
        */
        private RegisterMarkerEvents(marker: Marker) : void {}


        /*
            Register click/drag events on the given marker
        */
        private _RegisterMarkerEvents(marker: Marker) : void {
            var ghost = this;
            google.maps.event.addListener(marker.GetGoogleMarker(), 'rightclick', function () {
                ghost.RemoveMarker(marker);
            });

            google.maps.event.addListener(marker.GetGoogleMarker(), 'dragend', function () {
                for (var i = 0; i < ghost.State.Listeners.length; i++) {
                    ghost.State.Listeners[i].MarkerUpdatedEvent(ghost, marker);
                }
            });
        }

        /*
            Dummy method to bind later for user customizable = true
        */
        private RegisterMapEvents(): void {}

        /*
            Registers events on the map
        */
        private _RegisterMapEvents(): void {
            // Check if the map should be user customizable (movable markers etc)
            if(!this.State.UserCustomizable) {
                L.Log("Map is not user customizable, skipping event bindings", this);
                return;
            }

            // Bind our events
            var ghost = this;

            // Right click on map
            google.maps.event.addListener(this.GetGoogleMap(), 'rightclick', function (e) {
                L.Log("Creating new marker at " + e.latLng.Ya + "," + e.latLng.Za);
                var location: Marker = new Marker();
                location.Position = e.latLng.Ya + "," + e.latLng.Za;
                ghost.CreateMarker(location);
            });

            // Center has moved
            google.maps.event.addListener(this.GetGoogleMap(), 'center_changed', function (e) {
                for (var i = 0; i < ghost.State.Listeners.length; i++) {
                    ghost.State.Listeners[i].StateChangedEvent(ghost, "center_changed");
                }
            });

            // Zoom level changed
            google.maps.event.addListener(this.GetGoogleMap(), 'zoom_changed', function (e) {
                for (var i = 0; i < ghost.State.Listeners.length; i++) {
                    ghost.State.Listeners[i].StateChangedEvent(ghost, "zoom_changed");
                }
            });

            // Map type changed
            google.maps.event.addListener(this.GetGoogleMap(), 'maptypeid_changed', function (e) {
                for (var i = 0; i < ghost.State.Listeners.length; i++) {
                    ghost.State.Listeners[i].StateChangedEvent(ghost, "maptypeid_changed");
                }
            });
        }

        //#endregion

        //#region Getters 

        /*
            Returns the next location id.
        */
        private static GetNextMarkerId(): number {
            return GoogleMap.CurrentLocationId++;
        }

        /*
            Returns the current mapsettings
        */
        private GetMapSettings() : MapSettings {
            return this.State.MapSettings;
        }

        /*
            Returns the current core settings
        */
        private GetCoreSettings() : CoreSettings {
            return this.State.MapSettings.CoreSettings;
        }

        /*
            Returns the current listeners
        */
        private GetListeners() : IMapStateListener[] {
            return this.State.Listeners;
        }

        /*
            Returns the internal google map
        */
        public GetGoogleMap(): google.maps.Map {
            return this.State.Map;
        }

        /*
            Returns true if the map has been initialized, false otherwise
        */
        public GetIsInitialized(): bool {
            return this.State.Initialized;
        }

        public GetContainerId(): string {
            return this.State.ContainerId;
        }
        //#endregion
    }

    /*
        Loads the google maps api and calls the callback method (given as a string)
    */
    export function LoadMapsApi(cb: string, passThrough?: any, version?: string = "3.9" ) : void {
        if (!MapsLoaded) {
            L.Log("Loading maps API");
            $.ajax(
                "http://maps.google.com/maps/api/js",
                {
                    type: "get",
                    dataType: "script",
                    data: {
                        v: version,
                        libraries: "places",
                        sensor: false,
                        callback: 'tester'
                    },
                    error: function () { alert("Failed to load maps API"); }
                }
            );

            MapsLoaded = true;
        }
        else {
            alert("Already loaded GoogleMaps API");
        }
    }
}
//function tester() {
//    alert("loaded");
//    var google: any;
//    console.log(google);
//    google.setOnLoadCallback('tester');
//}