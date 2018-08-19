import { TrackEntity } from './track-entity';
import { DtoBase, IDtobase, Self } from '../../dtos/base/dtoBase';
import * as Enumerable from 'linq';
import { AccessMask, actionType, ApprovalStatusEnum, RoleEnum, Status } from '../../enums';
export class ModelBase extends TrackEntity {

    private _dto: any = null;//_dto is of type DtoBase
    private _selected: boolean = false;

    getDto(): any {
        if (this._dto != null) return this._dto;
        this.refreshDto();
        return this._dto;
    }

    refreshDto() {
        for (var prop in this) {
            if (this[prop] instanceof DtoBase && this._dto != this[prop]) {
                this._dto = this[prop];
                return;
            }
        }
    }

    equals(model2: ModelBase) {
        if (this.getDto() == null) return false;
        if (model2.getDto() == null) return false;
        return this.getDto().equals(model2.getDto());
    }

    getEqualModelFromList(models: Array<ModelBase>) {
        if (!models) return;
        if (models.length == 0) return;
        return Enumerable.from(models)
            .firstOrDefault(undefined,
                (x: ModelBase) => {
                    return x.equals(this)
                });
    }

    static getEqualModelFromListByUrl(models: Array<ModelBase>, url: string) {
        if (!models) return;
        if (models.length == 0) return;
        return Enumerable.from(models)
            .where(model => model.getDto()._links.self.href == url)
            .firstOrDefault(undefined);
    }

    static getFromList(url: string, models: Array<ModelBase>) {

        if (!url || !models || models.length == 0) return;
        return Enumerable.from(models)
            .firstOrDefault(undefined, x => url == x.getDto()._links.self.href);
    }

    selected(selected?: boolean): boolean {
        if (typeof selected !== 'undefined') {
            this._selected = selected;

        }
        return this._selected;
    }

    originId(originId?: number): number {
        if (typeof originId !== 'undefined') {
            this.getDto().originId = originId;
            this.setModified();
        }
        return this.getDto().originId;
    }

    approved(approved?: boolean): boolean {
        if (typeof approved !== 'undefined') {
            this.getDto().approved = approved;
            this.setModified();
        }
        return this.getDto().approved;
    }

    reasonForUnApproval(reasonForUnApproval?: string): string {
        if (typeof reasonForUnApproval !== 'undefined') {
            this.getDto().reasonForUnApproval = reasonForUnApproval;
            this.setModified();
        }
        return this.getDto().reasonForUnApproval;
    }

    createdDate(): Date {
        return this.getDto().createdDate;
    }

    lastModifiedDate(): Date {
        return this.getDto().lastModifiedDate;
    }

    parentId(parentId?: number): number {
        if (typeof parentId !== 'undefined') {
            this.getDto().parentId = parentId;
            this.setModified();
        }
        return this.getDto().parentId;
    }

    approvedDate(): Date {
        return this.getDto().approvedDate;
    }

    globalAccessMask(globalaccessMask?: number): number {
        if (typeof globalaccessMask !== 'undefined') {
            this.getDto().globalAccessMask = globalaccessMask;
            this.setModified();
        }
        return this.getDto().globalAccessMask;
    }

    usersAccessMask(useraccessMask?: string): string {
        if (typeof useraccessMask !== 'undefined') {
            this.getDto().usersAccessMask = useraccessMask;
            this.setModified();
        }
        return this.getDto().usersAccessMask;
    }

    rolesAccessMask(rolesAccessMask?: string): string {
        if (typeof rolesAccessMask !== 'undefined') {
            this.getDto().rolesAccessMask = rolesAccessMask;
            this.setModified();
        }
        return this.getDto().rolesAccessMask;
    }

    accessMask(): number {
        if (!this.getDto()) {
            return null;
        }
        return this.getDto().accessMask;
    }

    canRead(): boolean {
        if (!this.getDto()) {
            return null;
        }
        if ((this.getDto().accessMask & AccessMask.CANREAD) == AccessMask.CANREAD) {
            return true;
        }
        return false;
    }

