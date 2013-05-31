using System;
using meramedia.Umbraco.GoogleMaps.Helpers;
using umbraco.cms.businesslogic.datatype;
using umbraco.editorControls.SettingControls;
using umbraco.editorControls.SettingControls.Pickers;

namespace meramedia.Umbraco.GoogleMaps.DataTypes.MultiLocation
{
    /// <summary>
    ///     Data Editor for the Google Map (Mutli Location) data-type.
    /// </summary>
    public class MultiLocationDataType : AbstractDataEditor
    {
        /// <summary>
        ///     The Google Map: Mutli Location control.
        /// </summary>
        private readonly MultiLocationControl m_Control = new MultiLocationControl();

        /// <summary>
        ///     Initializes a new instance of the <see cref="MultiLocationDataType" /> class.
        /// </summary>
        public MultiLocationDataType()
        {
            // set the render control as the placeholder
            RenderControl = m_Control;

            // assign the initialise event for the control
            m_Control.Init += m_Control_Init;

            // assign the value to the control
            m_Control.PreRender += m_Control_PreRender;

            // assign the save event for the data-type/editor
            DataEditorControl.OnSave += DataEditorControl_OnSave;
        }

        /// <summary>
        ///     Gets the id of the data-type.
        /// </summary>
        /// <value>The id of the data-type.</value>
        public override Guid Id
        {
            get { return new Guid(Constants.SingleLocationDataTypeId); }
        }

        /// <summary>
        ///     Gets the name of the data type.
        /// </summary>
        /// <value>The name of the data type.</value>
        public override string DataTypeName
        {
            get { return Constants.DatatypeName; }
        }

        /// <summary>
        ///     Gets or sets the default location.
        /// </summary>
        /// <value>The default location.</value>
        [DataEditorSetting("Default Location", description = "The default longitude/latitude position of the map", defaultValue = Constants.DefaultCoordinates, type = typeof (TextField))]
        public string DefaultLocation { get; set; }

        /// <summary>
        ///     Gets or sets the default zoom.
        /// </summary>
        /// <value>The default zoom.</value>
        [DataEditorSetting("Default Zoom", description = "The map zoom (this is the default zoom of the map for the backend editor)", defaultValue = "12", type = typeof (TextField))]
        public string DefaultZoom { get; set; }

        /// <summary>
        ///     Gets or sets the height of the map.
        /// </summary>
        /// <value>The height of the map.</value>
        [DataEditorSetting("Map Height", description = "The map height (this is the default height of the map for the backend editor)", defaultValue = "500", type = typeof (TextField))]
        public string MapHeight { get; set; }

        /// <summary>
        ///     Gets or sets the width of the map.
        /// </summary>
        /// <value>The width of the map.</value>
        [DataEditorSetting("Map Width", description = "The map width (this is the default width of the map for the backend editor)", defaultValue = "500", type = typeof (TextField))]
        public string MapWidth { get; set; }

        [DataEditorSetting("Custom markers folder", description = "Choose a folder with possible marker icons. The folder may ONLY contain images", type = typeof (Media))]
        public string CustomMarkers { get; set; }

        [DataEditorSetting("Maximum number of markers", description = "Maximum number of markers a user may select. A value of -1 will disable this validation", defaultValue = Constants.DefaultMaxNumberOfMarkers, type = typeof (TextField))]
        public string MaxNumberOfMarkers { get; set; }

        [DataEditorSetting("Minimum number of markers", description = "Minimum number of markers a user may select. A value of -1 will disable this validation", defaultValue = Constants.DefaultMinNumberOfMarkers, type = typeof (TextField))]
        public string MinNumberOfMarkers { get; set; }

        [DataEditorSetting("Allow custom links", description = "Allow linking markers to links leading to either external sites or content", defaultValue = true, type = typeof (CheckBox))]
        public string AllowCustomLinks { get; set; }

        /// <summary>
        ///     Handles the Init event of the m_Control control.
        /// </summary>
        /// <param name="sender">The source of the event.</param>
        /// <param name="e">
        ///     The <see cref="System.EventArgs" /> instance containing the event data.
        /// </param>
        private void m_Control_Init(object sender, EventArgs e)
        {
            // get the options from the Prevalue Editor.
            m_Control.DefaultLocation = DefaultLocation;
            m_Control.DefaultZoom = DefaultZoom;
            m_Control.MapHeight = MapHeight;
            m_Control.MapWidth = MapWidth;

            int minMarkers,
                maxMarkers;

            if (!Int32.TryParse(MinNumberOfMarkers, out minMarkers))
                minMarkers = -1;

            if (!Int32.TryParse(MaxNumberOfMarkers, out maxMarkers))
                maxMarkers = -1;

            m_Control.MinMarkers = minMarkers;
            m_Control.MaxMarkers = maxMarkers;
            m_Control.AllowCustomLinks = Boolean.Parse(AllowCustomLinks);
            m_Control.MarkersFolder = (String.IsNullOrEmpty(CustomMarkers) ? -2 : Int32.Parse(CustomMarkers));
        }

        /// <summary>
        ///     Handles the PreRender event of the m_Control control.
        /// </summary>
        /// <param name="sender">The source of the event.</param>
        /// <param name="e">
        ///     The <see cref="System.EventArgs" /> instance containing the event data.
        /// </param>
        private void m_Control_PreRender(object sender, EventArgs e)
        {
            // set the data value of the control
            m_Control.Data = Data.Value != null ? Data.Value.ToString() : string.Empty;
        }

        /// <summary>
        ///     Datas the editor control_ on save.
        /// </summary>
        /// <param name="e">
        ///     The <see cref="System.EventArgs" /> instance containing the event data.
        /// </param>
        private void DataEditorControl_OnSave(EventArgs e)
        {
            Data.Value = m_Control.Data;
        }
    }
}