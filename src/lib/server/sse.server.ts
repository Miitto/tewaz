import { EventEmitter } from 'node:events';

interface Payload {
	id: number;
	event?: string;
	data: unknown;
}

export function createSSE(last_id = 0, retry = 0) {
	let id = last_id;
	const { readable, writable } = new TransformStream({
		start(controller) {
			controller.enqueue(': hello\n\n');

			if (retry > 0) controller.enqueue(`: retry: ${retry}\n\n`);
		},
		transform({ event, data }, controller) {
			const obj: Payload = {
				id: ++id,
				data: data
			};
			if (event) obj.event = event;

			controller.enqueue(JSON.stringify(obj));
		}
	});

	const writer = writable.getWriter();

	return {
		readable,
		/**
		 * @param {import('node:events').EventEmitter} eventEmitter
		 * @param {string} event
		 */
		async subscribe(eventEmitter: EventEmitter, event: string) {
			function listener(data: unknown) {
				writer.write({ event, data });
			}

			eventEmitter.on(event, listener);
			await writer.closed.catch(() => {});
			eventEmitter.off(event, listener);
		}
	};
}
