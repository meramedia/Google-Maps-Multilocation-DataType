/// <reference path="libs/google.maps.d.ts" />
/// <reference path="libs/jquery.d.ts" />
/// <reference path="meramedia.googlemaps.interfaces.d.ts" />
module Meramedia.GoogleMaps {
    export class FrontOfficeRenderer implements IMapStateListener {
        /// <summary>
        /// Handles the backoffice listening and rendering process
        /// </summary>

        constructor () {
            // TODO: Construct
        }

        RerenderDoneEvent(map: IMap) {

        }

        InitializationDoneEvent(map: IMap): void {
        }

        MarkerAddedEvent(map: IMap, marker: IMapsMarker): void {
            
        }
        
        MarkerRemovedEvent(map: IMap, marker: IMapsMarker): void {

        }
          
        StateChangedEvent(map: IMap, state: STATE_CHANGE): void {
        }
    }
}
