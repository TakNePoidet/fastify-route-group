import { RouteOptions } from 'fastify';

export enum HttpMethod {
	'Delete' = 'DELETE',
	'Get' = 'GET',
	'Head' = 'HEAD',
	'Patch' = 'PATCH',
	'Post' = 'POST',
	'Put' = 'PUT',
	'Options' = 'OPTIONS'
}

export interface RouterGroupOptions {
	namespace: string;
}

export type Namespace = RouteOptions;

export type Namespaces = Namespace[];

export interface State {
	prefixes: string[];
	namespace: string;
}
