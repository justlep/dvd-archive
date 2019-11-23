import { writable } from 'svelte/store';
import api from './util/api';
import Disc from './model/Disc';

export const allDiscs = writable(null);

export const editedDisc = writable(null);

export const loadingDiscsPromise = writable(null);

export function editDisc(discToEdit) {
    editedDisc.update(() => discToEdit);
}

/**
 * @param {type Disc} disc
 */
export async function saveOrUpdateDisc(disc) {
    let discJson = disc.toJson(),
        {id} = disc,
        savedDiscJson;

    try {
        let result = id ? await api.put(`/disc/${id}`, discJson) :
                          await api.post('/disc', discJson);

        // TODO just add or update the actual disc object in the existing list?
        // savedDiscJson = result.savedDisc;
        setTimeout(reloadDiscs, 0);
    } catch (err) {
        throw 'Failed to save';
    }
}

export function reloadDiscs() {
    loadingDiscsPromise.update(oldPromise => {
        allDiscs.update(() => []);
        return new Promise(async (resolve, reject) => {
            try {
                let {discs} = await api.get('/disc');
                resolve(discs.map(discJson => new Disc(discJson)));
            } catch (err) {
                reject(err);
            }
        });
    });
}
