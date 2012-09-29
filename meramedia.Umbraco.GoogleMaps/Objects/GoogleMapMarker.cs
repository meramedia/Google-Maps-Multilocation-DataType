using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Runtime.Serialization.Json;
using System.IO;
using meramedia.Umbraco.GoogleMaps.Helpers;
using System.Globalization;

namespace meramedia.Umbraco.GoogleMaps.Objects
{
    /// <summary>
    /// Represents a position marker on the Google Map.
    /// </summary>
    public class GoogleMapMarker
    {
        /// <summary>
        /// The user set name of the marker.
        /// This is set through the umbraco interface in the back-office
        /// </summary>
        public string Name;

        /// <summary>
        /// Title of the marker. This is the location address of the marker as default.
        /// </summary>
        public string Title;

        ///// <summary>
        ///// Currently NOT in use
        ///// </summary>
        //public string Content;

        /// <summary>
        /// Icon url for the marker
        /// </summary>
        public string Icon;

        /// <summary>
        /// Position in both longitude and latitude separated by ","
        /// </summary>
        public string Position;

        /// <summary>
        /// Position in latitude
        /// </summary>
        public string Latitude
        {
            get
            {
                return ( !String.IsNullOrEmpty( Position ) && Position.IndexOf( ',' ) != -1 ) ? Position.Split( ',' ).First().Trim() : String.Empty;
            }
        }

        /// <summary>
        /// Position in longitude
        /// </summary>
        public string Longitude
        {
            get
            {
                return (!String.IsNullOrEmpty( Position ) && Position.IndexOf(',') != -1) ? Position.Split( ',' ).Last().Trim() : String.Empty;
            }
        }
    }
}
