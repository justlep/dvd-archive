import { writable } from 'svelte/store';

export const editedDisc = writable(null);

export function editDisc(discToEdit) {
    editedDisc.update(() => discToEdit);
}
