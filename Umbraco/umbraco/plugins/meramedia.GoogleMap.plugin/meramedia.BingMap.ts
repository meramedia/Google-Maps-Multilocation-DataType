/// <reference path="../../../TypeScript/Google/google.maps.d.ts" />
/// <reference path="../../../TypeScript/JQuery/jquery.d.ts" />
/// <reference path="libs/meramedia.maps.d.ts" />
/// <reference path="meramedia.Helpers.d.ts"/>
/// <reference path="../../../TypeScript/Bing/Microsoft.Maps.All.d.ts"/>
module Meramedia.BingMaps {
    export class BingMarker implements Maps.IMapsMarker {
        Id: any;

        public SetClickable(clickable: bool): void { }
        public SetDraggable(draggable: bool): void { }
        public SetIcon(icon: string): void { }
        public SetLink(link: string): void { }
        public SetTitle(title: string): void { }
        public SetName(name: string): void { }
        public SetMapsPosition(latlng: any): void { } 

        public LatLngPosition(): any { } 

        public GetMarkerOptions(): any { }
        public GetDisplayTitle(): string { return null;  }
        public MapsMarker(): any { }
    }

    export class BingMap implements Maps.IMap {
        State: Maps.IMapState;

        public Initialize(): void;

        public FitMarkerBounds(markers?: Maps.IMapsMarker[]): void {
        
        }

        public FitBounds(bounds: any): void { }
        public CreateMarker(latLng: any, pushMarker?: bool, notifyObservers?: bool): Maps.IMapsMarker { return null; }
        public AddMarker(marker: Maps.IMapsMarker, pushMarker?: bool, notifyObservers?: bool): void { }
        public RemoveMarker(marker: Maps.IMapsMarker): void { }
        public GetMap(): any { return null; }
        public Initialize(mapOptions?: Maps.IMapOptions): void{ }
        public GetMapWrapper(): JQuery { return null; }
        public GetState(): Maps.IMapState { return null; }
        public GetMarkers(): Maps.IMapsMarker[] { return null; }
        public IsInitialized(): bool { return false; }
        public AddListener(listener: Maps.IMapStateListener): void { }
        public RemoveListener(listener: Maps.IMapStateListener): void { }
    }
}