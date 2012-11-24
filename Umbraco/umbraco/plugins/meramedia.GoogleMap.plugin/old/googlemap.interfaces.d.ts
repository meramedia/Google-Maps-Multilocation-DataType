/// <reference path="../libs/google.maps.d.ts"/>
/// <reference path="googlemaps.ts"/>
interface IMapStateListener {
    StateChangedEvent(map: Meramedia.GoogleMaps.GoogleMap, event?: string): void;
    LocationCreatedEvent(map: Meramedia.GoogleMaps.GoogleMap, location: Meramedia.GoogleMaps.Marker): void;
    ForcedSaveEvent(map: Meramedia.GoogleMaps.GoogleMap): void;
    MarkerRemovedEvent(map: Meramedia.GoogleMaps.GoogleMap, marker: Meramedia.GoogleMaps.Marker): void;
    MapInitializationDoneEvent(map: Meramedia.GoogleMaps.GoogleMap): void;
    MarkerCreatedEvent(map: Meramedia.GoogleMaps.GoogleMap, marker: Meramedia.GoogleMaps.Marker): void;
    MarkerUpdatedEvent(map: Meramedia.GoogleMaps.GoogleMap, marker: Meramedia.GoogleMaps.Marker): void;
}

interface IMapsMarker {
    /* Methods */
    UpdateTitle(): void;
    GetMarkerOptions(): google.maps.MarkerOptions;

    /* Internal */
    //LatLngPosition : google.maps.LatLng;
    //GoogleMarker: google.maps.Marker;
}

interface IMarkerIcon {
    Id: number;
    Url: string;
}