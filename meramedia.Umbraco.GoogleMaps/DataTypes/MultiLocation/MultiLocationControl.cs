using System;
using System.Collections.Generic;
using System.Web.UI;
using System.Web.UI.HtmlControls;
using System.Web.UI.WebControls;
using Newtonsoft.Json;
using meramedia.Umbraco.GoogleMaps.Controls;
using meramedia.Umbraco.GoogleMaps.Helpers;
using meramedia.Umbraco.GoogleMaps.Objects;
using umbraco.cms.businesslogic.media;

namespace meramedia.Umbraco.GoogleMaps.DataTypes.MultiLocation
{
    /// <summary>
    ///     A control for Google Map to store multiple locations.
    /// </summary>
    [ValidationProperty("IsValid")]
    public class MultiLocationControl : WebControl
    {
        /// <summary>
        ///     The validator for the height of the map
        /// </summary>
        public RegularExpressionValidator HeightNumberValidator;

        /// <summary>
        ///     The marker folder, -2 = no folder selected
        /// </summary>
        public int MarkersFolder = -2;

        /// <summary>
        ///     The validator for the maximum amount of marker items
        /// </summary>
        public CustomValidator MaxMarkerItemsValidator;

        /// <summary>
        ///     The validator for the minimum amount of marker items
        /// </summary>
        public CustomValidator MinMarkerItemsValidator;

        /// <summary>
        ///     The validator for the width of the map
        /// </summary>
        public RegularExpressionValidator WidthNumberValidator;

        /// <summary>
        ///     Initializes a new instance of the <see cref="MultiLocationControl" /> class.
        /// </summary>
        public MultiLocationControl() : base(HtmlTextWriterTag.Div)
        {
            CssClass = "gmapContainer";
        }

        /// <summary>
        ///     Gets or sets the current zoom.
        /// </summary>
        /// <value>The current zoom.</value>
        public string CurrentZoom { get; set; }

        /// <summary>
        ///     Gets or sets the default location.
        /// </summary>
        /// <value>The default location.</value>
        public string DefaultLocation { get; set; }

        /// <summary>
        ///     Gets or sets the default zoom.
        /// </summary>
        /// <value>The default zoom.</value>
        public string DefaultZoom { get; set; }


        /// <summary>
        ///     Min markers for the current datatype
        /// </summary>
        public int MinMarkers { get; set; }


        /// <summary>
        ///     Max markers for the current data type
        /// </summary>
        public int MaxMarkers { get; set; }

        /// <summary>
        ///     Gets or sets the height of the map.
        /// </summary>
        /// <value>The height of the map.</value>
        public string MapHeight { get; set; }

        /// <summary>
        ///     Gets or sets the width of the map.
        /// </summary>
        /// <value>The width of the map.</value>
        public string MapWidth { get; set; }

        /// <summary>
        ///     Gets or sets the allow custom link flag.
        ///     If true users will be able to link markers to external links
        /// </summary>
        public bool AllowCustomLinks { get; set; }

        /// <summary>
        ///     Gets or sets the data.
        /// </summary>
        /// <value>The data.</value>
        public string Data
        {
            get { return (HiddenLocations != null && !String.IsNullOrEmpty(HiddenLocations.Value)) ? HiddenLocations.Value : String.Empty; }

            set { HiddenLocations.Value = value; }
        }

        /// <summary>
        ///     Validation object
        /// </summary>
        public string IsValid
        {
            get
            {
                string valid = "Valid";
                if (!CheckValidity())
                    valid = String.Empty;
                return valid;
            }
        }

        /// <summary>
        ///     Hidden locations settings
        /// </summary>
        public HtmlInputControl HiddenLocations { get; set; }

        /// <summary>
        ///     Gets or sets the google map.
        /// </summary>
        /// <value>The google map.</value>
        public InternalGoogleMapControl GoogleMap { get; set; }

        /// <summary>
        ///     Gets or sets the hidden location.
        /// </summary>
        /// <value>The hidden location.</value>
        public HtmlInputHidden HiddenDefaultLocation { get; set; }

        /// <summary>
        ///     Raises the <see cref="E:System.Web.UI.Control.Init" /> event.
        /// </summary>
        /// <param name="e">
        ///     An <see cref="T:System.EventArgs" /> object that contains the event data.
        /// </param>
        protected override void OnInit(EventArgs e)
        {
            base.OnInit(e);

            EnsureChildControls();
        }

        /// <summary>
        ///     Raises the <see cref="E:System.Web.UI.Control.PreRender" /> event.
        /// </summary>
        /// <param name="e">
        ///     An <see cref="T:System.EventArgs" /> object that contains the event data.
        /// </param>
        protected override void OnPreRender(EventArgs e)
        {
            base.OnPreRender(e);
            //this.HiddenLocations.Value = this.Data;
        }

