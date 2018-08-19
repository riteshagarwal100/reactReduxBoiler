import * as axios from 'axios';
import * as Enumerable from 'linq';
import * as Q from 'q';

import { Utils } from './utils';
import { actionType, enums } from './enums';
import { Serial } from './serial';
import { httpMethod, messages } from './resources';
import { ModelBase } from './models/base/model-base';
import { DtoBase } from './dtos/base/dtoBase';
import { RestResponse } from './rest.response';


class RestConfig {
    public static self = 'self';
    public static links = '_links';
    public static page = 'page';
    public static embedded = '_embedded';
    public static linksUrl = 'href';
}

interface GetUrlFunc {
    (): string;
}
interface CreateItemFunc {
    (saveUrl: string);
}

interface NewObject {
    create: CreateItemFunc;
    getSaveUrl: GetUrlFunc;
}

export class ReactRest {
    'use strict';

    private serviceName = 'reactRest';
    private static this: ReactRest;

    RestConfig = {
        self: 'self',
        links: '_links',
        page: 'page',
        embedded: '_embedded',
        linksUrl: 'href'
    }

    constructor() {
        ReactRest.this = this;
    }

    // Fetch item/s using url/param from backend GET request/local cache
    // Add item to cache in backend GET request
    public getFromUrl(url, dtoFn, method?: any, apiData?: any, queryParams?: any, isCacheDisabled?: boolean) {
        var startTime = Date.now();
        queryParams = queryParams || {};

        var data;

        if (!isCacheDisabled && data) {
            return Q.when(data);
        }
        method = method ? method : httpMethod.GET;
        return axios({
            url: url,
            method: method,
            params: queryParams,
            data: apiData,
            errorHandlerConfigs: { preventAlert: true },
        }).then((result) => {
            var response = this.getResponseObjectFromRestData(result, dtoFn);
            return response;
        });
    }

    // Create new object at frontend and assign create and getSaveUrl functions(to be used on backend call).
    public createNew(rootUrl, dtoFn, params?, dto?) {
        if (!rootUrl || !dtoFn) return;
        var self = <any>this;
        var obj = dtoFn
            ? (new dtoFn(params || {}))
            : self.dtoFn ? new self.dtoFn(params || {}) : {};

        if (dto) {
            for (var prop in dto) {
                obj[prop] = dto[prop];
            }
        }

        obj.create = this.createItem;

        if (obj instanceof DtoBase) {
            obj.setGetSaveUrl(rootUrl);
        } else {
            var strFnBody = 'return "' + rootUrl + '";';
            obj.getSaveUrl = new Function(strFnBody)
        }
        return obj;
    }

    // Create new item at backend using POST and remove prev cached item
    public createItem(saveUrl) {
        var startTime = Date.now();
        var self = <any>this;
        var obj: any = ReactRest.cloneAndFormat(this);
        saveUrl = saveUrl || self.getSaveUrl();

        return axios.post(saveUrl, obj, { cache: false })
            .then((success) => {
                self._id = success.data['_id'];
                self.accessMask = success.data['accessMask'];
                self._links = success.data['_links'];
                self.update = ReactRest.this.updateItem;
                self.delete = ReactRest.this.deleteItem;
                var newLink = success.data['_links']['self']['href'];
                return newLink;
            }).catch(error => {
                return Q.reject(error);
            });
    }

    // Update item at backend using PUT and remove prev cached item
    public updateItem() {
        // "this" is current dto object, not angular rest.
        var startTime = Date.now();
        var currentObj: any = this;

        if (!Utils.checkNested(currentObj, [RestConfig.links, RestConfig.self, RestConfig.linksUrl])) {
            alert(messages.urlBlankorEmpty);
            return Q.reject(messages.urlBlankorEmpty);
        }

        var obj = ReactRest.cloneAndFormat(currentObj);
        var url = currentObj[RestConfig.links][RestConfig.self][RestConfig.linksUrl];
        return axios.put(url, obj)
            .then(success => {
                try {
                    var relativeUrlBase = obj.getRelativeUrlBase(url);
                } catch (error) {
                }
            }).catch(error => {
                return Q.reject(error);
            });
    }

