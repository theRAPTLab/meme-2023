# Model and Evidence Mapping Environment (MEME) - Turbo 360 Deployment

_MEME_ supports deployment on the _Turbo-360_ platform to provide a scalable option for launching multiple servers.
This README describes the pre-requisites and steps involved in setting up a _Turbo-360_ account, project, and performing _MEME_ deployments.

# Pre-requisites

## Portal Registration
Prior to deployment on _Turbo-360_, you must create a free account on the platform.
Visit [this link](https://portal.turbo360.co/register) to register.

## Project Creation
Projects are created in the _Turbo-360_ web-based portal.
Visit [the portal](https://portal.turbo360.co) - your projects will be listed under the _Projects_ section.
If this is your first time on the portal, you will not see any options and will need to create your first project using one of the _Turbo-360 Templates_.
The _Turbo-360 Templates_ available to you are accessible by clicking on the _Templates_ option on the navigation sidebar.

Several _MEME_ templates are available; choose the one that most closely suits your use-case, click the option to _Launch Project_, and provide a name.

The _Turbo-360 Project_ will be created and you will be brought to the _Project_ screen. **Make note of the name you chose** as you will provide this during the deployment step.

**Accessing the Project**: You can access your newly created project by visiting the URL listed on the _Code_ page.
On the _Routes_ tab, a staging link will be listed on the right-side of your screen.

# Managing _Turbo-360 MEME Projects_
_Turbo-360 Projects_ are generally managed using the [web-based _Turbo-360_ portal](https://portal.turbo360.co).
The portal will allow you to see all of your current _Turbo-360 Projects_ (including those based on _MEME_).
The instructions below assume you have created a project and have navigated to it in the portal.

## Accessing
You can access your newly created project by visiting the URL listed on the _Code_ page.
On the _Routes_ tab, a staging link will be listed on the right-side of your screen.

## Deployments
New _Turbo-360 Projects_ are fully functional when created and have an initial deployment based on the contents of the _Turbo-360 Template_ from which they were created.
An updated (or even different) code-base can be deployed to a _Turbo-360 Project_ using additional scripts added to the _MEME_ package.

_**NOTE**_: Deployments are performed on a **per-Project** basis.
Applying a change to a _Turbo-360 Template_ does not automatically propagate that change to all of the projects that were created from it.


### Prepare Code
Prepare the _MEME_ code-base you wish to deploy by checking out the desired _MEME_ branch and following the instructions in [README.md](README.md) to install packages and confirm it works locally.

### Packaging
Package _MEME_ for _Turbo-360_ by running the following command:

`npm run package-turbo360 [MEME template]`

The `MEME template` argument is optional - if provided, the resources found in the `templates` folder will be included in the package.
If a template is not provided, it will default to `_blank`.

After packaging is complete, the `dist` folder will contain the packaged deployment.
It can be tested locally by navigating to it and running `node ./app.js`.

### Deployment
First, ensure you have logged into _Turbo-360_.
You can confirm this by typing `npx turbo profile` - if you are not logged in, you can do so by typing `npx turbo login`.

`npm run deploy-turbo360`

This tool will guide you through the process of deployment.
Notably, it will ask you to select a _Turbo-360_ Project to serve as the target of the deployment.
When deployment is complete, the _Turbo-360_ Project you have chosen will have its code-base replaced with the packaged copy.
Additionally, the _MEME resources_ from the package will be made available within _Turbo-360_.
