
export interface IKeyValuePair {
    key: any;
    value?: any;
}

export class KeyValuePair {
    key: any;
    value: any;

    constructor(key: any, value: any) {
        this.key = key;
        this.value = value;
    }
}

export function isPromise(object: any) {
    if (object && (object['then'] instanceof Function || object['promiseDispatch'] instanceof Function))
        return true;
    return false;
}

export class Utils {

    public static checkNested(obj, args: Array<string>): boolean {
        for (var i = 0; i < args.length; i++) {
            if (!obj || !obj.hasOwnProperty(args[i])) {
                return false;
            }
            obj = obj[args[i]];
        }
        return true;
    }

    public static getTask(scope: any, fn: any, args?: Array<any>) {
        var func = function (closureFnArgs: Array<any>) {
            return fn.apply(scope, args);
        }
        return func;
    }

    public static getAmPmTime(time: number) {
        if (!time) return 0;
        let hm = Utils.toHoursMinutes(time);
        var ampm = hm.hours >= 12 ? 'pm' : 'am';
        hm.hours = hm.hours % 12;
        hm.hours = hm.hours ? hm.hours : 12;// the hour '0' should be '12'
        var strTime = hm.hours + ':' + hm.minutes + ' ' + ampm;
        return strTime;
    }

    public static toHoursMinutes(mins) {
        const hours = Math.trunc(mins / 60);
        const minutes = mins % 60;
        return { hours, minutes };
    }

    public static getInitials(text: string) {
        let initials = '';
        if (!text) return initials;
        const parts = text.split(' ');
        parts.forEach((part, index) => {
            if (index > 1) return;
            let p = part.trim();
            if (p) {
                initials += p.charAt(0).toUpperCase();
            }
        });
        return initials;
    }

    public static getCardBGColor(index) {
        if(index % 2 == 0){
            return "#e1d3ff";
        }
        if(index % 3 == 0){
            return "#f5d8e2";
        }
        return '#bbded6';

    }

    public static getCardHeight(type) { 
        let height = "";
        if (type == 1) { 
            return "300px";
        }
        if (type == 2) { 
            return "400px";
        }
        return height;
    }
}
