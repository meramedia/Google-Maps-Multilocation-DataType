/// <reference path="libs/google.maps.d.ts" />
/// <reference path="libs/jquery.d.ts" />
/// <reference path="libs/meramedia.maps.d.ts" />
/// <reference path="meramedia.Helpers.d.ts" />
/// <reference path="core/meramedia.Maps.Core.d.ts" />
module Meramedia.GoogleMaps {
    class FakeState {
        static Markers: google.maps.Marker[];
    }
    class Marker implements Maps.IMapsMarker {
        static NextId;
        public Id: number;
        private Name;
        private Title;
        private Visible;
        private Draggable;
        private Clickable;
        private ZIndex;
        private Link;
        private Icon;
        private Position;
        private Content;
        public ClickEvent: (m: Marker, m2: google.maps.Marker, e: google.maps.UIEvent) => void;
        public RightClickEvent: (m: Marker, m2: google.maps.Marker, e: google.maps.UIEvent) => void;
        public DragEndEvent: (m: Marker, m2: google.maps.Marker, e: google.maps.UIEvent) => void;
        public DragStartEvent: (m: Marker, m2: google.maps.Marker, e: google.maps.UIEvent) => void;
        public ValueUpdatedEvent: (m: Marker) => void;
        constructor ();
        static FromObject(markerOptions: any): Marker;
        public GetDisplayTitle(): string;
        public LatLngPosition(): google.maps.LatLng;
        private GetMarkerOptions();
        public Update(updateMapsMarker?: bool): void;
        public SetIcon(icon: string): void;
        public SetTitle(title: string): void;
        public SetVisible(visible: bool): void;
        public SetDraggable(draggable: bool): void;
        public SetLink(link: string): void;
        public SetPosition(position: string): void;
        public SetClickable(clickable: bool): void;
        public SetContent(content: string): void;
        public SetName(name: string): void;
        public GetContent(): string;
        public GetName(): string;
        public GetLink(): string;
        public GetPosition(): string;
        public GetIcon(): string;
        public SetMapsPosition(position: any, position2: any): void;
        public SetMapsPosition(position: google.maps.LatLng): void;
        public MapsMarker(): google.maps.Marker;
    }
    class MapOptions implements Maps.IMapOptions {
        public Zoom: number;
        public Center: string;
        public MapTypeId: google.maps.MapTypeId;
        constructor (mapOptions?: any);
        private GetCenterAsLatLng();
        public AsGoogleMapOptions(): google.maps.MapOptions;
    }
    class MapSettings implements Maps.IMapSettings {
        public Markers: Marker[];
        public CoreSettings: Maps.Core.CoreSettings;
        public MapOptions: MapOptions;
        public Width: number;
        public Height: number;
        constructor (mapSettings?: any);
    }
    class RenderSettings implements Maps.IRenderSettings {
        public MapSettings: MapSettings;
        public ContainerId: string;
        constructor (ContainerId: string, mapSettings: MapSettings);
    }
    class MapState implements Maps.IMapState {
        public ContainerId: string;
        public Map: google.maps.Map;
        public MapSettings: MapSettings;
        public Listeners: Maps.IMapStateListener[];
        public Initialized: bool;
        public UpdatedBounds: bool;
        public Projection: google.maps.MapCanvasProjection;
        public Overlay: google.maps.OverlayView;
        constructor (settings: RenderSettings, listeners?: Maps.IMapStateListener[]);
        public Update(): void;
    }
    class GoogleMap implements Maps.IMap {
        public State: MapState;
        constructor (settings: RenderSettings, listeners?: Maps.IMapStateListener[]);
        public GetContainerId(): string;
        private RegisterEvents();
        public FitMarkerBounds(markers?: Marker[]): void;
        public FitBounds(bounds: any): void;
        public AddListener(listener: Maps.IMapStateListener): void;
        public RemoveListener(listener: Maps.IMapStateListener): void;
        public CreateMarker(latLng: google.maps.LatLng, pushMarker?: bool, notifyObservers?: bool): Marker;
        public AddMarker(marker: Marker, pushMarker?: bool, notifyObservers?: bool): void;
        public RemoveMarker(marker: Marker): void;
        public GetMap(): google.maps.Map;
        public Initialize(mapOptions?: MapOptions): void;
        public GetMapWrapper(): JQuery;
        public GetState(): MapState;
        public GetMarkers(): Marker[];
        public IsInitialized(): bool;
    }
}
