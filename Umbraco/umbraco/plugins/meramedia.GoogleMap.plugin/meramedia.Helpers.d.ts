module Meramedia.Helpers {
    class String {
        static Empty: string;
        static IsNullOrEmpty(a: string): bool;
    }
    class Exception {
        private Msg;
        static Regex;
        constructor (msg?: string);
        private GetName();
        public toString(): string;
    }
    class MissingArgumentException extends Exception {
    }
    class ArgumentException extends Exception {
    }
    class InvalidArgumentException extends ArgumentException {
    }
    class FatalException extends Exception {
    }
    class L {
        static Log(msg: string, from?: any, optionalParameters?: any): void;
        static Debug(msg: string, from?: any, optionalParameters?: any): void;
        static Warn(msg: string, from?: any, optionalParameters?: any): void;
        static Error(msg: string, from?: any, optionalParameters?: any): void;
        static Info(msg: string, from?: any, optionalParameters?: any): void;
        static Wtf(msg: string, from?: any, optionalParameters?: any): void;
        static WriteTo(msg, callMethod, from, optionalParameters?);
        static GetFrom(from?);
        static IsDebug();
    }
    class H {
        static IsDefined(obj?: any): bool;
        static IfDefined(obj: any, otherwise: any, otherwise2?: any): any;
    }
}
interface Array {
    remove(from: number, to?: number);
}
