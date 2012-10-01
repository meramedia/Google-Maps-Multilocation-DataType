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
        public List<GoogleMapMarker> Markers;

        /// <summary>
        /// The width of the map
        /// </summary>
        public int Width;


        //// <summary>
        /// The internal width, will be parsed to set the Width value.
        //// </summary>
        public string _Width
        {
            set
            {
                Width = ( String.IsNullOrEmpty( value ) ) ? 500 : Int32.Parse( value );
            }
        }
        /// <summary>
        /// The height of the map
        /// </summary>
        public int Height;


        /// <summary>
        //// The internal height, will be parsed to set the Height value.
        /// </summary>
        public string _Height
        {
            set
            {
                Height = ( String.IsNullOrEmpty( value ) ) ? 500 : Int32.Parse( value );
            }
        }

        [JsonProperty(PropertyName="MapOptions")]
        public MapOptions Options;
        public class MapOptions
        {
            [JsonProperty(PropertyName="center")]
            public string Center;

            [JsonProperty( PropertyName = "zoom" )]
            public int Zoom;

            [JsonProperty( PropertyName = "mapTypeId" )]
            public string MapTypeId;
        }


        /// <summary>
        /// Returns a simple iframe URL
        /// 
        /// Ex. https://maps.google.se/maps?q=65.58433540994488,22.151107191170013&amp;ie=UTF8&amp;t=m&amp;z=14&amp;&amp;output=embed
        /// </summary>
        /// <returns>Iframe url, not the iframe object</returns>
        public String GetIframeUrl( String center = null )
        {
            return "https://maps.google.se/maps?q=" + ( !String.IsNullOrEmpty( center ) ? center : Options.Center ) + "&amp;ie=UTF8&amp;t=m&amp;z=" + Options.Zoom + "&amp;&amp;output=embed";
        }

        /// <summary>
        /// Returns the static maps image with custom markers with optional size of the rendered image.
        /// If no size is given the default set map size will be used
        /// </summary>
        /// <param name="width">The width of the image</param>
        /// <param name="height">The height of the image</param>
        /// <param name="center">The center of the map as a string with "longitude,latitude"</param>
        /// <returns>The url to the generated image</returns>
        public String GetStaticImageUrl( int? width = null, int? height = null, String center = null )
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
                (!String.IsNullOrEmpty( center ) ? center :  this.Options.Center), 
                this.Options.Zoom, 
                ( width.HasValue ? width.Value : this.Width ), 
                ( height.HasValue ? height.Value : this.Height ), 
                this.Options.MapTypeId, 
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
            if( String.IsNullOrEmpty( jsonString ) )
                return null;
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
