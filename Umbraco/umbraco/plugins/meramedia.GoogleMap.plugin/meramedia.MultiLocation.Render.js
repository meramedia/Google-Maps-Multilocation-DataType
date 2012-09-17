/**
 * Rendering method for a specfic map set in the meramedia.RenderSetting
 */
meramedia.GoogleMaps.Render = function () {
    // Container
    var container = document.getElementById(meramedia.RenderSettings.Container);
    var mapSettings = meramedia.RenderSettings.Object;

    // Create all markers
    var markers = [];
    if (mapSettings  != null) {
        $.each(mapSettings.Markers, function (i) {
            markers.push(this);
        });
    }
    else {
        mapSettings = new MapSettings();
    }

    // Not user customizable as we are outside of the backoffice
    mapSettings.UserCustomizable = false;

    // Create the map in our context
    var map = new GoogleMap(
        meramedia.RenderSettings.MapContainer,
        mapSettings,
        null,
        markers
    );

    map.container = document.getElementById(meramedia.RenderSettings.MapContainer);
    map.Initialize();

    if (meramedia.RenderSettings.AutoFit)
        map.ZoomToFit();
};

