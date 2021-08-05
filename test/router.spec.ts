import fastify from 'fastify';
import { Router } from '../src';
import { normalizeNamespaces } from '../src/helpers';
import { HttpMethod } from '../src/types';

const propertyRouter = {
	fastify: 'fastify',
	state: 'state',
	namespaces: 'namespaces',
	pushNamespaces: 'pushNamespaces',
	currentNamespace: 'currentNamespace',
	registerFromFastify: 'registerFromFastify'
};

jest.mock('../src/helpers');
jest.mock('fastify');

const fastifyMock = <jest.MockedFunction<typeof fastify>>fastify;
const mockNormalizeNamespaces = <jest.MockedFunction<typeof normalizeNamespaces>>normalizeNamespaces;
const mockFastifyRoute = jest.fn();

beforeEach(() => {
	fastifyMock.mockReset();
	mockNormalizeNamespaces.mockReset();
	mockFastifyRoute.mockReset();
	// @ts-ignore
	fastifyMock.mockImplementation(() => ({ route: mockFastifyRoute }));
});
test('Constructor', () => {
	fastifyMock
		.mockReturnValueOnce(
			// @ts-ignore
			1
		)
		.mockReturnValueOnce(
			// @ts-ignore
			2
		);
	const router1 = new Router(fastifyMock());
	const router2 = new Router(fastifyMock());

	expect(router1 instanceof Router).toBe(true);
	expect(router1[propertyRouter.fastify]).not.toEqual(router2[propertyRouter.fastify]);
});

