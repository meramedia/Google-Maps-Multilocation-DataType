using System.Xml;
using System.Linq;
using System.Xml.XPath;
using umbraco;
using System.Web.Configuration;

namespace meramedia.Umbraco.GoogleMaps.Helpers
{
    //[XsltExtension("google.maps")]
    public class Library
    {
    //    /// <summary>
    //    /// Parses the CSV.
    //    /// </summary>
    //    /// <param name="csv">The CSV.</param>
    //    /// <returns>Returns a nodeset of the Google map co-ordinates.</returns>
    //    public static XPathNodeIterator ParseCsv(string csv)
    //    {
    //        var array = csv.Split( meramedia.Umbraco.GoogleMaps.Helpers.Constants.Comma );
    //        var tag = "<GoogleMap lon='{0}' lat='{1}' zoom='{2}' />";
    //        var xml = new XmlDocument();
    //        xml.LoadXml(string.Format(tag, array));
    //        return xml.CreateNavigator().Select("/GoogleMap");
    //    }

    //    /// <summary>
    //    /// Gets the static map.
    //    /// </summary>
    //    /// <param name="value">The value.</param>
    //    /// <returns>Returns an image URL for a static Google map.</returns>
    //    public static string GetStaticMap(string value)
    //    {
    //        if (!string.IsNullOrEmpty(value))
    //        {
    //            var array = value.Split( meramedia.Umbraco.GoogleMaps.Helpers.Constants.Comma );
    //            var lon = ( array.Length > 0 ) ? array[ 0 ] : meramedia.Umbraco.GoogleMaps.Helpers.Constants.DefaultLongitude;
    //            var lat = ( array.Length > 1 ) ? array[ 1 ] : meramedia.Umbraco.GoogleMaps.Helpers.Constants.DefaultLatitude;
    //            var zoom = (array.Length > 2) ? int.Parse(array[2]) : 13;

    //            return GetStaticMap(lon, lat, zoom);
    //        }

    //        return string.Empty;
    //    }

    //    /// <summary>
    //    /// Gets the static map.
    //    /// </summary>
    //    /// <param name="lon">The longitude.</param>
    //    /// <param name="lat">The latitude.</param>
    //    /// <returns>Returns an image URL for a static Google map.</returns>
    //    public static string GetStaticMap(string lon, string lat)
    //    {
    //        return GetStaticMap(lon, lat, 13, 250, 250);
    //    }

    //    /// <summary>
    //    /// Gets the static map.
    //    /// </summary>
    //    /// <param name="lon">The longitude.</param>
    //    /// <param name="lat">The latitude.</param>
    //    /// <param name="zoom">The zoom.</param>
    //    /// <returns>Returns an image URL for a static Google map.</returns>
    //    public static string GetStaticMap(string lon, string lat, int zoom)
    //    {
    //        return GetStaticMap(lon, lat, zoom, 250, 250);
    //    }

    //    /// <summary>
    //    /// Gets the static map.
    //    /// </summary>
    //    /// <param name="lon">The longitude.</param>
    //    /// <param name="lat">The latitude.</param>
    //    /// <param name="zoom">The zoom.</param>
    //    /// <param name="height">The height.</param>
    //    /// <param name="width">The width.</param>
    //    /// <returns>Returns an image URL for a static Google map.</returns>
    //    public static string GetStaticMap(string lon, string lat, int zoom, int height, int width)
    //    {
    //        return GetStaticMap(lon, lat, zoom, height, width, "roadmap");
    //    }

    //    /// <summary>
    //    /// Gets the static map.
    //    /// </summary>
    //    /// <param name="lon">The longitude.</param>
    //    /// <param name="lat">The latitude.</param>
    //    /// <param name="zoom">The zoom.</param>
    //    /// <param name="height">The height.</param>
    //    /// <param name="width">The width.</param>
    //    /// <param name="mapType">Type of the map.</param>
    //    /// <returns>Returns an image URL for a static Google map.</returns>
    //    public static string GetStaticMap(string lon, string lat, int zoom, int height, int width, string mapType)
    //    {
    //        switch (mapType.ToUpper())
    //        {
    //            case "ROADMAP":
    //            case "SATELLITE":
    //            case "TERRAIN":
    //            case "HYBRID":
    //                break;

    //            default:
    //                mapType = "roadmap";
    //                break;
    //        }

    //        string staticMapUrl = "http://maps.google.com/maps/api/staticmap?markers={0},{1}&zoom={2}&size={4}x{3}&maptype={5}&sensor=false";
    //        return string.Format(staticMapUrl, lon, lat, zoom, height, width, mapType.ToLower());
    //    }

        /// <summary>
        /// Gets a value indicating whether to [use client dependency].
        /// </summary>
        /// <value><c>true</c> if [use client dependency]; otherwise, <c>false</c>.</value>
        internal static bool UseClientDependency
        {
            get
            {
                var disabled = false;

                if (WebConfigurationManager.AppSettings.AllKeys.Contains(Constants.AppKey_DisableClientDependency))
                {
                    var disableClientDependency = WebConfigurationManager.AppSettings[Constants.AppKey_DisableClientDependency] ?? bool.FalseString;
                    bool.TryParse(disableClientDependency, out disabled);
                }

                return !disabled;
            }
        }
    }
}