        /// <summary>
        ///     Raises the <see cref="E:System.Web.UI.Control.Load" /> event.
        /// </summary>
        /// <param name="e">
        ///     The <see cref="T:System.EventArgs" /> object that contains the event data.
        /// </param>
        protected override void OnLoad(EventArgs e)
        {
            base.OnLoad(e);

            // set the ID of the control
            ID = string.Concat("gmapContainer_", ClientID);

            // Adds the client dependencies.
            AddJavascript(Constants.GoogleMapJavascript);
            AddJavascript(Constants.MultiLocationJavaScript);
        }

        private void AddJavascript(String src)
        {
            Page.ClientScript.RegisterClientScriptInclude(src.GetHashCode()
                                                             .ToString(), src);
        }

        /// <summary>
        ///     Called by the ASP.NET page framework to notify server controls that use composition-based implementation to create any child controls they contain in preparation for posting back or rendering.
        /// </summary>
        protected override void CreateChildControls()
        {
            base.CreateChildControls();

            // --------------------------
            // Data location (saved settings and settings)
            // --------------------------
            // Data
            if (Constants.Debug)
                HiddenLocations = new HtmlInputText();
            else
                HiddenLocations = new HtmlInputHidden();

            HiddenLocations.ID = string.Concat("hiddenLocations_", ClientID);
            HiddenLocations.Value = Data;

            HiddenLocations.Attributes.Add("class", "hiddenLocations");

            // Get parsed data
            InternalGoogleMapControl map = (String.IsNullOrEmpty(Data)) ? null : JsonConvert.DeserializeObject<InternalGoogleMapControl>(Data);

            // --------------------------
            // Create the validators for the map interface
            // --------------------------

            // Minimum locations validator
            MinMarkerItemsValidator = new CustomValidator {
                                                                  ID = string.Concat("MinMarkerItemsValidator_", ClientID),
                                                                  ErrorMessage = "Your amount of selected markers are below the minimum of " + MinMarkers + " markers"
                                                          };

            MinMarkerItemsValidator.Attributes.Add("class", "validatorError");

            MinMarkerItemsValidator.Display = ValidatorDisplay.Dynamic;

            MinMarkerItemsValidator.ServerValidate += MinItemsValidator_ServerValidate;
            Controls.Add(MinMarkerItemsValidator);


            // Maximum locations validator
            MaxMarkerItemsValidator = new CustomValidator {
                                                                  ID = string.Concat("MaxMarkerItemsValidator_", ClientID),
                                                                  ErrorMessage = "Your amount of selected markers are above the maximum of " + MaxMarkers + " markers"
                                                          };

            MaxMarkerItemsValidator.Attributes.Add("class", "validatorError");

            MaxMarkerItemsValidator.Display = ValidatorDisplay.Dynamic;

            MaxMarkerItemsValidator.ServerValidate += MaxItemsValidator_ServerValidate;
            Controls.Add(MaxMarkerItemsValidator);

            // Width validation
            WidthNumberValidator = new RegularExpressionValidator();
            WidthNumberValidator.ValidationExpression = @"\d{1,}";
            WidthNumberValidator.ControlToValidate = String.Concat("mapWidth_", ClientID);
            WidthNumberValidator.ErrorMessage = "The width must be an integer";
            WidthNumberValidator.Attributes.Add("class", "validatorError");

            WidthNumberValidator.Display = ValidatorDisplay.Dynamic;

            Controls.Add(WidthNumberValidator);

            // Height validation
            HeightNumberValidator = new RegularExpressionValidator();
            HeightNumberValidator.ValidationExpression = @"\d{1,}";
            HeightNumberValidator.ControlToValidate = String.Concat("mapHeight_", ClientID);
            HeightNumberValidator.ErrorMessage = "The height must be an integer";
            HeightNumberValidator.Attributes.Add("class", "validatorError");

            Controls.Add(HeightNumberValidator);

            HeightNumberValidator.Display = ValidatorDisplay.Dynamic;

            // --------------------------
            // External link
            // --------------------------

            // --------------------------
            // Style the map
            // --------------------------
            Attributes.Add("style", "width:" + MapWidth + "px;");

            // --------------------------
            // Search box
            // --------------------------
            var DivSearch = new HtmlGenericControl("div");

            // Textbox
            var SearchTextBox = new HtmlInputText();
            SearchTextBox.Attributes.Add("class", "place");
            SearchTextBox.Attributes.Add("value", String.Empty);


            // Button
            var SearchButton = new HtmlInputButton {
                                                           Value = "Search"
                                                   };
            SearchButton.Attributes.Add("class", "button search");

            DivSearch.Controls.Add(SearchTextBox);
            DivSearch.Controls.Add(SearchButton);
            Controls.Add(DivSearch);

            // --------------------------
            // Information
            // --------------------------
            var DivGeneral = new HtmlGenericControl("div");

            // Information button
            var InformationButton = new HtmlImage();
            InformationButton.Src = String.Concat(Constants.PluginResourceDir, "information.png");
            InformationButton.Attributes.Add("title", Constants.HelpInformation);
            InformationButton.Attributes.Add("class", "informationButton");

            DivGeneral.Controls.Add(InformationButton);

            // Map width fields
            var MapWidthField_label = new Label();
            MapWidthField_label.Text = "Map width";

            var MapWidthField = new HtmlInputText();
            MapWidthField.ID = String.Concat("mapWidth_", ClientID);
            MapWidthField.Value = (map == null) ? MapWidth : map.Width.ToString();
            MapWidthField.Attributes.Add("class", "mapWidth");

            DivGeneral.Controls.Add(MapWidthField_label);
            DivGeneral.Controls.Add(MapWidthField);

            // Map height
            var MapHeightField_label = new Label();
            MapHeightField_label.Text = "Map width";

            var MapHeightField = new HtmlInputText();
            MapHeightField.ID = String.Concat("mapHeight_", ClientID);
            MapHeightField.Value = (map == null) ? MapHeight : map.Height.ToString();
            MapHeightField.Attributes.Add("class", "mapHeight");

            DivGeneral.Controls.Add(MapHeightField_label);
            DivGeneral.Controls.Add(MapHeightField);

            Controls.Add(DivGeneral);
            //this.Controls.Add( InformationButton );

            // --------------------------
            // Google map
            // --------------------------
            GoogleMap = new InternalGoogleMapControl {
                                                             CssClass = "map",
                                                             ID = string.Concat("map_", ClientID),
                                                             Height = Unit.Parse(MapHeight),
                                                             Width = Unit.Parse(MapWidth)
                                                     };

            Controls.Add(GoogleMap);

            // --------------------------
            // Marker list
            // --------------------------
            var DivMarkerList = new HtmlGenericControl("div");

            // Markerlist
            var MarkerList = new LiteralControl("<ul class=\"markerList\" id=\"markerList_" + ClientID + "\"></ul>");

            DivMarkerList.Controls.Add(MarkerList);
            Controls.Add(DivMarkerList);
            Controls.Add(HiddenLocations);

            // Settings such as minimum locations and maximum locations (markers)
            var divSettings = new HtmlGenericControl("div");
            HtmlInputControl SettingsList = null;
            if (!Constants.Debug)
                SettingsList = new HtmlInputHidden();
            else
                SettingsList = new HtmlInputText();

            // Create our settings list with the values that we have
            var settings = new {
                                       MinMarkers, MaxMarkers,
                                       DefaultLocation = String.Concat(DefaultLocation, Constants.Comma, DefaultZoom),
                                       DefaultWidth = MapWidth,
                                       DefaultHeight = MapHeight, AllowCustomLinks
                               };

            SettingsList.Value = JsonConvert.SerializeObject(settings);
            SettingsList.Attributes.Add("class", "mapSettings");

            Controls.Add(SettingsList);

            // --------------------------
            // Marker icons (location icons)
            // --------------------------
            if (MarkersFolder != -2) // Check if folder is set >= -1
            {
                var m = new Media(MarkersFolder);
                var media = new List<Object>();
                foreach (Media item in m.Children)
                {
                    if (item.ContentType.Alias == "Image")
                    {
                        media.Add(new {
                                              id = item.Id, url = item.getProperty("umbracoFile")
                                                                      .Value.ToString()
                                      });
                    }
                }

                var mediaInput = new HtmlInputHidden();
                mediaInput.Value = JsonConvert.SerializeObject(media);
                mediaInput.Attributes.Add("class", "markerValueList");
                Controls.Add(mediaInput);
            }
        }