describe('Class Methods', () => {
	let router: Router;

	beforeEach(() => {
		router = new Router(fastifyMock());
	});

	test('Namespace', () => {
		const handle = () => {};
		const groupMethod = jest.spyOn<Router, any>(router, 'group').mockReturnValue(undefined);

		expect(router.namespace('/test', handle)).toBeUndefined();
		expect(groupMethod).toHaveBeenCalledTimes(1);
		expect(groupMethod).toHaveBeenCalledWith({ namespace: '/test' }, handle);
	});

	test('Prefix', () => {
		const handle = jest.fn();

		expect(router.prefix('posts', handle)).toBeUndefined();
		expect(handle).toHaveBeenCalledTimes(1);
		expect(router[propertyRouter.state].prefixes).toEqual(['']);
	});

	describe('Group', () => {
		test('Handle', () => {
			const handle = jest.fn();
			const mockRegisterFromFastify = jest.spyOn<Router, any>(router, 'registerFromFastify').mockReturnValue(undefined);

			mockNormalizeNamespaces.mockReturnValueOnce('/api').mockReturnValueOnce('/api');
			expect(router.group({ namespace: 'api' }, handle)).toBeUndefined();
			expect(handle).toHaveBeenCalledTimes(1);
			expect(mockRegisterFromFastify).toHaveBeenCalledTimes(0);
			expect(mockNormalizeNamespaces).toHaveBeenCalledWith('api');
		});

		test('Scope', () => {
			const mockRegisterFromFastify = jest.spyOn<Router, any>(router, 'registerFromFastify').mockReturnValue(undefined);

			mockNormalizeNamespaces
				.mockReturnValueOnce('/api')
				.mockReturnValueOnce('/api')
				.mockReturnValueOnce('/api/post')
				.mockReturnValueOnce('/api/post');

			router.group({ namespace: 'api' }, () => {
				router[propertyRouter.namespaces][0].push({
					url: '/post'
				});
			});
			expect(mockRegisterFromFastify).toHaveBeenCalledTimes(1);
			expect(mockRegisterFromFastify).toHaveBeenNthCalledWith(1, {
				url: '/api/post'
			});

			expect(mockNormalizeNamespaces).toHaveBeenCalledTimes(3);
		});

		test('No path', () => {
			const handle = jest.fn();
			const mockRegisterFromFastify = jest.spyOn<Router, any>(router, 'registerFromFastify').mockReturnValue(undefined);
			mockNormalizeNamespaces.mockReturnValue('/');
			expect(router.group({ namespace: null }, handle)).toBeUndefined();
			expect(handle).toHaveBeenCalledTimes(1);
			expect(mockRegisterFromFastify).toHaveBeenCalledTimes(0);
			expect(mockNormalizeNamespaces).toHaveBeenCalledWith('/');
		});
	});

	describe('Http methods', () => {
		test('Single', () => {
			const mockRegister = jest.spyOn<Router, any>(router, 'register');

			for (const method of ['get', 'post', 'put', 'delete', 'head', 'patch', 'options']) {
				mockRegister.mockReturnValue(undefined);
				router[method]('/path', () => {});
				expect(mockRegister).toHaveBeenCalledTimes(1);
				expect(mockRegister.mock.calls[0][0]).toEqual([method.toLocaleUpperCase()]);

				mockRegister.mockReset();
			}
		});

		test('Match', () => {
			const mockRegister = jest.spyOn<Router, any>(router, 'register').mockReturnValue(undefined);

			router.match([HttpMethod.Post, HttpMethod.Get], '/path', () => {});
			expect(mockRegister).toHaveBeenCalledTimes(1);
			expect(mockRegister.mock.calls[0][0]).toEqual(['POST', 'GET']);
		});
		test('All', () => {
			const mockRegister = jest.spyOn<Router, any>(router, 'register').mockReturnValue(undefined);

			router.all('/path', () => {});
			expect(mockRegister).toHaveBeenCalledTimes(1);
			expect(mockRegister.mock.calls[0][0]).toEqual(['DELETE', 'GET', 'HEAD', 'PATCH', 'POST', 'PUT', 'OPTIONS']);
		});
	});

	describe('Private', () => {
		describe('Register', () => {
			test('No namespace', () => {
				const handler = jest.fn();

				mockNormalizeNamespaces.mockReturnValueOnce('/post');
				const mockRegisterFromFastify = jest
					.spyOn<Router, any>(router, 'registerFromFastify')
					.mockReturnValue(undefined);
				const mockPushNamespaces = jest.spyOn<Router, any>(router, 'pushNamespaces').mockReturnValue(undefined);

				router.get('post', handler);

				expect(mockRegisterFromFastify).toHaveBeenCalledTimes(1);
				expect(mockPushNamespaces).toHaveBeenCalledTimes(0);

				expect(mockRegisterFromFastify).toHaveBeenNthCalledWith(1, {
					method: ['GET'],
					url: '/post',
					handler
				});
			});
			test('Namespace', () => {
				const handler = jest.fn();

				router[propertyRouter.namespaces].push([]);

				mockNormalizeNamespaces.mockReturnValueOnce('/users');
				const mockRegisterFromFastify = jest
					.spyOn<Router, any>(router, 'registerFromFastify')
					.mockReturnValue(undefined);
				const mockPushNamespaces = jest.spyOn<Router, any>(router, 'pushNamespaces').mockReturnValue(undefined);

				router.get('post', handler);

				expect(mockPushNamespaces).toHaveBeenCalledTimes(1);
				expect(mockRegisterFromFastify).toHaveBeenCalledTimes(0);

				expect(mockPushNamespaces).toHaveBeenNthCalledWith(1, {
					method: ['GET'],
					url: '/users',
					handler
				});
			});
			test('Options', () => {
				const handler = jest.fn();
				const onRequest = jest.fn();

				router[propertyRouter.namespaces].push([]);

				mockNormalizeNamespaces.mockReturnValueOnce('/users');
				const mockRegisterFromFastify = jest
					.spyOn<Router, any>(router, 'registerFromFastify')
					.mockReturnValue(undefined);
				const mockPushNamespaces = jest.spyOn<Router, any>(router, 'pushNamespaces').mockReturnValue(undefined);

				router.get('users', { onRequest }, handler);

				expect(mockPushNamespaces).toHaveBeenCalledTimes(1);
				expect(mockRegisterFromFastify).toHaveBeenCalledTimes(0);

				expect(mockPushNamespaces).toHaveBeenNthCalledWith(1, {
					method: ['GET'],
					url: '/users',
					handler,
					onRequest
				});
			});
		});
		test('Push namespaces', () => {
			const namespace = {
				method: ['GET'],
				url: '/post'
			};

			router[propertyRouter.namespaces].push([]);
			router[propertyRouter.pushNamespaces](namespace);
			expect(router[propertyRouter.currentNamespace]).toEqual([namespace]);
		});
	});

	test('Register route fastify', () => {
		const routeOptions = {
			method: ['GET'],
			url: '/post'
		};

		router[propertyRouter.registerFromFastify](routeOptions);
		mockFastifyRoute.mockReturnValue(undefined);
		expect(mockFastifyRoute).toBeCalledTimes(1);
		expect(mockFastifyRoute).toHaveBeenNthCalledWith(1, routeOptions);
	});
});