    canSave(): boolean {
        if (1 == 1) {
            return true;
        }
        if (!this.getDto()) {
            return null;
        }
        if ((this.getDto().accessMask & AccessMask.CANSAVE) == AccessMask.CANSAVE) {
            return true;
        }
        return false;
    }

    canDelete() {
        if (1 == 1) {
            return true;
        }
        if (!this.getDto()) {
            return null;
        }
        if ((this.getDto().accessMask & AccessMask.CANDELETE) == AccessMask.CANDELETE) {
            return true;
        }
        return false;
    }

    timelineExpired() {
        return this.getDto().timelineExpired;
    }

    isMandatoryGuidelineAccepted() {
        if (this.getDto().isMandatoryGuidelineAccepted == false) {
            return this.getDto().isMandatoryGuidelineAccepted;
        } else {
            return true;
        }
    }

    isApprover() {
        return this.getDto().canApprove;
    }

    valid(valid?: boolean): boolean {
        if (!this.getDto()) {
            return null;
        }
        if (typeof valid !== 'undefined') {
            this.getDto().valid = valid;
        }
        return this.getDto().valid;
    }

    validationError(validationError?: string): string {
        if (!this.getDto()) {
            return null;
        }
        if (typeof validationError !== 'undefined') {
            this.getDto().validationError = validationError;
        }
        return this.getDto().validationError;
    }

    error(field?): any {
        return this.getDto().error(field);
    }

    errorFormatted(field?) {
        return this.getDto().errorFormatted(field);
    }

    isInactive(isInactive?): boolean {
        if (typeof isInactive !== 'undefined') {
            this.getDto().isInactive = isInactive;
            //this.setModified();
        }
        return this.getDto().isInactive;
    }

    status(status?: number): any {
        if (!this.getDto()) {
            return null;
        }
        if (typeof status !== 'undefined') {
            this.getDto().status = Status[status];
            this.setModified();
        }
        return <any>Status[this.getDto().status];
    }

    seq(sequence?: number): number {
        if (!this.getDto()) {
            return null;
        }
        if (typeof sequence !== 'undefined') {
            this.getDto().sequence = sequence;
            this.setModified();
        }
        return this.getDto().sequence;
    }

    getSelfId(): any {
        var dto = this.getDto();
        if (dto == null) {
            return null;
        }
        return dto.getSelfId();
    }

    getSelfLink(): string {
        var dto = this.getDto();
        if (dto == null) {
            return null;
        }
        return dto.getSelfLink();
    }

    setSelfLink(path: string): void {
        var dto = this.getDto();
        if (dto == null) {
            return null;
        }
        dto.setSelfLink(path);
    }

    setChildLink(child?, path?): void {
        var dto = this.getDto();
        if (dto == null) {
            return null;
        }
        dto.setChildLink(child, path);
    }

    // gets the self link or sets the self link from id and returns the link
    getSelfLinkSafe(path: string): string {
        path && !this.getSelfLink() && this.setSelfLink(path);
        return this.getSelfLink();
    }

    getParentUrl(): string {
        return this.getParent().getDto()._links.self.href;
    }

    // Not doing anything, will be overridden by derived classes
    setParentUrl() {
        return;
    }

    removeChildFromDto() {
        return;
    }

    addChildInDto() {
        return;
    }

    //this method should not be set to return true in case of test in table, else data won't be saved
    isChildSaveBulk() {
        return false;
    }

    isComplete(): boolean {
        return this.status() == 2;
    }

    getEntityType(): string {
        return null;
    }

    hasReviewComments(hasReviewComments?: boolean): boolean {
        return this.getDto().hasReviewComments;
    }

    // check permission before procedding
    setIsUpdated(value) {
        if (this.canSave()) {
            super.setIsUpdated(value);
        }
    }

    // check permission before procedding
    setModified() {
        if (this.canSave()) {
            super.setModified();
        }
    }

    setModifiedWithoutCheck() {
        super.setModified();
    }

    setIsUpdatedWithoutCheck(value) {
        super.setIsUpdated(value);
    }

    // check permission before procedding
    setIsDeleted(value) {
        if (this.canDelete()) {
            super.setIsDeleted(value);
        }
    }

}