        /// <summary>
        ///     Validates the minimum location items (markers)
        /// </summary>
        /// <param name="source"></param>
        /// <param name="args"></param>
        void MinItemsValidator_ServerValidate(object source, ServerValidateEventArgs args)
        {
            args.IsValid = true;
            if (MinMarkers != -1)
            {
                if (String.IsNullOrEmpty(Data))
                {
                    args.IsValid = false;
                    return;
                }

                var map = JsonConvert.DeserializeObject<GoogleMap>(Data);
                if (MinMarkers == 0)
                    return;

                if (map == null || map.Markers == null || map.Markers.Count < MinMarkers)
                    args.IsValid = false;
            }
        }

        /// <summary>
        ///     Validates the maximum location items (markers)
        /// </summary>
        /// <param name="source"></param>
        /// <param name="args"></param>
        void MaxItemsValidator_ServerValidate(object source, ServerValidateEventArgs args)
        {
            args.IsValid = true;
            if (MaxMarkers != -1)
            {
                if (String.IsNullOrEmpty(Data))
                    return;
                var map = JsonConvert.DeserializeObject<GoogleMap>(Data);
                if (map == null || map.Markers == null || map.Markers.Count > MaxMarkers)
                    args.IsValid = false;
            }
        }

        bool CheckValidity()
        {
            var map = JsonConvert.DeserializeObject<GoogleMap>(Data);
            if (map.Markers.Count > 0)
                return true;
            return false;
        }
    }
}