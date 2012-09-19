using System;
using System.Web.UI;
using System.Web.UI.HtmlControls;
using System.Web.UI.WebControls;
using ClientDependency.Core;
using meramedia.Umbraco.GoogleMaps.Controls;
//using meramedia.Umbraco.GoogleMaps.Extensions;
using meramedia.Umbraco.GoogleMaps.Helpers;
using umbraco.cms.businesslogic.media;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace meramedia.Umbraco.GoogleMaps.DataTypes.MultiLocation
{
	/// <summary>
	/// A control for Google Map to store multiple locations.
	/// </summary>
	[ValidationProperty("IsValid")]
	public class MultiLocationControl : WebControl
	{
		/// <summary>
        /// Initializes a new instance of the <see cref="MultiLocationControl"/> class.
		/// </summary>
		public MultiLocationControl() : base(HtmlTextWriterTag.Div)
		{
			this.CssClass = "gmapContainer";
		}

		/// <summary>
		/// Gets or sets the current zoom.
		/// </summary>
		/// <value>The current zoom.</value>
		public string CurrentZoom { get; set; }

		/// <summary>
		/// Gets or sets the default location.
		/// </summary>
		/// <value>The default location.</value>
		public string DefaultLocation { get; set; }

		/// <summary>
		/// Gets or sets the default zoom.
		/// </summary>
		/// <value>The default zoom.</value>
		public string DefaultZoom { get; set; }

		public int MinMarkers { get; set; }

		public int MaxMarkers { get; set; }

		/// <summary>
		/// Gets or sets the height of the map.
		/// </summary>
		/// <value>The height of the map.</value>
		public string MapHeight { get; set; }

		/// <summary>
		/// Gets or sets the width of the map.
		/// </summary>
		/// <value>The width of the map.</value>
		public string MapWidth { get; set; }

		/// <summary>
		/// Gets or sets the data.
		/// </summary>
		/// <value>The data.</value>
		public string Data
		{
			get
			{
				return (this.HiddenLocations != null && !String.IsNullOrEmpty( this.HiddenLocations.Value )) ? this.HiddenLocations.Value : String.Empty;
			}

			set
			{
				this.HiddenLocations.Value = value;
			}
		}

        public string IsValid
        {
            get
            {
                var valid = "Valid";
                if( !CheckValidity() )
                      valid = String.Empty;
                return valid;
            }
        }

		public HtmlInputHidden HiddenLocations { get; set; }

		/// <summary>
		/// Gets or sets the google map.
		/// </summary>
		/// <value>The google map.</value>
        public InternalGoogleMapControl GoogleMap { get; set; }

		/// <summary>
		/// Gets or sets the hidden location.
		/// </summary>
		/// <value>The hidden location.</value>
		public HtmlInputHidden HiddenDefaultLocation { get; set; }

		/// <summary>
		/// The validator for the minimum amount of marker items
		/// </summary>
		public CustomValidator MinMarkerItemsValidator;

		/// <summary>
		/// The validator for the maximum amount of marker items
		/// </summary>
		public CustomValidator MaxMarkerItemsValidator;

        /// <summary>
        /// The validator for the width of the map
        /// </summary>
        public RegularExpressionValidator WidthNumberValidator;

        /// <summary>
        /// The validator for the height of the map
        /// </summary>
        public RegularExpressionValidator HeightNumberValidator;

        /// <summary>
        /// The marker folder, -2 = no folder selected
        /// </summary>
		public int MarkersFolder = -2;

		/// <summary>
		/// Raises the <see cref="E:System.Web.UI.Control.Init"/> event.
		/// </summary>
		/// <param name="e">An <see cref="T:System.EventArgs"/> object that contains the event data.</param>
		protected override void OnInit(EventArgs e)
		{
			base.OnInit(e);

			this.EnsureChildControls();
		}

		/// <summary>
		/// Raises the <see cref="E:System.Web.UI.Control.PreRender"/> event.
		/// </summary>
		/// <param name="e">An <see cref="T:System.EventArgs"/> object that contains the event data.</param>
		protected override void OnPreRender(EventArgs e)
		{
			base.OnPreRender(e);
			//this.HiddenLocations.Value = this.Data;
		}

		/// <summary>
		/// Raises the <see cref="E:System.Web.UI.Control.Load"/> event.
		/// </summary>
		/// <param name="e">The <see cref="T:System.EventArgs"/> object that contains the event data.</param>
		protected override void OnLoad(EventArgs e)
		{
			base.OnLoad(e);

			// set the ID of the control
			this.ID = string.Concat("gmapContainer_", this.ClientID);

			// Adds the client dependencies.
            this.AddJavascript( meramedia.Umbraco.GoogleMaps.Helpers.Constants.GoogleMapJavascript );
            this.AddJavascript( meramedia.Umbraco.GoogleMaps.Helpers.Constants.MultiLocationJavaScript );
		}

		private void AddJavascript( String src )
		{
			this.Page.ClientScript.RegisterClientScriptInclude( src.GetHashCode().ToString(), src );
		}

		/// <summary>
		/// Called by the ASP.NET page framework to notify server controls that use composition-based implementation to create any child controls they contain in preparation for posting back or rendering.
		/// </summary>
		protected override void CreateChildControls()
		{
			base.CreateChildControls();

            // --------------------------
            // Data location (saved settings and settings)
            // --------------------------
            // Data
            this.HiddenLocations = new HtmlInputHidden();
            this.HiddenLocations.ID = string.Concat( "hiddenLocations_", this.ClientID );
            this.HiddenLocations.Value = this.Data;

            this.HiddenLocations.Attributes.Add( "class", "hiddenLocations" );

            // Get parsed data
            InternalGoogleMapControl map = ( String.IsNullOrEmpty( Data ) ) ? null : JsonConvert.DeserializeObject<InternalGoogleMapControl>( Data );

			// --------------------------
            // Create the validators for the map interface
            // --------------------------

            // Minimum locations validator
			MinMarkerItemsValidator = new CustomValidator()
			{
				ID = string.Concat( "MinMarkerItemsValidator_", this.ClientID ),
				ErrorMessage = "Your amount of selected markers are below the minimum of " + MinMarkers + " markers"
			};

			MinMarkerItemsValidator.Attributes.Add( "class", "validatorError" );

            MinMarkerItemsValidator.Display = ValidatorDisplay.Dynamic;

			MinMarkerItemsValidator.ServerValidate += new ServerValidateEventHandler( MinItemsValidator_ServerValidate );
			this.Controls.Add( MinMarkerItemsValidator );


            // Maximum locations validator
			MaxMarkerItemsValidator = new CustomValidator()
			{
				ID = string.Concat( "MaxMarkerItemsValidator_", this.ClientID ),
				ErrorMessage = "Your amount of selected markers are above the maximum of " + MaxMarkers + " markers"
			};

			MaxMarkerItemsValidator.Attributes.Add( "class", "validatorError" );

            MaxMarkerItemsValidator.Display = ValidatorDisplay.Dynamic;

			MaxMarkerItemsValidator.ServerValidate += new ServerValidateEventHandler( MaxItemsValidator_ServerValidate );
			this.Controls.Add( MaxMarkerItemsValidator );

            // Width validation
            this.WidthNumberValidator = new RegularExpressionValidator();
            this.WidthNumberValidator.ValidationExpression = @"\d{1,}";
            this.WidthNumberValidator.ControlToValidate = String.Concat( "mapWidth_", this.ClientID );
            this.WidthNumberValidator.ErrorMessage = "The width must be an integer";
            this.WidthNumberValidator.Attributes.Add( "class", "validatorError" );

            this.WidthNumberValidator.Display = ValidatorDisplay.Dynamic;

            this.Controls.Add( WidthNumberValidator );
            
            // Height validation
            this.HeightNumberValidator = new RegularExpressionValidator();
            this.HeightNumberValidator.ValidationExpression = @"\d{1,}";
            this.HeightNumberValidator.ControlToValidate = String.Concat( "mapHeight_", this.ClientID );
            this.HeightNumberValidator.ErrorMessage = "The height must be an integer";
            this.HeightNumberValidator.Attributes.Add( "class", "validatorError" );

            this.Controls.Add( HeightNumberValidator );

            this.HeightNumberValidator.Display = ValidatorDisplay.Dynamic;

            // --------------------------
            // Style the map
            // --------------------------
			this.Attributes.Add( "style", "width:" + MapWidth + "px;" );

            // --------------------------
            // Search box
            // --------------------------
			var DivSearch = new HtmlGenericControl("div");

            // Textbox
			var SearchTextBox = new HtmlInputText();
			SearchTextBox.Attributes.Add("class", "place");
			
			// Button
			var SearchButton = new HtmlInputButton() { Value = "Search" };
			SearchButton.Attributes.Add("class", "button search");

            DivSearch.Controls.Add(SearchTextBox);
            DivSearch.Controls.Add(SearchButton);
            this.Controls.Add( DivSearch );

            // --------------------------
            // Information
            // --------------------------
            var DivGeneral = new HtmlGenericControl( "div" );

            // Information button
            var InformationButton = new HtmlImage();
            InformationButton.Src = String.Concat( Helpers.Constants.PluginResourceDir, "information.png" );
            InformationButton.Attributes.Add( "title", Helpers.Constants.HelpInformation );
            InformationButton.Attributes.Add( "class", "informationButton" );

            DivGeneral.Controls.Add( InformationButton );

            // Map width fields
            var MapWidthField_label = new Label();
            MapWidthField_label.Text = "Map width";

            var MapWidthField = new HtmlInputText();
            MapWidthField.ID = String.Concat( "mapWidth_", this.ClientID );
            MapWidthField.Value = ( map == null ) ? MapWidth : map.Width.ToString();
            MapWidthField.Attributes.Add( "class", "mapWidth" );

            DivGeneral.Controls.Add( MapWidthField_label );
            DivGeneral.Controls.Add( MapWidthField );

            // Map height
            var MapHeightField_label = new Label();
            MapHeightField_label.Text = "Map width";

            var MapHeightField = new HtmlInputText();
            MapHeightField.ID = String.Concat( "mapHeight_", this.ClientID );
            MapHeightField.Value = ( map == null ) ? MapHeight : map.Height.ToString();
            MapHeightField.Attributes.Add( "class", "mapHeight" );

            DivGeneral.Controls.Add( MapHeightField_label );
            DivGeneral.Controls.Add( MapHeightField );

            this.Controls.Add( DivGeneral );
            //this.Controls.Add( InformationButton );

            // --------------------------
            // Google map
            // --------------------------
            this.GoogleMap = new InternalGoogleMapControl()
			{
				CssClass = "map",
				ID = string.Concat("map_", this.ClientID),
				Height = Unit.Parse(this.MapHeight),
				Width = Unit.Parse(this.MapWidth)
			};

			this.Controls.Add(this.GoogleMap);

            // --------------------------
            // Marker list
            // --------------------------
			var DivMarkerList = new HtmlGenericControl( "div" );

            // Markerlist
			var MarkerList = new LiteralControl( "<ul class=\"markerList\" id=\"markerList_" + this.ClientID + "\"></ul>" );

			DivMarkerList.Controls.Add( MarkerList );
			this.Controls.Add( DivMarkerList );

			this.Controls.Add( HiddenLocations );

			// Settings such as minimum locations and maximum locations (markers)
			var divSettings = new HtmlGenericControl( "div" );
			var SettingsList = new HtmlInputHidden();
			SettingsList.Value = "{\"minMarkers\":" + MinMarkers + ",\"maxMarkers\":" + MaxMarkers + ",\"defaultLocation\":\"" + String.Concat( this.DefaultLocation, meramedia.Umbraco.GoogleMaps.Helpers.Constants.Comma, this.DefaultZoom ) + "\",\"defaultWidth\":" + MapWidth + ",\"defaultHeight\":" + MapHeight + "}";
			SettingsList.Attributes.Add( "class", "mapSettings" );
			this.Controls.Add( SettingsList );

            // --------------------------
            // Marker icons (location icons)
            // --------------------------
			if( MarkersFolder != -2 ) // Check if folder is set >= -1
			{
				Media m = new Media( MarkersFolder );
				List<Object> media = new List<Object>();
				foreach( var item in m.Children )
				{
					if( item.ContentType.Alias == "Image" )
						media.Add( new { id = item.Id, url = item.getProperty( "umbracoFile" ).Value.ToString() } );
				}

				var mediaInput = new HtmlInputHidden();
				mediaInput.Value = JsonConvert.SerializeObject( media );
				mediaInput.Attributes.Add( "class", "markerValueList" );
				this.Controls.Add( mediaInput );
			}
		}

        /// <summary>
        /// Validates the minimum location items (markers)
        /// </summary>
        /// <param name="source"></param>
        /// <param name="args"></param>
		void MinItemsValidator_ServerValidate( object source, ServerValidateEventArgs args )
		{
			args.IsValid = true;
			if( MinMarkers != -1 )
			{
				Objects.GoogleMap map = JsonConvert.DeserializeObject<Objects.GoogleMap>( Data );
				if( map.Markers.Count < MinMarkers )
					args.IsValid = false;
			}
		}

        /// <summary>
        /// Validates the maximum location items (markers)
        /// </summary>
        /// <param name="source"></param>
        /// <param name="args"></param>
		void MaxItemsValidator_ServerValidate( object source, ServerValidateEventArgs args )
		{
			args.IsValid = true;
			if( MaxMarkers != -1 )
			{
				Objects.GoogleMap map = JsonConvert.DeserializeObject<Objects.GoogleMap>( Data );
				if( map.Markers.Count > MaxMarkers )
					args.IsValid = false;
			}
		}

        bool CheckValidity()
        {
            Objects.GoogleMap map = JsonConvert.DeserializeObject<Objects.GoogleMap>( Data );
            if( map.Markers.Count > 0 )
                return true;
            return false;
        }
	}
}
