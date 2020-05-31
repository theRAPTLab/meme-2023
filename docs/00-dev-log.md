# MEME UPDATES 2020

## May 25 - Adding database export/import

Here's the outline of tasks, as marked in the source files from our previous work session:

1. console.js: drag-and-drop handler, send to console-main.js
2. console-main.js: message receiver to call URSYS to reinitialize server
3. server.js: variant of initialize to load read-only database
4. server:js: variant of URDB to export readonly database
5. console.js: export button to tell console-main.js to export file
6. server-database: in loaddataset, do migration of database versions

### 1. detecting drag-and-drop

The secret is to use [HTML5 drag and drop](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop), which will give you the file path. Then you can squirt it along to ipcMain. The general idea:

* in console.js, add a drop zone div and add `onDrop` handler that processes the event and extracts the file paths.
* Use `ipcRenderer` to send a message to `ipcMain` with the data payload.

### 4. exporting database

Jumping ahead, we need to be able to export the database so we can read it back in. I think we just might use the .loki database format, maybe compressing it also. There's a zip tool called [adm-zip](https://www.npmjs.com/package/adm-zip) that looks promising. We can give it an extension .memezip and include the version in the loki database. 

To review, here's our database initialization:

* InitializeDatabase() will create the filepath if it doesn't exist
* InitializeDatabase() will make a timestamped backup if filepath did exist
* InitializeDatabase() will then initiate LokiJS with the filepath
* f_LoadDataset() uses DATAMAP.Collections() to check each collection and initialize it if necessary through f_LoadCollection(). It also clears any session locks.
* f_LoadCollection() checks environment DATASET to override the default dataset. 
* f_LoadCollection() will reset the collection to the dataset in dev mode,
* f_LoadCollection() will not reset if not in dev mode.

To export the database, we want to:
* determine the current database file
* use fs_mkdtempSync to make a temporary folder
* write each collection out as json in temp folder
* copy the loki database to temp folder
* zip everything in the folder

To read the database:
* get the zip archive and unzip to temporary folder
* set READONLY MODE
* set the loki file in the temp folder and initialize from that

To set READONLY mode:
* There is already an **ADMData.IsViewOnly()** check we can use
* Just need to have this check URSESSION

## May 28 - Finishing Database Export / Import

The previous couple of days, did the App Versioning for Rutgers because it seemed relatively simple compared to the database work, which is a multi-step operation. 

We're trying to get our head around the database stuff. 

- [x] highlight drop zone
- [x] show drag icon (and make one)
- [x] try making dialogs
- [x] copy file to desktop
- [x] read file from desktop
- [x] click to import
- [x] click to export

## May 29 - Finishing Database Export / Import 

That UI/system stuff out of the way, can now just try to make the archive.

* [x] create temp directory
* [x] copy loki file into it
* [x] add starter manifest file
* [x] create the zip file
* [x] copy it to desktop
* [x] fix issues with async communication and setting drag flags

## May 30 - Importing the Database

We want to import the directory

* [x] write drag-over, import handlers
* [x] copy to temp directory
* [x] unzip
* [ ] set flags to load from temp directory in read only mode





