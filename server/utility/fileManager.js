define(['app-root-path', 'path', 'fs', 'co', 'thunkify'], function(appPath, path, fs, co, thunkify)
{
	'use strict';

// ----------------- ENUM/CONSTANTS --------------------------

	var CLIENTS_DIRECTORY = 'client/',
		LIBRARY_DIRECTORY = 'library/',
		STYLESHEET_DIRECTORY = 'styles/css/',
		SCRIPTS_DIRECTORY = 'scripts/';

// ----------------- ASYNCHRONOUS THUNKS --------------------------

	var fsReadDir = thunkify(fs.readdir),
		fsStat = thunkify(fs.stat);

// ----------------- PRIVATE FUNCTIONS --------------------------

		/**
		 * Generator function responsible for fetching system paths for all files within a specified directory,
		 * or if a file name is passed in, will fetch only the system path for that specific file
		 *
		 * @param {String} directoryName - the path of the directory, relative from the project root
		 * @param {String} [fileName] - the name of the file to fetch within the indicated directory
		 * @param {boolean} [recursiveRead] - flag indicating whether any descendant subdirectories within the target
		 * 		directory should also be searched for files
		 *
		 * @returns {Array[String] | String} - either a collection of systems paths for all files within the
		 * 		passed directory or the system path that corresponds to a particular file within that directory
		 *
		 * @throws - an exception generated when attempting to read and gather data about certain files
		 *
		 * @author kinsho
		 */
	var fileScraper = co(function* (directoryName, fileName, recursiveRead)
		{
			var fileNames,
				fileStats,
				files,
				i;

			if (fileName)
			{
				// If a file name was provided, we only have to return the full system path for that file
				return (appPath + directoryName + fileName);
			}
			else
			{
				try
				{
					// Fetch all the files from the directory
					fileNames = yield fsReadDir(directoryName);

					// Fetch stats related to all the files that were read
					fileStats = yield fileNames.map(function(file)
					{
						return fsStat(directoryName + file);
					});

					// Compose an array of full system paths for all fetched files, keeping in mind to use the
					// file stats to filter out all sub-directories that may have been returned when the directory
					// was read
					for (i = 0; i < fileStats.length; i += 1)
					{
						if (fileStats[i].isFile())
						{
							files.push(appPath + directoryName + fileNames[i]);
						}
						else if ((recursiveRead) && (fileStats[i].isDirectory()))
						{
							// Recursively scrape out files within the subdirectory provided that the recursiveRead
							// flag was set
							fileScraper(fileNames[i], null, true);
						}
					}

					return fileNames;
				}
				catch(error)
				{
					console.error(error);
				}
			}
		});

// ----------------- MODULE DEFINITION --------------------------
	var my =
	{
		fetchAllLibraryScripts: function()
		{
			return fileScraper(CLIENTS_DIRECTORY + SCRIPTS_DIRECTORY + LIBRARY_DIRECTORY, null, true);
		},

		fetchAllLibraryStylesheets: function()
		{
			return fileScraper(CLIENTS_DIRECTORY + STYLESHEET_DIRECTORY + LIBRARY_DIRECTORY, null, true);
		}
	};


// ----------------- END --------------------------
	return my;
});