# fastify-route-group

Grouping and inheritance of routes

## Installation

```bash
npm i fastify-route-group
```

or

```
yarn add fastify-route-group
```

## Usage

```javascript
const fastify = require('fastify');
const { Router } = require('fastify-route-group');

async function bootstrap() {
  const server = fastify();
  const router = new Router(server);

  router.get('/', (_, reply) => {
    reply.send('index page');
  });

  router.namespace('api', () => {
    router.namespace('methods', () => {
      router.prefix('posts.', () => {
        router.get('get', (_, reply) => {
          reply.send('get posts from API');
        });
      });
      router.prefix('users.', () => {
        router.get('get', (_, reply) => {
          reply.send('get users from API');
        });
      });
    });
  });
}

bootstrap()
  .then();
```

The following routes are obtained

| Url                    | Description |
| ---------------------- | ----------- |
| /                      | index page  |
| /api/methods/posts.get | posts api   |
| /api/methods/users.get | users api   |
