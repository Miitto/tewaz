/** Unique ID Type. Incase we change to strings later */
export type UID = string;

let nextId = 0;

export function uniqueId(): UID {
	return (nextId++).toString();
}
