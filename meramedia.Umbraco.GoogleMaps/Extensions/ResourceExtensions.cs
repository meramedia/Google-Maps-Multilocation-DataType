using System;
using System.Web.UI;
using ClientDependency.Core;
using ClientDependency.Core.Controls;
using umbraco;
using meramedia.Umbraco.GoogleMaps.Helpers;

//namespace meramedia.Umbraco.GoogleMaps.Extensions
//{
//    /// <summary>
//    /// Extension methods for embedded resources
//    /// </summary>
//    /// <remarks>
//    ///	Class taken from uComponents:
//    ///	http://ucomponents.codeplex.com/
//    /// </remarks>
//    public static class ResourceExtensions
//    {
//        /// <summary>
//        /// Adds an embedded resource to the ClientDependency output by name
//        /// </summary>
//        /// <param name="ctl">The CTL.</param>
//        /// <param name="resourceName">Name of the resource.</param>
//        /// <param name="type">The type.</param>
//        public static void AddResourceToClientDependency(this Control ctl, string resourceName, ClientDependencyType type)
//        {
//            ctl.Page.AddResourceToClientDependency(typeof(ResourceExtensions), resourceName, type, 100);
//        }

//        /// <summary>
//        /// Adds an embedded resource to the ClientDependency output by name
//        /// </summary>
//        /// <param name="page">The Page to add the resource to</param>
//        /// <param name="resourceContainer">The type containing the embedded resourcre</param>
//        /// <param name="resourceName">Name of the resource.</param>
//        /// <param name="type">The type.</param>
//        /// <param name="priority">The priority.</param>
//        public static void AddResourceToClientDependency(this Page page, Type resourceContainer, string resourceName, ClientDependencyType type, int priority)
//        {
//            // // get the urls for the embedded resources     
//            var resourceUrl = page.ClientScript.GetWebResourceUrl(resourceContainer, resourceName);

//            // check if they want to use ClientDependency
//            if (Library.UseClientDependency)
//            {
//                ClientDependencyLoader.Instance.RegisterDependency(priority, page.Server.HtmlEncode(resourceUrl), type);
//            }
//            else
//            {
//                // get the urls for the embedded resources
//                var target = page.Header;

//                // if there's no <head runat="server" /> don't throw an exception.
//                if (target != null)
//                {
//                    // Seems that ClientDependency still has issues with querystrings in virtual paths.
//                    switch (type)
//                    {
//                        case ClientDependencyType.Css:
//                            target.Controls.Add(new LiteralControl("<link type='text/css' rel='stylesheet' href='" + page.Server.HtmlEncode(resourceUrl) + "' />"));
//                            break;

//                        case ClientDependencyType.Javascript:
//                            target.Controls.Add(new LiteralControl("<script type='text/javascript' src='" + page.Server.HtmlEncode(resourceUrl) + "'></script>"));
//                            break;

//                        default:
//                            break;
//                    }
//                }
//            }
//        }
//    }
//}