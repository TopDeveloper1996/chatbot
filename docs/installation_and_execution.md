# Installation

### Dependencies

-   Install Node.js from the [official website](https://nodejs.org/en/download/package-manager)  
    _Use Node >= v20 (LTS)_

### Clone and prepare repo

Clone the repo:

```sh
git clone https://github.com/Mentally-digital-LLc/ade-mentally.git
```

Install dependencies, into the `ade-mentally` folder:

```sh
npm install --save
```

Add Azure remote repo:

```
git remote add azure https://adementally.scm.azurewebsites.net/adementally.git
```

### Environment

The project requires a local `.env` file placed in the root folder.

> [!NOTE]
> To get the .env file, the referrer is @tratteo at the moment.

# Execution

To run the application for development:

```sh
npm run dev
```

The application runs on the `localhost:3000` endpoint.  
The host is exposed on the local network, meaning it is possible to access it from other devices in the same network for testing purposes.