    // Delete item at backend using DELETE and remove prev cached item
    public deleteItem() {
        // "this" is current dto object, not angular rest.
        //ReactRest.this.notificationService.toastAndLogMessage(rfx.enums.messageType.ERROR, 'Delete Not Supported');
        //return Q.reject({ "data": { "message": "delete not supported" } });
        var currentObj: any = this;

        if (!Utils.checkNested(currentObj, [RestConfig.links, RestConfig.self, RestConfig.linksUrl])) {
            alert(messages.urlBlankorEmpty);
            return Q.when();
        }

        var url = currentObj[RestConfig.links][RestConfig.self][RestConfig.linksUrl];
        return axios.delete(url)
            .then(success => {
                try {
                    var relativeUrlBase = currentObj.getRelativeUrlBase(url);
                } catch (error) {
                }
            }).catch(error => {
                return Q.reject(error);
            });
    }

    // Create multiple item in batch at backend using POST and remove prev cached item
    public createItems(url: string, items: Array<any>) {
        var startTime = Date.now();
        if (!url) {
            url = this.getBulkUrl(items);
        }
        var self = <any>this;
        var formattedItems = Enumerable.from(items)
            .select(x => ReactRest.cloneAndFormat(x))
            .toArray();

        return axios.post(url, formattedItems, { cache: false })
            .then(success => {
            }).catch(error => {
                return Q.reject(error);
            });
    }

    // Update multiple item in batch at backend using PUT and remove prev cached item
    public updateItems(url: string, items: Array<any>) {
        var startTime = Date.now();
        if (!url) {
            url = this.getBulkUrl(items);
        }

        var formattedItems = Enumerable.from(items)
            .select(x => ReactRest.cloneAndFormat(x))
            .toArray();
        return axios.put(url, formattedItems, { cache: false }) //, {cache: false}
            .then(success => {

            }).catch(error => {
                return Q.reject(error);
            });
    }

    // Delete multiple item in batch at backend using DELETE and remove prev cached item
    public deleteItems(url: string, items: Array<any>) {
        // ReactRest.this.notificationService.toastAndLogMessage(rfx.enums.messageType.ERROR, 'Delete Not Supported');
        //return Q.reject({ "data": { "message": "delete not supported" } });
        if (!url) {
            url = this.getBulkUrl(items);
        }

        var requestObj = {
            headers: {
                'Content-Type': 'application/json'
            },
            data: items
        };

        return axios.delete(url, requestObj)
            .then(success => {
            }).catch(error => {
                return Q.reject(error);
            });
    }



    public getResponseObjectFromRestData(result: any, dtoFn: any) {
        var response;
        var data = result.data;

        // Data can only be null if tried to access nested object and url not found.
        if (data == null) {
            response = new RestResponse(enums.resultStatus.SUCCESS, data, null, false, dtoFn);
        }
        else if (data[RestConfig.embedded] && this.getFirstKeyFromEmbedded(data[RestConfig.embedded]) != "") {
            var responseData = [];
            var key = this.getFirstKeyFromEmbedded(data[RestConfig.embedded]);
            Enumerable.from(data[RestConfig.embedded][key]).forEach((value, index) => {

                var newObj = this.getFromJson(value, dtoFn);
                responseData.push(newObj);

            });
            response = new RestResponse(
                enums.resultStatus.SUCCESS, responseData, data[RestConfig.links], data[RestConfig.page], dtoFn);
        }
        else {
            if (data instanceof Array) {
                var responseData = [];
                Enumerable.from(data).forEach((value) => {
                    var newObj = this.getFromJson(value, dtoFn);
                    responseData.push(newObj);
                });
                response = new RestResponse(
                    enums.resultStatus.SUCCESS, responseData, data[RestConfig.links], data[RestConfig.page], dtoFn);
            } else {
                var newObj = this.getFromJson(data, dtoFn);
                response = new RestResponse(
                    enums.resultStatus.SUCCESS, newObj, data[RestConfig.links], data[RestConfig.page], dtoFn);
            }
        }
        return response;
    }

