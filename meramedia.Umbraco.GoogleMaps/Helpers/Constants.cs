namespace meramedia.Umbraco.GoogleMaps.Helpers
{
    /// <summary>
    /// Contains constants used in the application
    /// </summary>
	public class Constants
	{
		/* Settings */
		public const string DatatypeName = "Google Maps (meramedia)";
        public const string SingleLocationDataTypeId = "3E80E7A4-EABE-11E1-B0C1-8A956188709B";

		/* Constants */
		public const string AppKey_DisableClientDependency = "GoogleMaps:DisableClientDependency";

		/* Resources */
        public const string PluginResourceDir = "/umbraco/plugins/meramedia.GoogleMap.plugin/";
        //public const string DefaultSearchIcon = "/umbraco/plugins/meramedia.GoogleMap.plugin/searchIcon.png";

        // CSS
        public const string GoogleMapCss = PluginResourceDir + "meramedia.MultiLocation.GoogleMap.min.css";

        // Javascript
        public const string GoogleMapJavascript = PluginResourceDir + "meramedia.GoogleMap.min.js";
        public const string MultiLocationJavaScript = PluginResourceDir + "meramedia.MultiLocation.GoogleMap.min.js";
        public const string RenderMultiLocationJavaScript = PluginResourceDir + "meramedia.MultiLocation.Render.min.js";
        public const string FrontOfficeMapStateListenerJavascript = PluginResourceDir + "meramedia.MultiLocation.Frontoffice.Listener.min.js";

		/* Helpers */
		internal const char Comma = ',';

        /* Information, stupid way to set. Should probably move to some better place or something... */
        public const string HelpInformation = "Right click on the map or on a search marker to add a location marker to the map. Right click on an existing marker to remove it from the map";

		/* Default values */
		public const string DefaultMinNumberOfMarkers = "-1";
		public const string DefaultMaxNumberOfMarkers = "-1";
		public const string DefaultLatitude = "22.146975527508516";
		public const string DefaultLongitude = "65.58426360844263";
		public const string DefaultCoordinates = DefaultLongitude + "," +  DefaultLatitude;
	}
}