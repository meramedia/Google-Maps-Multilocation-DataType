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