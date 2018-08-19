import * as Enumerable from 'linq';
import { AccessMask, actionType, ApprovalStatusEnum, RoleEnum, Status } from '../../enums';
import { DtoBase, IDtobase, Self } from '../../dtos/base/dtoBase';
import { ModelBase } from './model-base';
export class TrackEntity {
    _isCreated: boolean = false;
    _isUpdated: boolean = false;
    _isDeleted: boolean = false;
    _isBlank: boolean = false;
    _parent: ModelBase;
    _parentUnset: boolean = false;
    public IsEnable: boolean = true;
    public CanDelete: boolean = true;

    private _isChildUpdated: boolean = false;
    private _children: Array<ModelBase>;

    constructor() {
        this._children = [];
    }

    getParent() {
        return this._parent;
    }

    // set parent of the entity, and sets child of the parent entity
    setParent(parent) {
        if (parent) {
            this._parent = parent;
            //multiple children were set, so this check will not allow to do the same.
            if (Enumerable.from(this._parent._children).any((x) => { return x === this })) {
                return;
            }
            this._parent._children ? this._parent._children.push(<any>this) : this._parent._children = [<any>this];
        }
    }

    resetParent() {
        if (!this._parent) {
            return;
        }
        var index = this._parent._children.indexOf(<any>this);
        this._parent._children.splice(index, 1);
        this._parent = null;
    }

    parentUnset(parentUnset?: boolean) {
        if (typeof parentUnset !== 'undefined') {
            this._parentUnset = parentUnset;
        }
        return this._parentUnset;
    }

    resetChildren(newChildren?: Array<ModelBase>, oldChildren?: Array<ModelBase>) {
        oldChildren = oldChildren || this._children;

        Enumerable.from(oldChildren).forEach(child => {
            child.parentUnset(true);
        });

        Enumerable.from(newChildren).forEach(child => {
            if (child.getParent()) {
                this && child.setParent(this);
            }
            child.parentUnset(false);
        });
    }

    setdefault() {
        if (this._isDeleted) {
            this._parent && this._parent.children().splice(this._parent.children().indexOf(<any>this), 1);
            this._isChildUpdated = false;
        }
        this._isCreated = false;
        this._isUpdated = false;
        this._isDeleted = false;
        this._isBlank = false;
        this._parent && this._parent.resetChildUpdated();
    }

    isDefault() {
        return this._isCreated == false && this._isUpdated == false && this._isDeleted == false && this._isBlank == false;
    }

    resetChildUpdated() {
        if (Enumerable.from(this._children).any(x => !x.isDefault())) {
            return;
        }
        this._isChildUpdated = false;
        this._parent && this._parent.resetChildUpdated();
    }

    getIsCreated() {
        return this._isCreated;
    }

    setIsCreated(value) {
        if (value) this.setdefault();
        this._isCreated = value;
        // Update parent's child updated property when new model is created
        this.setChildModifiedInParent();
    }

    getIsBlank() {
        return this._isBlank;
    }

    setIsBlank(value) {
        if (value) this.setdefault();
        this._isBlank = value;
    }

    getIsUpdated() {
        return this._isUpdated;
    }

    // TODO: Do not use this method. Instead use setModified.
    setIsUpdated(value) {
        if (value) this.setdefault();
        this._isUpdated = value;
        // Update parent's child updated property when model is updated
        this.setChildModifiedInParent();
    }

    getIsDeleted() {
        return this._isDeleted;
    }

    setIsDeleted(value: boolean) {
        this._isDeleted = value;
        // Update parent's child updated property when model is marked as deleted
        this.setChildModifiedInParent();
    }

    setModified() {
        try {
            if (this._isUpdated) return;

            //if (this._isBlank) {
            //    this.setIsCreated(true);
            //    //if (this._parent) this._parent.setModified();
            //    this._parent.isChildUpdated(true);
            //    return;
            //}
            //if (this._isCreated) {
            //    if (this._parent) this._parent.setModified();
            //    return;
            //}
            if (this._isBlank) {
                this.setIsCreated(true);
            }
            else if (this._isCreated) {
                // do nothing
            }
            else {
                this.setIsUpdated(true);
            }
            this.setChildModifiedInParent();
        }
        catch (ex) {
        }

    }

    addChild(child: ModelBase): void {
        if (!this._children) {
            this._children = [];
        }
        this._children.push(child);
    }

    children(children?: Array<ModelBase>): Array<ModelBase> {
        if (typeof children !== 'undefined') {
            this._children = children;
            Enumerable.from(children).forEach(child => {
                if (!child._parent && child._parent != <any>this) {
                    child.setParent(this);
                }
            });
        }
        return this._children;
    }

    getChildrenBySeq() {
        return Enumerable.from(this._children).orderBy((x) => x.seq()).toArray();
    }


    isChildUpdated(value?: boolean) {
        if (typeof value !== 'undefined') {
            // if true, travel the tree to set all parent's childupdated as true
            if (value == true) {
                this._isChildUpdated = true;
            }
            // if false, if none of the children are updated then set childudpated as false and check for its parents childupdated property
            else if (Enumerable.from(this._children).all(x => { return x.getIsUpdated() === false; })) {
                this._isChildUpdated = false;
            }
            // if false, if any of the children is updated then do not set childudpated and return
            else {
                return;
            }
            if (this._parent) {
                this._parent.isChildUpdated(value);
            }
        }
        return this._isChildUpdated;
    }

    private setChildModifiedInParent() {
        if (this._parent && !this._parent.isChildUpdated()) {
            //this._parent.setModified();
            this._parent.isChildUpdated(true);
        }
    }

    private setParentModified() {
        if (this._parent) this._parent.setModified();
    }
}