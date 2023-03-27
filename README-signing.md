# Code Signing and Notarization README

# Overview

Applications pick up a 'quarantine' flag when obtained through most normal means, e.g. downloading from the Internet, obtaining from Slack, etc.
This quarantine flag will cause MacOS versions starting with Catalina (10.15) to scan the application with its Gatekeeper security subsystem before the application can be launched.

Gatekeeper will check the application to ensure it is:

1. Signed with a valid developer or distribution identity
2. Signed additionally by Apple ("notarized") indicating that the application was submitted to Apple after packaging and signing for review and confirmation that it meets standard security requirements

The above steps are integrated into the MEME build process but the following section describes prerequisites that need to be met.

*Note*: The code signature and notarization include an index of the package files and presumably hashes. 
It is critical that any post-build file system artifacts are stored separately from the package itself.
As of this writing, runtime artifacts such as uploads, logging, and the MEME database are stored in the user's `Documents` folder.

# Build Pre-requisites

Ensure that `nvm` is installed and that you have executed `nvm use 10.9.0` (the version this process was tested with) or `nvm use` to use the project's current node version.

## Signing Pre-requisites 

To successfully sign a packaged MEME application bundle, you must obtain the following.

1. An Apple ID: This can be obtained by signing up for it on the Apple website. Further instructions can be [seen here](https://support.apple.com/en-us/HT204316)

2. Enrollment in the Apple Developer Program: This can be obtained by enrolling via their [website](https://developer.apple.com/programs/enroll/).
The process will vary depending on whether you are enrolling as an individual developer or an organization.
In either case, there is an annual fee associated with maintaining a developer account.

3. Creation of a Developer ID Application certificate: This can be obtained by signing in to your Apple Developer account, navigating to the "Certificates" area of the site and selecting the option to create a new certificate.
The certificate type should be "Developer ID Application".
In order to obtain the certificate, you will be required to use a MacOS-based system to generate a Certificate Signing Request (CSR).
This CSR will be uploaded to Apple when you are creating the certificate.

4. Local installation of the Developer ID application certificate: When the certificate creation process is complete, you will be able to download a `.cer` file.
This file once downloaded can be "run" on your MacOS system to install it, preferentially into the `login` keychain (as this will not require administrative rights).

5. Local installation of the latest intermediate Apple Certificate Authority certificate appropriate for the Developer ID certificate (as of this writing, the "Developer ID Certificate Authority G2" certificate).
These certificates are available for download [here](https://www.apple.com/certificateauthority/).
This can be installed into the same `login` keychain as your Developer ID certificate.

## Notarization Pre-requisites

To successfully notarize a packaged MEME application bundle, it must first be signed (see the section "Signing" above).
Once the bundle is signed, it can be submitted to Apple for notarization which requires the following:

1. An app-specific password: These can generated using your Apple ID using these [instructions](https://support.apple.com/en-us/HT204397).
In general, after signing in you should be able to find a section that allows you to generate "App-Specific Passwords."
Any name can be chosen for the password.

2. Your Apple Team ID: This can be found in your Developer Account.
While on the [Account Page](https://developer.apple.com/account), scroll down to "Membership Details".
The field

3. The above credentials need to be provided as shell environment variables when using the `npm run appsign` build procedure.

- `APPLE_ID`: Your Apple ID, see signing pre-requisites
- `APPLE_PASSWORD`: An app-specific password (see pre-requisite #1 above)
- `APPLE_TEAM_ID`: Your Apple Team ID (see pre-requisite #2 above)

For convenience, these can be provided in a `.env` file placed at the project root. For instance:

```
APPLE_ID=<Your ID>
APPLE_PASSWORD=<Your Apple app-specific password>
APPLE_TEAM_ID=<Your Apple Team ID>
```

# Technical Notes

## Signing

The application needs to be signed with a hardened runtime.

An entitlements file is provided for this apploication, see `src/config/darwin.entitlements.plist`.
It was originally based on a default list of entitlements (as captured from the '@electron/osx-sign' package - see [the source](https://github.com/electron/osx-sign/tree/main/entitlements)).

The following entitlements were added:

- `com.apple.security.cs.allow-jit`: *Likely* required to support the use of a hardened runtime ([source](https://github.com/electron/notarize#prerequisites))
- `com.apple.security.cs.allow-unsigned-executable-memory`: Required for Electron versions under 12 ([source](https://github.com/electron/notarize#prerequisites))
- `com.apple.security.cs.allow-dyld-environment-variables`: *Likely* required to allow for loading of additional dynamic libraries related to Electron
- `com.apple.security.network.server`: Allows for the application to listen on network ports.
- `com.apple.security.cs.disable-library-validation`: Relaxes code signing/validation restrictions on libraries that are loaded which may not be signed or signed by the packaging process. *Likely* required because there may be Electron-related platform libraries incorporated in the package.
- `com.apple.security.cs.disable-executable-page-protection`: *Likely* required; this is an extreme entitelement that allows applications to change their executable code at runtime.

This entitlement list is somewhat broad and additional testing may reveal that some entitlements are unnecessary.
Entitlement failures can have unusual presentation and result in application crashes with obscure exception codes.
It is recommended that any changes to the entitlement list be followed by a thorough test of the application's functionality.
