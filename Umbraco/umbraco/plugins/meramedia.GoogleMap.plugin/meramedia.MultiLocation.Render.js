/**
 * Rendering method for a specfic map set in the meramedia.RenderSetting
 */
meramedia.GoogleMaps.Render = function () {
    var container = meramedia.RenderSettings.Container;

    // Render map
    var content = meramedia.RenderSettings.Object;
    var container = document.getElementById(meramedia.RenderSettings.Container);
    var mapOptions = (content == null) ? null : { zoom: content.Zoom, mapTypeId: content.MapTypeId, center: new google.maps.LatLng(content.Center.split(',')[0], content.Center.split(',')[1]) };
    var id = meramedia.RenderSettings.MapContainer;

    var markers = [];
    if (content != null) {
        $.each(content.Markers, function (i) {
            markers.push(this);
        });
    }

    // Create the map in our context
    var map = new GoogleMap(id, mapOptions, null, null, markers);
    map.container = document.getElementById(meramedia.RenderSettings.MapContainer);
    map.SetUserCustomizable(false);
    map.Initialize();

    if (meramedia.RenderSettings.AutoFit)
        map.ZoomToFit();
};

