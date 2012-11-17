/// <reference path="libs/google.maps.d.ts" />
module Meramedia.GoogleMaps {
    interface IMapStateListener {
        RerenderDoneEvent(map: IMap);
        InitializationDoneEvent(map: IMap): void;
        MarkerAddedEvent(map: IMap, marker: IMapsMarker): void;
        MarkerRemovedEvent(map: IMap, marker: IMapsMarker): void;

        StateChangedEvent(map: IMap, state: any /*STATE_CHANGE*/, e?: any): void;
    }

    interface IMapsMarker {
        Id: number;
        Name: string;
        Clickable: bool;
        Visible: bool;
        Draggable: bool;
        ZIndex: number;
        Position: any; // google.maps.LatLng

        Content: string;

        Icon: string;
        Link: string;

        GetMarkerOptions(): any;//google.maps.MarkerOptions;
        GetDisplayTitle(): string;
        ToGoogleMapsMarker(): any;//google.maps.Marker;
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
        IsInitialized(): bool;

        MapContainer(): JQuery;
    }
}