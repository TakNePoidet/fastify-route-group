import { type RouteShorthandOptions, type RouteHandlerMethod, type FastifyInstance, type RouteOptions } from 'fastify';
import { HttpMethod, type RouterGroupOptions, type Namespaces, type Namespace, type State } from './types';
import { normalizeNamespaces } from './helpers';

export class Router {
	private readonly state: State = {
		prefixes: [''],
		namespace: '/'
	};

	private readonly namespaces: Namespaces[] = [];

	constructor(private readonly fastify: FastifyInstance) {}

	private get currentNamespace(): Namespaces {
		return this.namespaces[this.namespaces.length - 1];
	}

	private pushNamespaces(value: Namespace) {
		this.currentNamespace.push(value);
	}

	private registerFromFastify(route: RouteOptions) {
		this.fastify.route(route);
	}

	private register(method: HttpMethod[], args: [string, RouteHandlerMethod]): void;
	private register(method: HttpMethod[], args: [string, RouteShorthandOptions, RouteHandlerMethod]): void;
	private register(method: HttpMethod[], args: any[]): void {
		let options: RouteShorthandOptions;
		let handler: () => void;

		if (args.length === 3) {
			[, options, handler] = args;
		} else {
			[, handler] = args;
			options = {};
		}

		const prefix = this.state.prefixes[this.state.prefixes.length - 1];
		const url = normalizeNamespaces(args[0]).replace(/^\//, `/${prefix}`);

		if (this.namespaces.length >= 1) {
			this.pushNamespaces({ method, url, handler, ...options });
		} else {
			this.registerFromFastify({ method, url, handler, ...options });
		}
	}

	get(path: string, handle: RouteHandlerMethod): void;
	get(path: string, opts: RouteShorthandOptions, handle: RouteHandlerMethod): void;
	get(...args: any[]): void {
		this.register([HttpMethod.Get], args as any);
	}

	post(path: string, handle: RouteHandlerMethod): void;
	post(path: string, opts: RouteShorthandOptions, handle: RouteHandlerMethod): void;
	post(...args: any[]): void {
		this.register([HttpMethod.Post], args as any);
	}

	put(path: string, handle: RouteHandlerMethod): void;
	put(path: string, opts: RouteShorthandOptions, handle: RouteHandlerMethod): void;
	put(...args: any[]): void {
		this.register([HttpMethod.Put], args as any);
	}

	delete(path: string, handle: RouteHandlerMethod): void;
	delete(path: string, opts: RouteShorthandOptions, handle: RouteHandlerMethod): void;
	delete(...args: any[]): void {
		this.register([HttpMethod.Delete], args as any);
	}

	head(path: string, handle: RouteHandlerMethod): void;
	head(path: string, opts: RouteShorthandOptions, handle: RouteHandlerMethod): void;
	head(...args: any[]): void {
		this.register([HttpMethod.Head], args as any);
	}

	patch(path: string, handle: RouteHandlerMethod): void;
	patch(path: string, opts: RouteShorthandOptions, handle: RouteHandlerMethod): void;
	patch(...args: any[]): void {
		this.register([HttpMethod.Patch], args as any);
	}

	options(path: string, handle: RouteHandlerMethod): void;
	options(path: string, opts: RouteShorthandOptions, handle: RouteHandlerMethod): void;
	options(...args: any[]): void {
		this.register([HttpMethod.Options], args as any);
	}

	match(methods: HttpMethod[], path: string, handle: RouteHandlerMethod): void;
	match(methods: HttpMethod[], path: string, opts: RouteShorthandOptions, handle: RouteHandlerMethod): void;
	match(methods: HttpMethod[], ...args: any[]): void {
		this.register(methods, args as any);
	}

	all(path: string, handle: RouteHandlerMethod): void;
	all(path: string, opts: RouteShorthandOptions, handle: RouteHandlerMethod): void;
	all(...args: any[]): void {
		this.register(Object.values(HttpMethod), args as any);
	}

	group(opts: Partial<RouterGroupOptions>, handle: () => void): void {
		const namespace = normalizeNamespaces(opts.namespace ?? '/');

		this.state.namespace = normalizeNamespaces(this.state.namespace + namespace);
		this.namespaces.push([]);
		handle();

		for (const scope of this.namespaces.pop()) {
			this.registerFromFastify({ ...scope, url: normalizeNamespaces(this.state.namespace + scope.url) });
		}
		this.state.namespace = this.state.namespace.slice(0, namespace.length * -1);
	}

	prefix(prefix: string, handle: () => void): void {
		const { prefixes } = this.state;

		prefixes.push(prefix);
		handle();
		this.state.prefixes = prefixes.slice(0, -1);
	}

	namespace(namespace: string, handle: () => void): void {
		this.group({ namespace }, handle);
	}
}
