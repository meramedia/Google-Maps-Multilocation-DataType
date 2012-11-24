/// <reference path="libs/google.maps.d.ts" />
/// <reference path="libs/jquery.d.ts" />
/// <reference path="libs/meramedia.maps.d.ts" />
/// <reference path="meramedia.Helpers.d.ts" />
module Meramedia.BingMaps {
    class BingMarker implements Maps.IMapsMarker {
        public Id: any;
        public SetClickable(clickable: bool): void;
        public SetDraggable(draggable: bool): void;
        public SetIcon(icon: string): void;
        public SetLink(link: string): void;
        public SetTitle(title: string): void;
        public SetName(name: string): void;
        public SetMapsPosition(latlng: any): void;
        public LatLngPosition(): any;
        public GetMarkerOptions(): any;
        public GetDisplayTitle(): string;
        public MapsMarker(): any;
    }
    class BingMap implements Maps.IMap {
        public State: Maps.IMapState;
        public Initialize(): void;
        public FitMarkerBounds(markers?: Maps.IMapsMarker[]): void;
        public FitBounds(bounds: any): void;
        public CreateMarker(latLng: any, pushMarker?: bool, notifyObservers?: bool): Maps.IMapsMarker;
        public AddMarker(marker: Maps.IMapsMarker, pushMarker?: bool, notifyObservers?: bool): void;
        public RemoveMarker(marker: Maps.IMapsMarker): void;
        public GetMap(): any;
        public GetMapWrapper(): JQuery;
        public GetState(): Maps.IMapState;
        public GetMarkers(): Maps.IMapsMarker[];
        public IsInitialized(): bool;
        public AddListener(listener: Maps.IMapStateListener): void;
        public RemoveListener(listener: Maps.IMapStateListener): void;
    }
}
