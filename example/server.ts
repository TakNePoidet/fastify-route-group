import fastify, { RouteOptions } from 'fastify';
import { Router } from '..';

async function bootstrap() {
	const server = fastify();

	server.addHook('onRoute', (route: RouteOptions) => {
		console.log(route);
	});
	server.addHook('onReady', () => {
		console.log('onReady');
	});
	const router = new Router(server);

	router.get('/', (_, reply) => {
		reply.send('index');
	});
	router.post('/', (_, reply) => {
		reply.send(' post index');
	});

	function api() {
		router.namespace('customer', () => {
			router.get('', async () => '/api/customer');
			router.get('get', async () => '/api/customer/get');
			router.get('set', async () => '/api/customer/set');
		});
		// router.namespace('methods', () => {
		// 	router.prefix('posts.', () => {
		// 		router.get('get', (_, reply) => {
		// 			reply.send('api get posts');
		// 		});
		// 	});
		// 	router.prefix('photos.', () => {
		// 		router.get('get', (_, reply) => {
		// 			reply.send('api get photos');
		// 		});
		// 	});
		// });
	}

	router.namespace('api', () => {
		api();
	});
	console.log(router);

	try {
		const address = await server.listen({ port: 3000 });
		console.log(`Открыть адрес ${address}`);
	} catch (e) {}
}

bootstrap().then();
