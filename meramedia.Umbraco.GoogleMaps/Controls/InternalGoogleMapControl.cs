using System;
using System.Web.UI;
using System.Web.UI.WebControls;
using ClientDependency.Core;
//using meramedia.Umbraco.GoogleMaps.Extensions;
using meramedia.Umbraco.GoogleMaps.Helpers;
using System.Web.UI.HtmlControls;

namespace meramedia.Umbraco.GoogleMaps.Controls
{
	/// <summary>
	/// Google Map control.
    /// 
    /// There is no support for using this GoogleMap WebControl outside the backend. Use the meramedia.Umbraco.GoogleMaps.Objects.GoogleMap instead 
    /// from parsing the saved value.
	/// </summary>
	[ToolboxData("<{0}:GoogleMap runat=server></{0}:GoogleMap>")]
    public class InternalGoogleMapControl : WebControl
	{
		/// <summary>
		/// Initializes a new instance of the <see cref="GoogleMap"/> class.
		/// </summary>
		public InternalGoogleMapControl() : base(HtmlTextWriterTag.Div)
		{
			this.CssClass = "map";
		}

		/// <summary>
		/// Raises the <see cref="E:System.Web.UI.Control.Load"/> event.
		/// </summary>
		/// <param name="e">The <see cref="T:System.EventArgs"/> object that contains the event data.</param>
		protected override void OnLoad(EventArgs e)
		{
			base.OnLoad(e);

            // Adds the client dependencies.
            this.AddCss( meramedia.Umbraco.GoogleMaps.Helpers.Constants.GoogleMapCss );
		}

        /// <summary>
        /// Add css to the control
        /// </summary>
        /// <param name="src"></param>
        private void AddCss( String src )
        {
            string tempLink= "<link rel='stylesheet' text='text/css' href='{0}' />";
            LiteralControl include = new LiteralControl(String.Format(tempLink, src));
            ((System.Web.UI.HtmlControls.HtmlHead) Page.Header).Controls.Add(include);
        }
	}
}