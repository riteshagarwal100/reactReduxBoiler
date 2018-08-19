import { KeyValuePair, Utils, IKeyValuePair } from '../../utils';
export interface Self {
    self: {
        href: string
    }
}
export interface IDtobase {
    _id: string;
    originId: number;
    isDeleted: boolean;
    approved: boolean;
    reasonForUnApproval: string;
    createdBy;
    createdDate;
    lastModifiedBy;
    lastModifiedDate;
    approvedByUserId: number;
    approvedDate: Date;
    approvalStatusRoleWise: string;
    rolesAccessMask: string;
    globalAccessMask: number;
    usersAccessMask: string;
    accessMask: number;
    valid: boolean;
    validationError: any;
    isInactive: boolean;
    status: number;
    seq: number;
    getSelfId(): number;
    canApprove: boolean;
    reviewInvalid: boolean;
    hasReviewComments: boolean;
    curReviewComment: string;
    reviewComments: Array<any>;
    reviewInvalidFields: string;
    curUserApproverType: string;
    approvalStatus: string;
    _links: Self;
    parentId: number;
    authoringStatus: number;
    markAsComplete: boolean;
}

export class DtoBase {
    _id: string;
    originId: number;
    isDeleted: boolean;
    approved: boolean;
    reasonForUnApproval: string;
    createdById: number;
    createdBy;
    createdDate;
    lastModifiedBy;
    lastModifiedDate;
    approvedByUserId: number;
    approvalStatusRoleWise: string;
    rolesAccessMask: string;
    approvedDate: Date;
    globalAccessMask: number;
    usersAccessMask: string;
    accessMask: number;
    valid: boolean;
    validationError: any;
    isInactive: boolean;
    status: number;
    seq: number;
    canApprove: boolean;
    reviewInvalid: boolean;
    hasReviewComments: boolean;
    reviewComments: Array<any>
    curReviewComment: string;
    reviewInvalidFields: string;
    curUserApproverType: string;
    approvalStatus: string;
    _links: Self;
    parentId: number;
    authoringStatus: number;
    markAsComplete: boolean;

    constructor(params?: any) {
        params = params || <IDtobase>{};
        this._id = params._id;
        this._links = params._links;
        this.parentId = params.parentId;
        this.accessMask = params.accessMask;
        this.createdById = params.createdBy;
        this.createdBy = params.createdByName;
        this.createdDate = params.createdDate;
        this.lastModifiedBy = params.lastModifiedByName;
        this.lastModifiedDate = params.lastModifiedDate;
        this.seq = params.seq;
        this.authoringStatus = params.authoringStatus;
        this.markAsComplete = params.markAsComplete;
    }


    equals(dto2: DtoBase) {
        var link1 = this._links && this._links.self && this._links.self.href;
        var link2 = dto2._links && dto2._links.self && dto2._links.self.href;

        if (link1 == "" || link2 == "") {
            return false;
        }
        if (typeof link1 !== 'undefined' && typeof link2 !== 'undefined') {
            return link1 && link2 && link1 == link2;
        }
        if (this._id && dto2._id) {
            return this._id == dto2._id;
        }

        return false;
    }

    getSelfId(): string {
        if (typeof this._id !== 'undefined') {
            return this._id;
        }

        if (!Utils.checkNested(this, ['_links', 'self', 'href'])) {
            return null;
        }

        var url = this._links.self.href;
        return url.substring(url.lastIndexOf('/') + 1);
    }

    // Returns self link for the dto.
    getSelfLink(): string {
        if (!Utils.checkNested(this, ['_links', 'self', 'href'])) {
            return null;
        }

        return this._links.self.href;
    }

    setGetSaveUrl(rootUrl: string) {
        var strFnBody;
        if (rootUrl == null || rootUrl == undefined) {
            strFnBody = 'return ' + rootUrl + ';';
        }
        else {
            strFnBody = 'return "' + rootUrl + '";';
        }
        this["getSaveUrl"] = new Function(strFnBody)
    }
}
