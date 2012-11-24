module Meramedia.Helpers {
    //#region Debug/Log
    var DebugSession: bool = false;
    // Declare console.log
    var internalConsole = (typeof console === 'undefined' || console == null) ? 
    {
        log: function() { },
        error: function() { },
        warn: function () { },
        info: function() { }
    } : console;

    export class String {
        static Empty: string = "";
        static IsNullOrEmpty(a: string): bool {
            return (typeof a === 'undefined' || a == null || a === Empty);
        }
    }

    export class Exception {
        private Msg: string;
        private static Regex: RegExp = /function\s+(.{1,})\s*\(/;

        constructor (msg?: string) {
            this.Msg = msg;
        }

        private GetName(): string {
            var results = (Exception.Regex).exec((<any>this).constructor.toString());
            return (results && results.length > 1) ? results[1] : "Exception";
        }

        toString(): string {
            if (typeof this.Msg === 'undefined' || this.Msg == null) {
                return this.GetName() + ": -";
            }
            return this.GetName() + ": " + this.Msg;
        }
    }

    export class MissingArgumentException extends Exception { }
    export class ArgumentException extends Exception { }
    export class InvalidArgumentException extends ArgumentException { }
    export class FatalException extends Exception { }

    /**
        Class for logging / debugging
    */
    export class L {
        static Log(msg: string, from?: any, optionalParameters?: any): void {
            WriteTo(msg, internalConsole.log, from, optionalParameters);
        }

        static Debug(msg: string, from?: any, optionalParameters?: any): void {
            WriteTo("[DEBUG] " + msg, internalConsole.info, from, optionalParameters);
        }

        static Warn(msg: string, from?: any, optionalParameters?: any): void {
            WriteTo(msg, internalConsole.warn, from, optionalParameters);
        }

        static Error(msg: string, from?: any, optionalParameters?: any): void {
            WriteTo(msg, internalConsole.error, from, optionalParameters);
        }

        static Info(msg: string, from?: any, optionalParameters?: any): void {
            WriteTo(msg, internalConsole.warn, from, optionalParameters);
        }

        static Wtf(msg: string, from?: any, optionalParameters?: any): void {
            WriteTo(msg, internalConsole.error, from, optionalParameters);
        }

        private static WriteTo(msg: string, callMethod: (x?: any, y?: any) => void, from: Object, optionalParameters?: any): void {
            if (IsDebug()) {
                try {
                    if (!H.IsDefined(optionalParameters)) {
                        callMethod.call(internalConsole, GetFrom(from) + msg);
                    }
                    else {
                        callMethod.call(internalConsole, GetFrom(from) + msg, optionalParameters);
                    }
                }
                catch(e) {
                    // IE
                    //console.log(GetFrom(from) + msg);
                }
            }
        }

        private static GetFrom(from?: any): string {
            var name = null;
            if(typeof from == "function") {
                name = from.name;
            }
            else {
                if (typeof from !== 'undefined' && from != null) {
                    name = typeof from;
                }
            }

            return (name != null ? name + " " : "Meramedia.GoogleMaps: ");
        }

        private static IsDebug(): bool {
            return (DebugSession);
        } 
    }

    //#endregion

    //#region Helpers
    // Helper class for checking object values
    export class H {
        static IsDefined(obj?: any): bool {
            return !(typeof obj === 'undefined' || obj == null);
        }
        static IfDefined(obj: any, otherwise: any, otherwise2?: any): any {
            return (IsDefined(obj) ? IfDefined(otherwise2, obj) : otherwise);
        }
    }
    //#endregion
}

// Extension for the JavaScript array to support a better removal method
interface Array {
    remove(from: number, to?: number);
}

Array.prototype.remove = function (from: number, to?: number) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};