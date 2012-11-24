/// <reference path="../../../TypeScript/Google/google.maps.d.ts" />
/// <reference path="../../../TypeScript/JQuery/jquery.d.ts" />
/// <reference path="meramedia.maps.d.ts" />
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
