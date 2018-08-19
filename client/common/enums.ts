export class enums {
    public static messageType: any = {
        INFO: 'info',
        ERROR: 'error',
        WARNING: 'warning',
        SUCCESS: 'success'
    }

    public static resultStatus: any = {
        ERROR: 'error',
        SUCCESS: 'success'
    }

    public static modelTrackingType: any = {
        CREATE: 'create',
        BLANK: 'blank',
        NONE: 'none'
    }
}

export class actionType {
    public static CREATE: string = 'create';
    public static UPDATE: string = 'update';
    public static DELETE: string = 'delete';
}

export enum PushNotificationType { task = 0, notification, alert }

export enum QSettledState { FULFILLED = 1, REJECTED };

export enum PushNotificationStatus { CREATED = 0, READ, COMPLETE };

export enum AccessMask {
    CANREAD = 1,
    CANSAVE = 2,
    CANDELETE = 8
};

export enum StatusEnum {
    NOTSTARTED = 1,
    INPROGRESS = 2,
    COMPLETED = 3
}

export enum ModuleType {

};

export enum VisibleMask {

}

export enum Status { created = 0, inprogress, completed, errored };

export enum ApprovalStatusEnum {
    NOT_REQUIRED = 0,
    REQUIRED,
    APPROVED,
    UNAPPROVED
}

export enum RoleEnum {
    ROLE_ADMIN = 1,
    ROLE_USER,
    ROLE_CHANGE_PWD,
    ROLE_AUTHOR,
    ROLE_SUPERVISOR,
    ROLE_QA
}

export enum ResponseMode {
}