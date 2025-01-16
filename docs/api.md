# API

The web app comes with an embedded backend API service provided directly by Nuxt. This backend can be used to communicate with any external service and APIs.

The base url for the API is `/api/`. Nuxt automatically generate routes based on the folder structure of the [server/api](/server/api) folder ([documentation](https://nuxt.com/docs/getting-started/server)).

## Authorization

In AdeMentally, all the endpoints at the `/api/` url are protected with a Bearer Authorization mechanism. To authenticate to the endpoints, provide the token in requests:

```
Authorization: Bearer <token>
```

The token is single and do not expire. The API of AdeMentally is currently used only from the frontend to its own backend.

> 💡 It is recommended to change it regularly to ensure security. To change it, edit it in the [.env](/.env) file and in the [nuxt.config.ts](/nuxt.config.ts) both in runtime and app configuration.

To facilitate the use of the API, a specific plugin and composable have been developed, preventing every request to have to insert the authentication token.  
To use the composable:

```ts
const { api } = useApi();

// Use the api, notice there is no need to add authentication, it is automatically added by the plugin
await api("<your endpoint>", {
    method: "<METHOD>",
    onResponse({ request, response, options }) {
        // Handle success
    },
    onResponseError({ request, response, options }) {
        // Handle error
    },
});
```
