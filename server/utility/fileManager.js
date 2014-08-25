define(['app-root-path', 'path', 'fs', 'co', 'thunkify'], function(appPath, path, fs, co, thunkify)
{
	'use strict';

// ----------------- ENUM/CONSTANTS --------------------------

	var CLIENTS_DIRECTORY = 'client/',
		LIBRARY_DIRECTORY = 'library/',
		FOUNDATION_DIRECTORY = 'foundation/',
		STYLESHEET_DIRECTORY = 'styles/css/',
		MODULES_DIRECTORY = 'modules/',
		VIEWS_DIRECTORY = 'views/',

		TEMPLATE_EXTENSION = '.handlebars';

// ----------------- ASYNCHRONOUS THUNKS --------------------------

	var fsReadDir = thunkify(fs.readdir),
		fsStat = thunkify(fs.stat),
		fsReadFile = thunkify(fs.readFile);

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
	var fileNameScraper = co(function* (directoryName, fileName, recursiveRead)
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
							fileNameScraper(fileNames[i], null, true);
						}
					}

					return fileNames;
				}
				catch(error)
				{
					console.error(error);
				}
			}
		}),

		/**
		 * Generator function responsible for reading the contents of files given the system path to that file
		 *
		 * @param {Array[String] | String} filePaths - either an array containing multiple system file paths or a
		 * 		string representing just one system file path
		 *
		 * @returns {Array[String] | String} - if given a collection of multiple system file paths, the function will
		 * 		return a collection of strings containing the contents of each of those files indicated by the file
		 * 		paths. If given a string representing just one system file path, function will return a simple string
		 * 		representing the contents of that one targeted file
		 *
		 * @author kinsho
		 */
		fileContentScraper = co(function* (filePaths)
		{
			var fileContents;

			if (filePaths instanceof Array)
			{
				fileContents = yield filePaths.map(function(fileName)
				{
					return fsReadFile(fileName);
				});
			}
			else
			{
				fileContents = yield fsReadFile(filePaths);
			}

			return fileContents;
		});

// ----------------- MODULE DEFINITION --------------------------
	var my =
	{
		/**
		 * Generator function that returns all foundational view file names
		 *
		 * @returns {Array[String]} - a collection of file names
		 *
		 * @author kinsho
		 */
		fetchAllFoundationViews: co(function* ()
		{
			return yield fileNameScraper(CLIENTS_DIRECTORY + VIEWS_DIRECTORY + FOUNDATION_DIRECTORY, null, true);
		}),

		/**
		 * Generator function that returns all library and foundational stylesheet file names
		 *
		 * @returns {Array[String]} - a collection of file names
		 *
		 * @author kinsho
		 */
		fetchAllLibraryStylesheets: co(function* ()
		{
			return yield (fileNameScraper(CLIENTS_DIRECTORY + STYLESHEET_DIRECTORY + LIBRARY_DIRECTORY, null, true).
				concat(yield fileNameScraper(CLIENTS_DIRECTORY + STYLESHEET_DIRECTORY + MODULES_DIRECTORY, null, true)));
		}),

		/**
		 * Generator function that returns the content a specific template file
		 *
		 * @param {String} viewFolder - the name of the sub-directory within the views folder where
		 * 		the targeted template resides
		 * @param {String} templateName - the name of the template to fetch
		 *
		 * @returns {String} - the contents of the template specified by the parameters
		 *
		 * @author kinsho
		 */
		fetchTemplate: co(function* (viewFolder, templateName)
		{
			return yield fileContentScraper(CLIENTS_DIRECTORY + VIEWS_DIRECTORY + viewFolder +
				templateName + TEMPLATE_EXTENSION);
		}),

		/**
		 * Generator function that returns the content a specific template file
		 *
		 * @param {String} viewFolder - the name of the sub-directory within the views folder where
		 * 		the targeted template resides
		 * @param {String} templateName - the name of the template to fetch
		 *
		 * @returns {String} - the contents of the template specified by the parameters
		 *
		 * @author kinsho
		 */
		fetchTemplates: co(function* (viewFolder)
		{
			// Fetch all the file names from the passed view sub-directory
			var filePaths = yield (fileNameScraper(viewFolder));
			return yield fileContentScraper(filePaths);
		})
	};

// ----------------- END --------------------------
	return my;
});