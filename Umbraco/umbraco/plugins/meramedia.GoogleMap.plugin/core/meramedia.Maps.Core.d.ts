/// <reference path="../meramedia.Helpers.d.ts" />
module Meramedia.Maps.Core {
    enum STATE_CHANGE {
        MAP_LEFT_CLICK,
        MAP_RIGHT_CLICK,
        CENTER_CHANGED,
        ZOOM_CHANGED,
        MAPTYPEID_CHANGED,
    }
    module DefaultValues {
        class Map {
            static Zoom: number;
            static Center: string;
        }
        class Marker {
            static ZIndex: number;
        }
        class CoreSettings {
            static DefaultWidth: number;
            static DefaultHeight: number;
            static MaxMarkers: number;
            static MinMarkers: number;
        }
    }
    class CoreSettings {
        public AllowCustomLink: bool;
        public MaxMarkers: number;
        public MinMarkers: number;
        public DefaultWidth: number;
        public DefaultHeight: number;
        constructor (coreSettings?: any);
    }
}
