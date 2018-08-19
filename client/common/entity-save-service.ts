import * as Q from 'q';
import * as Enumerable from 'linq';

import { ModelBase } from './models/base/model-base';
import { DtoBase } from './dtos/base/dtoBase';
import { Utils } from './utils';
import { actionType } from './enums';
import { Serial } from './serial';
import { ReactRest } from './react-rest';


export class EntitySaveService {
    reactRestObj = null;
    constructor() {
        this.reactRestObj = new ReactRest();
    }
    public save(models: Array<ModelBase>, saveChildren?: boolean) {
        // Base case: check if models is null or empty
        if (!(models && models.length)) {
            return Q.when(null);
        }
        var asyncSaveModels: Array<ModelBase> = []
        var asyncCalls = []

        this.removeSaveExclusionModels(models);

        Enumerable.from(this.getCreatedModels(models)).forEach((model) => {
            asyncSaveModels.push(model);
            asyncCalls.push(Utils.getTask(this, this.saveEntity, [model, actionType.CREATE]));
        });

        Enumerable.from(this.getUpdatedModels(models)).forEach((model) => {
            asyncSaveModels.push(model);
            asyncCalls.push(Utils.getTask(this, this.saveEntity, [model, actionType.UPDATE]));
        });

        Enumerable.from(this.getDeletedModels(models)).forEach((model) => {
            asyncSaveModels.push(model);
            asyncCalls.push(Utils.getTask(this, this.saveEntity, [model, actionType.DELETE]));
        });

        return Serial.serial(asyncCalls)
            .then(success => {
                return this.saveChildren(success, models, saveChildren);
            }, error => {
                return Q.reject(error);
            });
    }

    private saveChildren(success: any, models: Array<ModelBase>, saveChildren?: boolean) {
        if (saveChildren == false) { return <any>Q.when(success); }
        var childAsyncCalls = [];
        Enumerable.from(models).forEach(model => {
            if (!model.isChildUpdated()) {
                //continue the loop
                return;
            }
            if (model.isChildSaveBulk()) {
                childAsyncCalls.push(Utils.getTask(this, this.saveBulk, [model.getChildrenBySeq()]));
            } else {
                childAsyncCalls.push(Utils.getTask(this, this.save, [model.getChildrenBySeq()]));
                /*angular.forEach(model.getChildrenBySeq(),(child) => {
                    childAsyncCalls.push(Utils.getTask(this, this.save, [[child]]));
                });*/
            }
        });
        // Save the children once the parent is saved.
        // if (!childAsyncCalls.length) return deferred.promise;
        return Serial.serial(childAsyncCalls);
    }

    // save models in bulk, i.e. all the created at once, updated at once and deleted at once.
    public saveBulk(models: Array<ModelBase>) {
        var allAsyncCalls = [];

        this.removeSaveExclusionModels(models);
        Enumerable.from(models).forEach(model => model.setParentUrl());

        var createdModels = this.getCreatedModels(models);
        var updatedModels = this.getUpdatedModels(models);
        var deletedModels = this.getDeletedModels(models);
        Enumerable.from(models).forEach(model => {
            model.setdefault();
        });
        if (createdModels && createdModels.length > 0) {
            allAsyncCalls.push(Utils.getTask(this.reactRestObj, this.reactRestObj.createItems, [null, this.getDtos(createdModels)]));
        }
        if (updatedModels && updatedModels.length > 0) {
            allAsyncCalls.push(Utils.getTask(this.reactRestObj, this.reactRestObj.updateItems, [null, this.getDtos(updatedModels)]));
        }
        if (deletedModels && deletedModels.length > 0) {
            allAsyncCalls.push(Utils.getTask(this.reactRestObj, this.reactRestObj.deleteItems, [null, this.getDtos(deletedModels)]));
        }

        return Serial.serial(allAsyncCalls)
            .then(success => {
                return success;
            }).catch(error => {
                Enumerable.from(models).forEach(model => {
                    if (this.presentInList(model, createdModels)) model.setIsCreated(true);
                    if (this.presentInList(model, updatedModels)) model.setIsUpdated(true);
                    if (this.presentInList(model, deletedModels)) model.setIsDeleted(true);
                });
                throw error;
            });
    }

    private presentInList(searchItem: ModelBase, targetList: Array<ModelBase>) {
        var isPresent = false;
        if (!searchItem) return false;
        if (!targetList) return false;
        Enumerable.from(targetList).forEach((x: ModelBase) => {
            if (x.getSelfId() == searchItem.getSelfId()) {
                isPresent = true;
            }
        });
        return isPresent;
    }

    // save parent and the children
    private saveEntity(model: ModelBase, actionType: string) {
        var dto = model.getDto();

        if (!dto) {
            return Q.reject("Get dto from model error.");
        }
        if (typeof dto[actionType] !== "function") {
            return Q.when();
        }

        // set parent url in the child object for foreign key in database
        model.setParentUrl();
        model.removeChildFromDto();
        var originalModelCreateState = model.getIsCreated();
        var originalModelUpdateState = model.getIsUpdated();
        var originalModeldeleteState = model.getIsDeleted();
        model.setdefault();
        return dto[actionType]()
            .then(success => {
                model.addChildInDto();
                return success;
            }).catch(error => {
                model.addChildInDto();
                if (originalModelCreateState) model.setIsCreated(originalModelCreateState);
                if (originalModelUpdateState) model.setIsUpdated(originalModelUpdateState);
                if (originalModeldeleteState) model.setIsDeleted(originalModeldeleteState);
                throw error;
            });
    }

    private removeSaveExclusionModels(models: Array<ModelBase>) {
        // Remove models that we do not need to save:
        // 1. CREATED but marked DELETED
        // 2. BLANK
        // 3. CREATED but PARENTUNSET
        var saveExclusionModels = Enumerable.from(models)
            .where(x => (x.getIsCreated() && x.getIsDeleted()) || x.getIsBlank() || (x.getIsCreated() && x.parentUnset()))
            .toArray();

        while (saveExclusionModels.length) {
            var excludeModel = saveExclusionModels.pop();
            var index = models.indexOf(excludeModel);
            if (index > -1) {
                models.splice(index, 1);
            }
        }
    }


    private getDtos(models: Array<ModelBase>): Array<DtoBase> {
        return Enumerable.from(models)
            .select(x => x.getDto())
            .toArray();
    }

    // Get all CREATED models
    private getCreatedModels(models: Array<ModelBase>) {
        return Enumerable.from(models)
            .where(x => x.getIsCreated())
            .toArray();
    }

    // Get all UPDATED but not marked DELETED models or PARENTUNSET
    private getUpdatedModels(models: Array<ModelBase>) {
        return Enumerable.from(models)
            .where(x => x.getIsUpdated() && !(x.getIsDeleted() || x.parentUnset()))
            .toArray();
    }

    // Get all DELETED models and PARENTUNSET models
    private getDeletedModels(models: Array<ModelBase>) {
        let deletedIndexes = [];
        var deletedModels = Enumerable.from(models)
            .where((x, index) => {
                if (x.getIsDeleted() || x.parentUnset()) {
                    deletedIndexes.push(index);
                    return true;
                }
            })
            .toArray();
        if (deletedIndexes && deletedIndexes.length) {
            deletedIndexes.reverse();
            Enumerable.from(deletedIndexes)
                .forEach((indexNumber) => {
                    models.splice(indexNumber, 1);
                });
        }
        return deletedModels;
    }
}
