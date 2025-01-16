# Deployment

> 🖥️ The default development branch is `develop`  
> 🚀 The default deployment/release branch is `main`

The deployment schema requires that the `main` branch is used **exclusively** for deployments. Developments must be made on different branches, then merged togheter into the `develop` branch so that the automated deployment pipeline can be used.

### Azure deployment method: local GIT

Add Azure remote repo:

```
git remote add azure https://adementally.scm.azurewebsites.net/adementally.git
```

> ⚠️ In order to changes being effectively pushed to the Azure remote, **there must be local changes in the local branch**. This is because the deployment process synchronize the **local branch** with the **Azure remote**.  
> As convention, every time a new version must be deployed, the `version` field of the **package.json** must be updated using semantic versioning.

The chosen deployment method for Azure is the Local GIT.  
To use the Local Git method, it is required to authenticate to the remote branch. Git credentials can be found in the [Deployment Center](https://portal.azure.com/#@innodemia2.onmicrosoft.com/resource/subscriptions/a735aa69-1c67-402a-aebc-e1ebcf017780/resourceGroups/adementally/providers/Microsoft.Web/sites/adementally/vstscd) of the **adementally web app** in App Services in Microsoft Azure.

The first time the deployment is run, the operative system will ask for the credentials. From that point on, authentication will be automatic.

Official documentation can be found at [Local Git Deployment](https://learn.microsoft.com/en-us/azure/app-service/deploy-local-git).

> 💡 It is highly recommended to deploy the application from a Windows system, to mantain coherence.

### Automated deployment pipeline

To deploy the Web app to Azure Web App services, the **Local Git CI/CD** method is used.  
On Windows, it is possible to simply execute the [deploy.bat](/deploy.bat) file and step through the procedure.

> 💡 It is possible to pass a deployment message that will be displayed on the commit: `deploy.bat "Improvements etc."`

On Linux it is possible to execute each of the commands present in `deploy.bat` file singularly, adapted to the Unix system.

Upon executing the script, the following happens:

-   A checkout on the `develop` branch is executed
-   Changes are committed and pushed to the `develop` branch
-   Pushes are remotely pushed from the `develop` to the `azure:main` remote branch
-   The `main` branch is synced with the develop branch

**⚠️ Be sure to be on the `develop` branch with all the changes ported. If changes were made to another branch, that branch must be merged with the `develop` first!**

### Manual deploy

It is possible to make manual deployment from any branch.  
For example, there could be a situation in which the deployment branch is a lot ahead of the main branch but a production release with a small fix is needed. In this case, the production version will be on the `main` branch.  
To make a manual deployment:

-   Move on the main branch and make the required changes
-   Commit the changes on the `main` branch
    ```sh
    git add --all
    git commit -m "Commit message"
    git push origin -u develop
    ```
-   Push changes on the remote `azure` branch
    ```sh
    git push azure main:main
    ```

> 💡Generally, it is possible to push changes from any branch by using the command `git push azure <branch>:main`. Local changes must be present for the deployment to work.

### Troubleshooting

When performing the remote push on the Azure branch, it is possible to encounter several errors. Particularly, when the deployment process is interrupted, subsequent deployments may fail due to unterminated process.  
The most general and secure way of fixing every error is to completely delete the root folder in the AppService of Azure and perform a clean deploy.

> [!WARNING]
> Everytime a deployment fails, the `develop` and `main` are still going to be synchronized to prevent unmatched Git histories. This means that everytime a new deployment is attempted, changes must be made. In case no real changes have been made between two failed deployments, just bump the version number in the package.json.

To do this it is possible to access through SSH to the web app, by going into the dedicated section of [Azure App Service](https://portal.azure.com/#@innodemia2.onmicrosoft.com/resource/subscriptions/a735aa69-1c67-402a-aebc-e1ebcf017780/resourceGroups/adementally/providers/Microsoft.Web/sites/adementally/ssh) (of course authorization to Azure resource is needed).

Once accessed the SSH, excecute the following steps:

1. Go into the site folder:

    ```sh
    cd site/wwwroot
    ```

2. Completely purge the folder:
    ```sh
    rm -rf * && rm -rf -*
    ```

Once the folder is clean, it is possible to relaunch the automatic `deploy.bat` procedure and the deployment should succeed without errors.

> [!TIP]
> It may be needed to wait a few minutes after the clean to perform the deployment successfully. After the clean procedure it is recommended to [restart](https://portal.azure.com/#@innodemia2.onmicrosoft.com/resource/subscriptions/a735aa69-1c67-402a-aebc-e1ebcf017780/resourceGroups/adementally/providers/Microsoft.Web/sites/adementally/appServices) the web app.
