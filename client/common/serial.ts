import * as Q from 'q';
import * as Enumerable from 'linq';
import { isPromise} from './utils';


export class Serial { 
    public static serial(tasks: Array<any>) {
        var chain = Q.when();
        var error = new Error();
        Enumerable.from(tasks).forEach(function (task, key) {
            var successTask = task.success || task;
            var failTask = task.fail;
            var notifyTask = task.notify;

            chain = chain.then(/*success*/
                function (data) {
                    if (!successTask) { return data; }
                    var ret = successTask([data]);
                    if (!isPromise(ret)) {
                        error.message = "Task " + key + " did not return a promise.";
                        throw error;
                    }
                    return ret;
                },/*failure*/
                function (reason) {
                    // Default fail callback
                    if (!failTask) { return Q.reject(reason); }
                    // User defined fail callback
                    var ret = failTask([reason]);
                    if (!isPromise(ret)) {
                        error.message = "Fail for task " + key + " did not return a promise.";
                        throw error;
                    }
                    return ret;
                },
                notifyTask);
        });
        return chain;
    }
}