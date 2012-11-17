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


        /// <summary>
        /// Min markers for the current datatype
        /// </summary>
		public int MinMarkers { get; set; }


        /// <summary>
        /// Max markers for the current data type
        /// </summary>
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
        /// Gets or sets the allow custom link flag.
        /// If true users will be able to link markers to external links
        /// </summary>
        public bool AllowCustomLinks { get; set; }

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

        /// <summary>
        /// Validation object
        /// </summary>
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

        /// <summary>
        /// Hidden locations settings
        /// </summary>
        public HtmlInputControl HiddenLocations { get; set; }

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
            //this.AddJavascript( meramedia.Umbraco.GoogleMaps.Helpers.Constants.GoogleMapsApiJavascript );
            foreach( var lib in meramedia.Umbraco.GoogleMaps.Helpers.Constants.JavaScriptLibraries )
                this.AddJavascript( lib );
            //this.AddJavascript( meramedia.Umbraco.GoogleMaps.Helpers.Constants.GoogleMapJavascript );
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
            this.Attributes.Add( "style", "width:500px;" );

            #region <!-- Validators

            // Min markers validation
            MinMarkerItemsValidator = new CustomValidator()
            {
                ID = string.Concat( "MinMarkerItemsValidator_", this.ClientID ),
                ErrorMessage = "Your amount of selected markers are below the minimum of " + MinMarkers + " markers"
            };
            MinMarkerItemsValidator.Attributes.Add( "class", "validatorError" );
            MinMarkerItemsValidator.Display = ValidatorDisplay.Dynamic;
            MinMarkerItemsValidator.ServerValidate += new ServerValidateEventHandler( MinItemsValidator_ServerValidate );
            this.Controls.Add( MinMarkerItemsValidator );

            // Max markers validation
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
            this.WidthNumberValidator.ErrorMessage = "Width must be an integer bigger than 0";
            this.WidthNumberValidator.Attributes.Add( "class", "validatorError" );
            this.WidthNumberValidator.Display = ValidatorDisplay.Dynamic;
            this.Controls.Add( WidthNumberValidator );

            // Height validation
            this.HeightNumberValidator = new RegularExpressionValidator();
            this.HeightNumberValidator.ValidationExpression = @"\d{1,}";
            this.HeightNumberValidator.ControlToValidate = String.Concat( "mapHeight_", this.ClientID );
            this.HeightNumberValidator.ErrorMessage = "Height must be an integer bigger than 0";
            this.HeightNumberValidator.Attributes.Add( "class", "validatorError" );
            this.HeightNumberValidator.Display = ValidatorDisplay.Dynamic;
            this.Controls.Add( HeightNumberValidator );

            #endregion // Validators -->

            #region <!-- Stored settings

            // Location settings
            if( meramedia.Umbraco.GoogleMaps.Helpers.Constants.Debug )
                this.HiddenLocations = new HtmlInputText();
            else
                this.HiddenLocations = new HtmlInputHidden();

            // Create a client id that we can access easily
            HiddenLocations.ID = String.Concat( "hiddenLocations_", this.ClientID );
            HiddenLocations.Value = this.Data; // Stored value (JSON Encoded)
            HiddenLocations.Attributes.Add( "class", "hiddenLocations" ); // Class for access

            this.Controls.Add( HiddenLocations );

            // CoreSettings
            HtmlInputControl SettingsList = null;
            if( !meramedia.Umbraco.GoogleMaps.Helpers.Constants.Debug )
                SettingsList = new HtmlInputHidden();
            else
                SettingsList = new HtmlInputText();

            // Create our settings list with the values that we have
            var settings = new
            {
                MinMarkers = MinMarkers,
                MaxMarkers = MaxMarkers,
                DefaultLocation = String.Concat( this.DefaultLocation, meramedia.Umbraco.GoogleMaps.Helpers.Constants.Comma, this.DefaultZoom ),
                DefaultWidth = MapWidth,
                DefaultHeight = MapHeight,
                AllowCustomLinks = AllowCustomLinks
            };

            SettingsList.Value = JsonConvert.SerializeObject( settings );
            SettingsList.Attributes.Add( "class", "mapSettings" );
            this.Controls.Add( SettingsList );

            // Marker icon settings
            if( MarkersFolder != -2 ) // TODO: Make this section a bit better to use, for example folder in folder addition of icons
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
            #endregion // <!-- Stored settings

            #region <!-- Map
            InternalGoogleMapControl map = ( String.IsNullOrEmpty( Data ) ) ? null : JsonConvert.DeserializeObject<InternalGoogleMapControl>( Data );
            #endregion // Map -->

            // Content wrapper
            HtmlGenericControl contentWrapper = new HtmlGenericControl( "div" );

                #region <!-- MapWrapper
                HtmlGenericControl mapWrapper = new HtmlGenericControl( "div" );
                mapWrapper.Attributes.Add( "class", "mapWrapper" );

                    this.GoogleMap = new InternalGoogleMapControl()
                    {
                        CssClass = "map",
                        ID = string.Concat( "map_", this.ClientID ),
                        Height = 350,
                        Width = 492
                        //Height = Unit.Parse( this.MapHeight ),
                        //Width = Unit.Parse( this.MapWidth )
                    };

                mapWrapper.Controls.Add( this.GoogleMap );
                this.Controls.Add( mapWrapper );
                #endregion // MapWrapper -->

                //#region <!-- Help button
                //HyperLink informationLink = new HyperLink();
                //informationLink.NavigateUrl = "#";
                //informationLink.Text = "I need help!";
                //informationLink.Attributes.Add( "class", "helpLink" );
                //contentWrapper.Controls.Add( informationLink );
                //#endregion

                #region <!-- Help area
                HtmlGenericControl helpWrapper = new HtmlGenericControl( "div" );
                helpWrapper.Attributes.Add( "class", "helpArea clrfix hidden" );

                HtmlGenericControl helpButton = new HtmlGenericControl( "div" );
                helpButton.InnerText = "?";
                helpButton.Attributes.Add( "class", "helpButton" );
                helpWrapper.Controls.Add( helpButton );

                HtmlGenericControl helpText = new HtmlGenericControl( "div" );
                helpText.Attributes.Add( "class", "helpText" );
                helpText.InnerText = meramedia.Umbraco.GoogleMaps.Helpers.Constants.HelpInformation;

                helpWrapper.Controls.Add( helpText );
                contentWrapper.Controls.Add( helpWrapper );
                #endregion // Help area -->

                #region <!-- Search
                HtmlGenericControl searchWrapper = new HtmlGenericControl( "div" );
                searchWrapper.Attributes.Add( "class", "area searchDialog" );

                HtmlGenericControl searchHelpText = new HtmlGenericControl( "strong" );
                searchHelpText.InnerHtml = "Enter a searchword to find possible locations on the map";
                searchWrapper.Controls.Add( searchHelpText );

                HtmlGenericControl searchInputWrapper = new HtmlGenericControl( "div" );
                searchInputWrapper.Attributes.Add( "class", "input" );

                HtmlInputText searchBox = new HtmlInputText();
                searchBox.Attributes.Add( "class", "place" );
                searchBox.Attributes.Add( "value", String.Empty );
                searchInputWrapper.Controls.Add( searchBox );

                HtmlInputButton searchButton = new HtmlInputButton() { Value = "Search" };
                searchButton.Attributes.Add( "class", "button search" );
                searchInputWrapper.Controls.Add( searchButton );

                searchWrapper.Controls.Add( searchInputWrapper );
                contentWrapper.Controls.Add( searchWrapper );
                #endregion // Search -->

                #region <!-- General settings
                HtmlGenericControl generalWrapperHeader = new HtmlGenericControl( "h3" );
                generalWrapperHeader.InnerText = "General settings";
                contentWrapper.Controls.Add( generalWrapperHeader );

                HtmlGenericControl togglerLinkWrapper = new HtmlGenericControl( "div" );
                togglerLinkWrapper.Attributes.Add( "class", "fr" );
                togglerLinkWrapper.Attributes.Add( "style", "top: -17px; position:relative;" );

                HyperLink toggleLink = new HyperLink();
                toggleLink.NavigateUrl = "#";
                toggleLink.Text = "Show settings";
                toggleLink.Attributes.Add( "class", "toggleController" );
                toggleLink.Attributes.Add( "data-hidden", "Hide settings" );
                toggleLink.Attributes.Add( "data-visible", "Show settings" );
                togglerLinkWrapper.Controls.Add( toggleLink );

                contentWrapper.Controls.Add( togglerLinkWrapper );

                HtmlGenericControl generalSettingsWrapper = new HtmlGenericControl( "div" );
                generalSettingsWrapper.Attributes.Add( "class", "area generalSettings" );

                // Width
                HtmlGenericControl widthWrapper = new HtmlGenericControl( "div" );
                widthWrapper.Attributes.Add( "class", "input" );

                HtmlGenericControl labelWrapper = new HtmlGenericControl( "div" );
                labelWrapper.Attributes.Add( "class", "label" );
                Label widthLabel = new Label();
                widthLabel.Text = "Width";
                labelWrapper.Controls.Add( widthLabel );
                labelWrapper.Controls.Add( new LiteralControl( "<br/>" ) );

                HtmlGenericControl widthSmall = new HtmlGenericControl( "small" );
                widthSmall.InnerText = "The width of the map that will be displayed to the user";
                labelWrapper.Controls.Add( widthSmall );
                widthWrapper.Controls.Add( labelWrapper );

                HtmlGenericControl inputWrapper = new HtmlGenericControl( "div" );
                HtmlInputText widthInput = new HtmlInputText( "text" );
                widthInput.ID = "mapWidth_" + this.ClientID;
                widthInput.Value = MapWidth.ToString();
                inputWrapper.Controls.Add( widthInput );

                widthWrapper.Controls.Add( inputWrapper );
                generalSettingsWrapper.Controls.Add( widthWrapper );

                // Height
                HtmlGenericControl heightWrapper = new HtmlGenericControl( "div" );
                heightWrapper.Attributes.Add( "class", "input" );

                HtmlGenericControl heightLabelWrapper = new HtmlGenericControl( "div" );
                heightLabelWrapper.Attributes.Add( "class", "label" );
                Label heightLabel = new Label();
                heightLabel.Text = "Height";
                heightLabelWrapper.Controls.Add( heightLabel );
                heightLabelWrapper.Controls.Add( new LiteralControl( "<br/>" ) );

                HtmlGenericControl heightSmall = new HtmlGenericControl( "small" );
                heightSmall.InnerText = "The height of the map that will be displayed to the user";
                heightLabelWrapper.Controls.Add( heightSmall );
                heightWrapper.Controls.Add( heightLabelWrapper );

                HtmlGenericControl heightInputWrapper = new HtmlGenericControl( "div" );
                HtmlInputText heightInput = new HtmlInputText( "text" );
                heightInput.ID = "mapHeight_" + this.ClientID;
                heightInput.Value = MapHeight.ToString();
                heightInputWrapper.Controls.Add( heightInput );

                heightWrapper.Controls.Add( heightInputWrapper );
                generalSettingsWrapper.Controls.Add( heightWrapper );
                contentWrapper.Controls.Add( generalSettingsWrapper );
                #endregion // General settings -->

                #region <!-- Marker list
                HtmlGenericControl markerListHeader = new HtmlGenericControl( "h3" );
                markerListHeader.InnerText = "Marker list";
                contentWrapper.Controls.Add( markerListHeader );

                HtmlGenericControl togglerMarkerListLinkWrapper = new HtmlGenericControl( "div" );
                togglerMarkerListLinkWrapper.Attributes.Add( "class", "fr" );
                togglerMarkerListLinkWrapper.Attributes.Add( "style", "top: -17px; position:relative;" );

                HyperLink toggleMarkerListLink = new HyperLink();
                toggleMarkerListLink.NavigateUrl = "#";
                toggleMarkerListLink.Text = "Show settings";
                toggleMarkerListLink.Attributes.Add( "class", "toggleController" );
                toggleMarkerListLink.Attributes.Add( "data-hidden", "Hide settings" );
                toggleMarkerListLink.Attributes.Add( "data-visible", "Show settings" );

                togglerMarkerListLinkWrapper.Controls.Add( toggleMarkerListLink );
                contentWrapper.Controls.Add( togglerMarkerListLinkWrapper );

                //HtmlGenericControl markerListWrapper = new HtmlGenericControl( "div" );
                //markerListWrapper.Attributes.Add( "class", "area markerSettings" );

                HtmlGenericControl markerList = new HtmlGenericControl( "ul" );
                markerList.Attributes.Add( "class", "markerList" );
                markerList.ID = "markerList_" + ClientID;
                contentWrapper.Controls.Add( markerList );

                HtmlGenericControl noMarkersText = new HtmlGenericControl( "strong" );
                noMarkersText.InnerText = "There are currently no markers on the map";
                noMarkersText.Attributes.Add( "class", "noMarkersText" );
                contentWrapper.Controls.Add( noMarkersText );

                LiteralControl markerListDummy = new LiteralControl( MarkerListHtml );
                contentWrapper.Controls.Add( markerListDummy );

                //contentWrapper.Controls.Add( markerListWrapper );

                #endregion // Marker List -->

                this.Controls.Add( contentWrapper );
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
                if(MinMarkers == 0)
                    return;

				if( map.Markers == null || map.Markers.Count < MinMarkers )
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

        private static string MarkerListHtml = @"<li class=""markerItemDummy"" style=""display:none;"">
				<div>
					<div class=""fl m10right"""">
						<a href=""#"" class=""fakeLink settings"" data-visible=""Hide"" data-hidden=""Edit"">Edit</a>
					</div>
					<div class=""fl"">
						<div class=""name none""></div>
						<div class=""position""><a href=""#"" title=""Display marker on map""></a></div>
					</div>
				</div>
				<div>
					<a class=""remove fakeLink"" href=""#"">x</a>
				</div>
				<div class=""settingsDialog"">
					<div class=""input"">
						<div class=""label"">
							<label>Name</label><br/>
							<small>The name displayed on the marker (hover title)</small>
						</div>
						<div>
							<input type=""text"" name=""name"" value=""""/>
						</div>
					</div>
					<div  class=""input"">
						<div class=""label"">
							<label>Link</label><br/>
							<small>External link to which the user will be directed when the marker is clicked. Leave blank for no link</small>
						</div>
						<div>
							<input type=""text"" name=""link""/>
						</div>
					</div>
					<div class=""input"">
						<div class=""label"">
							<label>Icon</label><br/>
							<small>The icon that the marker will be displayed with in the map</small>
						</div>
						<div>
							<select name=""icon"">
								<option value=""default"" selected=""selected"">Default</option>
							</select>
							<span class=""iconPreview""></span>
						</div>
					</div>
				</div>
			</li>";
	}
}
