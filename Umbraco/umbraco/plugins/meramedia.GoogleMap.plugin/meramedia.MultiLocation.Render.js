/**
 * Rendering method for a specfic map set in the meramedia.RenderSetting
 */
function RenderFrontendMap() {
    var renderSettings = meramedia.GoogleMaps.RenderSettings; // Is there any better method of passing this to our script?

    //meramedia.log("[GoogleMaps] Starting rendering process with settings:");
    //meramedia.log(renderSettings);

    if (renderSettings == null || renderSettings == undefined) {
        //meramedia.log("[GoogleMaps] Invalid render settings, aborting");
        return;
    }

    // Our frontend listener, will listen for events on the map
    var mapListener = new FrontOfficeMapStateListener();

    // Settings for our rendering (map markers, type etc)
    var mapSettings = renderSettings.MapSettings;

    // Create all markers
    var markers = [];
    if (mapSettings != null) {
        $.each(mapSettings.Markers, function (i) {
            //meramedia.log("[GoogleMaps] Adding marker to map " + this.Name + "(" + this.Position + ")");
            if (!mapSettings.CoreSettings.AllowCustomLinks) {
                this.Link = null;
            }
            markers.push(this);
        });
    }
    else {
        //meramedia.log("[GoogleMaps] No map settings in rendering, creating new...");
        mapSettings = new MapSettings();
    }

    // Not user customizable as we are outside of the backoffice
    mapSettings.UserCustomizable = false;

    // Create the map in our context
    var map = new GoogleMap(
        renderSettings.MapContainer, // Container to render in
        mapSettings, // Settings for the rendering of the map
        [mapListener], // List of map listeners
        markers // Markers to add at the first render
    );

    // Set our display container
    //meramedia.log("[GoogleMaps] Settings container on map object to " + renderSettings.MapContainer);
    map.container = document.getElementById(renderSettings.MapContainer);
    map.Initialize();

    // Autofit the markers, will create a "bound" so that all markers are displayed at the beginning
    if (renderSettings.AutoFit)
        map.ZoomToFit();
}