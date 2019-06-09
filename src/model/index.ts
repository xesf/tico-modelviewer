import * as THREE from 'three';
import { loadHqr } from '../hqr';
import { loadEntity, getBodyIndex, getAnimIndex, getAnim, Entity } from './entity';
import { loadBody } from './body';
import { loadAnim } from './anim';
import {
    initSkeleton,
    createSkeleton,
} from './animState';
import { loadMesh } from './geometries';
import { loadTextureRGBA } from '../texture';
import { createBoundingBox } from '../utils/rendering';
import { loadLUTTexture } from '../utils/lut';

export interface Model {
    state: any;
    anims: any;
    files?: any;
    entities: Entity[];
    mesh: THREE.Object3D;
}

export async function loadModel(params: any,
                          entityIdx: number,
                          bodyIdx: number,
                          animIdx: number,
                          animState: any,
                          envInfo: any,
                          ambience: any) {
    const [ress, body, anim, anim3ds, lutTexture, scene] = await Promise.all([
        loadHqr('RESS.HQR'),
        loadHqr('BODY.HQR'),
        loadHqr('ANIM.HQR'),
        loadHqr('ANIM3DS.HQR'),
        loadLUTTexture(),
        loadHqr('STAGE04/RUN0/SCENE.HQR'),
    ]);
    const files = {ress, body, anim, anim3ds, scene};
    return loadModelData(
        params,
        files,
        entityIdx,
        bodyIdx,
        animIdx,
        animState,
        envInfo,
        ambience,
        lutTexture
    );
}

/** Load Models Data
 *  Model will hold data specific to a single model instance.
 *  This will allow to mantain different states for body animations.
 *  This module will still kept data reloaded to avoid reload twice for now.
 */
function loadModelData(params: any,
                       files,
                       entityIdx,
                       bodyIdx,
                       animIdx,
                       animState: any,
                       envInfo: any,
                       ambience: any,
                       lutTexture: THREE.Texture) {
    if (entityIdx === -1 || bodyIdx === -1 || animIdx === -1)
        return null;

    const palette = new Uint8Array(files.ress.getEntry(0));
    const entityInfo = files.ress.getEntry(44);
    const entities = loadEntity(entityInfo);

    // const palette = new Uint8Array(files.ressourc.getEntry(5));
    const entityInfoTC = files.scene.getEntry(1);
    const entityInfoSizeTC = files.scene.getEntrySize(1);
    const entitiesTC = loadEntity(entityInfoTC, entityInfoSizeTC);
    console.log(entitiesTC);

    // for (let e = 0; e < 114; e += 1) {
    //     try {
    //         const info = files.ressourc.getEntry(e);
    //         const size = files.ressourc.getEntrySize(e);
    //         const ent = loadEntity(info, size);
    //         console.log(`${e}:`, ent);
    //     } catch {}
    // }

    const model = {
        palette,
        lutTexture,
        files,
        bodies: [],
        anims: [],
        texture: loadTextureRGBA(files.ress.getEntry(6), palette),
        state: null,
        mesh: null,
        entities,
        boundingBox: null,
        boundingBoxDebugMesh: null,
    };

    const entity = entities[entityIdx];

    const realBodyIdx = getBodyIndex(entity, bodyIdx);
    const realAnimIdx = getAnimIndex(entity, animIdx);

    const body = loadBody(model, model.bodies, realBodyIdx, entity.bodies[bodyIdx]);
    const anim = loadAnim(model, model.anims, realAnimIdx);

    const skeleton = createSkeleton(body);
    initSkeleton(animState, skeleton, anim.loopFrame);
    model.mesh = loadMesh(
        body,
        model.texture,
        animState.bones,
        animState.matrixRotation,
        model.palette,
        model.lutTexture,
        envInfo,
        ambience
    );

    if (model.mesh) {
        model.boundingBox = body.boundingBox;
        if (params.editor) {
            model.boundingBoxDebugMesh = createBoundingBox(
                body.boundingBox,
                new THREE.Vector3(1, 0, 0)
            );
            model.boundingBoxDebugMesh.name = 'BoundingBox';
            model.boundingBoxDebugMesh.visible = false;
            model.mesh.add(model.boundingBoxDebugMesh);
        }
    }

    return model;
}
