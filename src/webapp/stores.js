import { writable, derived, get } from 'svelte/store';
import api from './util/api';
import Disc from './model/Disc';

export const allDiscs = writable(null);

export const editedDisc = writable(null);

export const loadingDiscsPromise = writable(null);

export const filter = writable('');

export const autoScanBarcode = writable(true);
export const autoAddNext = writable(true);

export function editDisc(discToEdit) {
    editedDisc.update(() => discToEdit);
}

export const nextFreeDiscNumber = derived(allDiscs, (discs = []) => discs.reduce((nextNo, disc) => disc.discNumber === nextNo ? nextNo + 1 : nextNo, 1));

export function addDisc() {
    // console.debug('nextFreeDiscNumber: ' + get(nextFreeDiscNumber));
    editDisc( new Disc({discNumber: get(nextFreeDiscNumber)}) );
}

/**
 * @param {type Disc} disc
 */
export async function saveOrUpdateDisc(disc) {
    let discJson = disc.toJson(),
        {id} = disc,
        savedDiscJson;

    try {
        let isNew = !id,
            result = isNew ? await api.post('/disc', discJson) :
                             await api.put(`/disc/${id}`, discJson);

        // TODO just add or update the actual disc object in the existing list?
        // let savedDiscJson = result.disc;
    } catch (err) {
        throw 'Failed to save';
    }

    try {
        await reloadDiscs();
    } catch (err) {
        throw 'Failed to reload discs';
    }
}

/**
 * @param {type Disc} disc
 */
export async function deleteDisc(disc) {
    let {id} = disc,
        savedDiscJson;

    try {
        await api.del('/disc/' + id);

        allDiscs.update(oldDiscs => oldDiscs.filter(d => d.id !== id));

    } catch (err) {
        throw 'Failed to delete disc';
    }
}

export async function lookupTitleForEan(ean) {
    let eanString = String(ean).trim(),
        retVal = null;

    if (eanString) {
        try {
            let {title} = await api.get('/ean/' + eanString);
            retVal = title;
        } catch (err) {
            console.warn(err);
        }
    }

    return retVal;
}

export function reloadDiscs() {
    let newLoadingPromise = new Promise(async (resolve, reject) => {
        allDiscs.update(() => []);
        try {
            let {discs} = await api.get('/disc');
            allDiscs.update(() => discs.map(discJson => new Disc(discJson)));
            resolve();
        } catch (err) {
            reject(err);
        }
    });

    loadingDiscsPromise.update(oldPromise => newLoadingPromise);

    return newLoadingPromise;
}