    // return first key
    private getFirstKeyFromEmbedded(data): string {
        var key = '';
        for (var prop in data) {
            if (prop != "approvedBy" && prop != "createdBy" && prop != "lastModifiedBy")
                key = prop;
        }
        return key;
    }

    public getFromJson(obj, dtoFn): any {
        // If null, return as it is. (No need to process null object.)
        if (obj == null) {
            return obj;
        }

        var newObj = dtoFn ? new dtoFn(obj) : obj;
        //if (!newObj._links) {
        //    newObj._links = obj ? obj[RestConfig.links] : null;
        //}
        newObj._links = obj ? obj[RestConfig.links] : null;
        newObj.create = this.createItem;
        newObj.update = this.updateItem;
        newObj.delete = this.deleteItem;
        return newObj;
    }

    private getBulkUrl(items: Array<any>) {
        var url;
        if (items && items.length > 0) {
            var index = 0;
            while (!url) {
                if (items[index]._links && items[index]._links.self && items[index]._links.self.href) {
                    url = items[index]._links.self.href;
                    url = url.substring(index, url.lastIndexOf('/'));
                } else {
                    url = items[index].getSaveUrl();
                }
                index++;
            }
        }
        return url;
    }

    private static deleteNestedParentAndChildren(prop, clone) {
        if (clone[prop] instanceof Object) {
            for (var prp in clone[prop]) {
                if ((<string>prp).indexOf('_parent') == 0 && prp != '_links') {
                    delete clone[prop][prp];
                }
                if (clone[prop][prp] instanceof Object) {
                    ReactRest.deleteNestedParentAndChildren(prp, clone[prop][prp]);
                }
            }
        }
    }

    public static cloneAndFormat(obj) {
        var clone = JSON.parse(JSON.stringify(obj));
        //if obj has _links
        if (obj[RestConfig.links]) {
            for (var prop in obj[RestConfig.links]) {
                // Copy only url from object for each property in _links
                if (prop != RestConfig.self) {
                    if (obj[prop] instanceof Object) {
                        // If type of object and _links.self.href exist, then replace object with _links.self.href
                        // because that is the format accepted by rest apis.
                        if (obj[prop] instanceof Array) { // && obj[prop].length > 0 && typeof obj[prop][0] == "string"
                            //do nothing
                        } else {
                            if (Utils.checkNested(obj[prop], [RestConfig.links, RestConfig.self, RestConfig.linksUrl])) {
                                clone[prop] = obj[prop]['_id'];
                            }
                            // Else type of object and _links.self.href does not exist, then obj is probably not created yet. Create separtely, so delete from here.
                            else {
                                //delete clone[prop];
                            }
                        }
                    }
                    // If array, we can directly delete the prop as it will be created separately with parentid.
                    else if (obj[prop] instanceof Array) {
                        // delete clone[prop];
                    }
                }
            }
        }

        for (var prop in obj) {
            // delete embedded properties
            if ((<string>prop).indexOf("embedded") == 0) {
                delete clone[prop];
                continue;
            }
            // ReactRest.deleteNestedParentAndChildren(prop, clone);
            // Any Array is Object, but not vice versa. Array is allowed eg. array of links.
            if (obj[prop] instanceof Array) {
                // delete clone[prop];
            }
            // If obj[prop] is object, then replace with its link.
            else if (obj[prop] instanceof Object) {
                if (Utils.checkNested(obj[prop], [RestConfig.links, RestConfig.self, RestConfig.linksUrl])) {
                    clone[prop] = obj[prop]['_id'];
                }
            }
        }
        return clone;
    }
}
