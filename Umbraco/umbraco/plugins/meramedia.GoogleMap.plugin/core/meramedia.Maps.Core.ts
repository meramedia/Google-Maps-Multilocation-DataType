/// <reference path="../meramedia.Helpers.d.ts" />
module Meramedia.Maps.Core {
    export enum STATE_CHANGE {
        MAP_LEFT_CLICK,
        MAP_RIGHT_CLICK,
        CENTER_CHANGED,
        ZOOM_CHANGED,
        MAPTYPEID_CHANGED
    }

    // Default values that are available
    export module DefaultValues { 
        export class Map {
            // Map settings
            static Zoom: number = 12;
            static Center: string = "0,0";
        }
         
        export class Marker {
            // Marker settings
            static ZIndex: number = 10;
        }

        export class CoreSettings {
            static DefaultWidth: number = 500;
            static DefaultHeight: number = 500;
            static MaxMarkers: number = -1;
            static MinMarkers: number = 0;
        }
    }

    // Core settings for the backoffice
    // Prevents min markers/max markers
    export class CoreSettings {
        AllowCustomLink: bool;
        MaxMarkers: number = Maps.Core.DefaultValues.CoreSettings.MaxMarkers;
        MinMarkers: number = Maps.Core.DefaultValues.CoreSettings.MinMarkers;
        DefaultWidth: number = Maps.Core.DefaultValues.CoreSettings.DefaultWidth;
        DefaultHeight: number = Maps.Core.DefaultValues.CoreSettings.DefaultHeight;

        // coreSettings = json object
        constructor (coreSettings?: any /*CoreSettings json*/) {
            // Check if we have something defined
            if (Meramedia.Helpers.H.IsDefined(coreSettings)) {
                this.AllowCustomLink = Meramedia.Helpers.H.IfDefined(coreSettings.AllowCustomLinks, this.AllowCustomLink);
                this.MaxMarkers = Meramedia.Helpers.H.IfDefined(coreSettings.MaxMarkers, this.MaxMarkers);
                this.MinMarkers = Meramedia.Helpers.H.IfDefined(coreSettings.MinMarkers, this.MinMarkers);
                this.DefaultHeight = Meramedia.Helpers.H.IfDefined(coreSettings.DefaultHeight, this.DefaultHeight);
                this.DefaultWidth = Meramedia.Helpers.H.IfDefined(coreSettings.DefaultWidth, this.DefaultWidth);
            }
        }
    }
}