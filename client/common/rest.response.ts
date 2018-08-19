
import * as Enumerable from 'linq';
import { httpMethod ,messages} from './resources';
import { ModelBase } from './models/base/model-base';    
import { DtoBase } from './dtos/base/dtoBase'; 
export class RestResponse {
    status: any;
    data: any;
    links: any;
    isArray: boolean;
    dtoFn: any;
    constructor(resultStatus: string,
        data: any,
        links?: any,
        isArray?: boolean,
        dtoFn?: any) {

        this.isArray = Array.isArray(data);;
        this.status = resultStatus;
        var indexArray = [];
        var newdata = this.isArray ? Enumerable.from(data).where((x: DtoBase) => { return x.isDeleted != true }).toArray() : data;
        this.data = this.isArray ? Enumerable.from(newdata).orderBy(<any>"$.seq").toArray() : newdata;
        this.links = links;
        this.dtoFn = dtoFn;
    }

}