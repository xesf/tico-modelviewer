import {loadHqr} from '../../../../../hqr.ts';
import {loadEntity} from '../../../../../model/entity.ts';
import {loadModelsMetaData} from '../../../DebugData';

let loading = false;
let entities = [];

async function loadEntities() {
    loading = true;
    const ress = await loadHqr('STAGE00/RUN0/SCENE.HQR');
    await loadModelsMetaData();
    const entityInfo = ress.getEntry(1);
    const entityInfoSize = ress.getEntrySize(1);
    entities = loadEntity(entityInfo, entityInfoSize);
    loading = false;
}

export function getEntities() {
    if (entities.length === 0 && !loading) {
        loadEntities();
    }
    return entities;
}
