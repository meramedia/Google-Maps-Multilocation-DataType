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

    // Create the map in our context
    var map = new GoogleMap(id, mapOptions, null, []);
    map.container = document.getElementById(meramedia.RenderSettings.MapContainer);
    map.Initialize();

    // Fetch markers from saved content
    if (content != null) {
        $.each(content.Markers, function () {
            map.CreateMarker( 
                null,
                (this.Name == undefined ? null : this.Name),
                null,
                map.map,
                {
                    clickable: true,
                    draggable: false,
                    position: new google.maps.LatLng(this.Position.split(',')[0], this.Position.split(',')[1]),
                    title: this.Title,
                    visible: true,
                    icon: (this.Icon == undefined) ? null : this.Icon,
                    zIndex: 10
                }
            );
        });
    }
};

