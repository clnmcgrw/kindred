# Kindred Outdoor & Surrounds

### Configuration

Install `@hubspot/cms-cli` globally and add a hubspot.config.yml file to root of the project
More info about @hubspot/cms-cli - https://www.npmjs.com/package/@hubspot/cms-cli

You will need a `hubspot.config.yml` in the project root with this schema:
```
defaultPortal: 'DEV'
portals:
  - name: 'DEV'
    portalId: 123456
    authType: 'apikey'
    apiKey: '123-hubspot-api-key-789'
```

### Project Directories

* `hs-cms-files` - files that will sync with file manager
* `magnetic-creative` - entire folder structure syncs with same folder in design manager
* `src` - css and javascript assets (served locally during dev)

### Commands

To start working, run `npm run blastoff` _and_ `npm run build`

* `npm run download` - pull everything from the design manager down to the project
* `npm run fileUpload` - send assets (css + js) to the file manager (only done when we need to "deploy")
* `npm run watch` - sync design manager files as you work (⚠️ Before running, nuke `magnetic-creative` dir)
* `gulp` - start sass, webpack, browsersync (will proxy hubspot site and serve at localhost, also serves local css/js and replaces cdn urls with local ones).
