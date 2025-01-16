# Authentication

> **/api/auth/**

### Login

In AdeMentally, users are authenticated using the data from the `auth_user` table of the Scraper database.  
When users request login, the row that corresponds to the email provided is fetched, the proposed password is hashed with the salt and iteration and the result is compared to the stored hash.  
The logic of authentication can be found in the [login endpoint](/server/api/auth/login.ts).

### Session

When a user logs in, a session is created on the AdeMentally backend. Each session is identifyied by a `session_token`.  
This token is returned by the login endpoint and is set as a cookie by the frontend, in this way the user session is kept open without requesting multiple authentication in a single session.  
Tokens expire after a predefined time, specified in [config.ts](/server/src/config/config.ts).

When the user opens the web app, the system checks whether there is a `session_token` set as a cookie, and if it is present, request validation to the [verify endpoint](/server/api/auth/verify.ts).  
If the session is not valid, the user is presented with the login page.
Tokens are stored and managed in the [token vault](/server/src/token_vault.ts).
