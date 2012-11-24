/// <reference path="google.maps.d.ts" />
module Meramedia.Maps {
    interface IMapStateListener {
        RerenderDoneEvent(map: IMap) : void;
        InitializationDoneEvent(map: IMap): void;
        MarkerAddedEvent(map: IMap, marker: IMapsMarker): void;
        MarkerRemovedEvent(map: IMap, marker: IMapsMarker): void;

        StateChangedEvent(map: IMap, state: any, e?: any): void;
    }

    // Not currently in use
    interface LatLng {
        lat: string;
        lng: string;
    }

    interface IMapsMarker {
        Id: any;

        SetClickable(clickable: bool): void;
        SetDraggable(draggable: bool): void;
        SetIcon(icon: string): void;
        SetLink(link: string): void;
        SetTitle(title: string): void;
        SetName(name: string): void;
        SetMapsPosition(latlng: any): void; // TODO: Some generic position LatLng

        LatLngPosition(): any; // TODO: Some generic position LatLng

        GetMarkerOptions(): any;//google.maps.MarkerOptions;
        GetDisplayTitle(): string;
        MapsMarker(): any;//google.maps.Marker;
    }

    interface IMapState {
        // Initialization flag
        Initialized: bool;

        // Update bounds flag
        UpdatedBounds: bool;
        //UserCustomizable: bool;
        Map: any;
        MapSettings: IMapSettings;
        ContainerId: string;
        Listeners: IMapStateListener[];

        Update(): void;
    }

    interface ICoreSettings {
        AllowCustomLink: bool;
        MaxMarkers: number;
        MinMarkers: number;
        DefaultWidth: number;
        DefaultHeight: number;
    }

    // Interface for the MapOptions settings
    interface IMapOptions {
        Zoom: number;
        Center: string;
        MapTypeId: any;//google.maps.MapTypeId;

        //GetCenterAsLatLng(): google.maps.LatLng;
        //AsGoogleMapOptions(): google.maps.MapOptions;
    }

    // Interface for map settings
    interface IMapSettings {
        Markers: IMapsMarker[];
        CoreSettings: ICoreSettings;//CoreSettings;
        MapOptions: IMapOptions;//MapOptions;

        Width: number;
        Height: number;
    }

    interface IRenderSettings {
        MapSettings: IMapSettings;
        ContainerId: string;
    }

    interface IMap {
        State: IMapState;

        Initialize(): void;

        FitMarkerBounds(markers?: IMapsMarker[]): void;
        FitBounds(bounds: any): void;
        CreateMarker(latLng: any, pushMarker?: bool, notifyObservers?: bool): IMapsMarker;
        AddMarker(marker: IMapsMarker, pushMarker?: bool, notifyObservers?: bool): void;
        RemoveMarker(marker: IMapsMarker): void;
        GetMap(): any; // TODO: Generic map
        Initialize(mapOptions?: IMapOptions): void;
        GetMapWrapper(): JQuery;
        GetState(): IMapState;
        GetMarkers(): IMapsMarker[];
        IsInitialized(): bool;

        AddListener(listener: IMapStateListener): void;
        RemoveListener(listener: IMapStateListener): void;
    }
}