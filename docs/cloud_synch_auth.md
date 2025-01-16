# Cloud Synch Drive integration

Ade Mentally takes care of connection and disconnection of the Drive accounts of CPAs.  
Supported Drive providers are Google and OneDrive. The packages used for executing the authentication flow are:

-   `@azure/msal-node`
-   `googleapis`

Click on the icons to go straight to documentation.

<div style="display: flex; flex-direction: row; justify-content: space-evenly; gap: 16px">
    <a href="https://github.com/googleapis/google-api-nodejs-client/blob/main/README.md" taget="_blank">
        <div style="display: flex; align-items: center; gap: 8px">
            <img width="40px" src="https://api.iconify.design/logos:google-drive.svg" />
            Google Drive
        </div>
    </a>
    <a href="https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/README.md" taget="_blank">
        <div style="display: flex; align-items: center; gap: 8px;">
            <img width="40px" src="https://api.iconify.design/logos:microsoft-onedrive.svg" />
            OneDrive
        </div>
     </a>
</div>

### 📕 Resources

-   [Google OAuth2](https://developers.google.com/identity/protocols/oauth2)
-   [Microsoft Entra ID](https://learn.microsoft.com/en-us/entra/identity-platform/scenario-spa-sign-in?tabs=javascript2)
-   [Google Console Cloud Project](https://console.cloud.google.com/welcome?project=invoice-export-system-407913)
-   [Azure Portal Cloud Project](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/appId/7413516c-14dc-454c-a1b2-f639b264b89c/isMSAApp~/false)

### Login

Login procedure is analogous for the two Drive providers. The only difference are the endpoint called:

-   ![google](https://api.iconify.design/logos:google-drive.svg) `api/oauth/google`
-   ![google](https://api.iconify.design/logos:google-drive.svg) `api/user/cloud/connect_google`
-   ![onedrive](https://api.iconify.design/logos:microsoft-onedrive.svg) `api/oauth/onedrive`
-   ![onedrive](https://api.iconify.design/logos:microsoft-onedrive.svg) `api/user/cloud/connect_onedrive`

**Procedure**:

-   User clicks login
-   Frontend asks backend to generate the url for authentication window (`api/oauth/<provider>/url`)
-   User performs registration on the dedicated popup window
-   After authentication, the user is redirected by the popup window to the dedicated page (`cloud_synch_oauth`). This page can be accessed without login. The code of the authentication is fetched and passed to the main window (opener) with a cross window message, the popup is therefore instantly closed automatically
-   The message is intercepted, the code is retrieved, the tokens are requested to the backend (`api/oauth/<provider>/generate_tokens`)
-   Connection is completed by requesting the backend to update the database entries (`/api/user/cloud/connect_<provider>`)

### Logout

#### ![google](https://api.iconify.design/logos:google-drive.svg) Google Drive

-   User clicks logout
-   The single backend endpoint (`/api/user/cloud/disconnect`) is called. The endpoint fetches the active configuration, revokes the tokens and updates the database entries

#### ![onedrive](https://api.iconify.design/logos:microsoft-onedrive.svg) One Drive

Since OneDrive cannot automatically disconnect the account solely based on the access token, further steps are required:

-   User clicks logout
-   A popup is opened with a dedicated Microsoft page for disconnecting accounts (`https://login.microsoftonline.com/common/oauth2/v2.0/logout`)
-   If the user correctly disconnects, the popup sends a message to the main window
-   The main window intercepts this message and calls the default disconnect endpoint (`/api/user/cloud/disconnect`)
