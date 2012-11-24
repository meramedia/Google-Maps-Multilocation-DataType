/// <reference path="libs/google.maps.d.ts" />
/// <reference path="libs/jquery.d.ts" />
/// <reference path="googlemaps.ts" />
function MeramediaGoogleMapsRender(): void {
    var settings = Meramedia.GoogleMaps.StaticRenderSettings;
    var map = new Meramedia.GoogleMaps.GoogleMap((settings == undefined ? new Meramedia.GoogleMaps.RenderSettings("map_0"): settings));
    map.Initialize();
}