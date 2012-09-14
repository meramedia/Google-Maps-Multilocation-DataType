using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Newtonsoft.Json;
using System.Web;

namespace meramedia.Umbraco.GoogleMaps.Objects
{
    /// <summary>
    /// Represents a Google Map object.
    /// 
    /// Use the macro GoogleMap.cshtml to render a GoogleMap
    /// </summary>
    public class GoogleMap
    {
        /// <summary>
        /// All markers located on the map as a list
        /// </summary>
        public List<LocationMarker> Markers;

        /// <summary>
        /// The zoom amount of the map
        /// </summary>
        public int Zoom;

        /// <summary>
        /// The center of the map as a string "longitude,latitude"
        /// </summary>
        public string Center;

        /// <summary>
        /// The map type as a string
        /// </summary>
        public string MapTypeId;

        /// <summary>
        /// The internal width, will be parsed to set the Width value.
        /// </summary>
        public string _Width
        {
            set
            {
                Width = ( String.IsNullOrEmpty( value ) ) ? 500 : Int32.Parse( value );
            }
        }

        /// <summary>
        /// The width of the map
        /// </summary>
        public int Width;

        /// <summary>
        /// The internal height, will be parsed to set the Height value.
        /// </summary>
        public string _Height
        {
            set
            {
                Height = ( String.IsNullOrEmpty( value ) ) ? 500 : Int32.Parse( value );
            }
        }

        /// <summary>
        /// The height of the map
        /// </summary>
        public int Height;

        /// <summary>
        /// Returns the static maps image with custom markers with optional size of the rendered image.
        /// If no size is given the default set map size will be used
        /// </summary>
        /// <param name="width">The width of the image</param>
        /// <param name="height">The height of the image</param>
        /// <returns>The url to the generated image</returns>
        public String GetStaticImageUrl( int? width, int? height )
        {
            // Create our base url for the custom icons url
            String baseUrl = HttpContext.Current.Request.Url.Scheme + "://" + HttpContext.Current.Request.Url.Host + ( HttpContext.Current.Request.Url.IsDefaultPort ? String.Empty :  ":" + HttpContext.Current.Request.Url.Port ); //umbraco.library.NiceUrl( -1 ).Replace( ".aspx", "/" ); 

            // Generate 
            String markers = String.Empty;
            foreach( var marker in Markers )
                markers += String.Concat( 
                    String.Format( "markers=icon:{0}%7C{1}", 
                    ( marker.Icon == null ? "red" : (HttpContext.Current.Request.Url.Host.ToLower().Equals("localhost") ? "red" : baseUrl + marker.Icon) ), // localhost == default icon.
                    marker.Position ), 
                    "&" 
                );

            return String.Format( 
                "http://maps.googleapis.com/maps/api/staticmap?center={0}&zoom={1}&size={2}x{3}&maptype={4}&sensor=false&{5}", 
                this.Center, 
                this.Zoom, 
                ( width.HasValue ? width.Value : this.Width ), 
                ( height.HasValue ? height.Value : this.Height ), 
                this.MapTypeId, 
                ( markers.Length > 0 ? markers.Substring( 0, markers.Length - 1 ) : String.Empty ) 
            );
        }

        /// <summary>
        /// Parses a map from a json string
        /// </summary>
        /// <param name="jsonString">The json string that represents a GoogleMap object</param>
        /// <returns></returns>
        public static GoogleMap Parse( String jsonString )
        {
            return JsonConvert.DeserializeObject<GoogleMap>( jsonString );
        }

        /// <summary>
        /// Convert the GoogleMap object to a json representation
        /// </summary>
        /// <returns>The GoogleMap object as a json string</returns>
        public override String ToString()
        {
            return JsonConvert.SerializeObject( this );
        }
    }
}
