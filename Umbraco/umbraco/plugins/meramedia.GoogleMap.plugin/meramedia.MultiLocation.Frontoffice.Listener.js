/**
 * A listener that listens for events that are occurring on the Google Map on our backoffice interface.
 * The events will then result in an updated interface. This is to separate the GUI from the Google Map.
 *
 * You may create custom listeners as long as they implement all event methods marker Event below.
 */
function FrontOfficeMapStateListener() {
    var self = this;

    /* Event */
    this.MapInitializedEvent = function (mapObject) {
    };

    /* Event */
    this.StateChangeEvent = function (mapObject) {
    };

    /* Event */
    this.MarkerDragedEvent = function (mapObject, marker) {
    };

    /* Event */
    this.MarkerAddedEvent = function (mapObject, marker) {
    };

    /* Event */
    this.MarkerRemovedEvent = function (mapObject, marker) {
    };

    /* Event */
    this.MarkerUpdatedEvent = function (mapObject, marker) {
    };

    /* Event */
    this.MarkerLeftClickEvent = function (mapObject, marker) {
        if (marker.link != null && marker.link != "") {
            window.location = marker.link;
        }
    };

    /* Event */
    this.ForceSaveSettingsEvent = function (mapObject) {
    };

    /* Event */
    this.MarkerCreatedEvent = function (mapObject, marker) {
    };
}