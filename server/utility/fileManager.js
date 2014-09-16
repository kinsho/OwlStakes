define(['Q', 'app-root-path', 'path', 'fs'], function(Q, appPath, path, fs)
{
// ----------------- ENUM/CONSTANTS --------------------------

	var CLIENT_DIRECTORY = 'client/',
		SERVER_DIRECTORY = 'server/',

		LIBRARY_DIRECTORY = 'library/',
		FOUNDATION_DIRECTORY = 'foundation/',
		STYLESHEET_DIRECTORY = 'styles/css/',
		MODULES_DIRECTORY = 'modules/',
		VIEWS_DIRECTORY = 'views/',

		TEMPLATE_EXTENSION = '.handlebars',
		CSS_EXTENSION = '.css',
		JSON_EXTENSION = '.json';

// ----------------- NODE I/O FUNCTIONS --------------------------

	var fsReadDir = Q.denodeify(fs.readdir),
		fsStat = Q.denodeify(fs.stat),
		fsReadFile = Q.denodeify(fs.readFile);

// ----------------- PRIVATE FUNCTIONS --------------------------

		/**
		 * Generator function responsible for fetching system paths for all files within a specified directory,
		 * or if a file name is passed in, will fetch only the system path for that specific file
		 *
		 * @param {String} directoryName - the path of the directory, relative from the project root
		 * @param {String} [fileName] - the name of the file to fetch within the indicated directory
		 * @param {boolean} [recursiveRead] - flag indicating whether any descendant subdirectories within the target
		 * 		directory should also be searched for files
		 * @param {String} [extensionFilter] - if specified, the only file names that will be returned are the file
		 * 		names that end with this string
		 *
		 * @returns {Object} - an array of specialized object containing two significant properties, one pertaining to
		 * 		the file name and another housing the full system path of that file
		 *
		 * @throws - an exception generated when attempting to read and gather data about certain files
		 *
		 * @author kinsho
		 */
	var fileNameScraper = Q.async(function* (directoryName, recursiveRead, extensionFilter)
		{
			var fileNames,
				fileStats,
				files,
				subDirectoryFiles,
				i;

			try
			{
				files = [];

				// Fetch all the files from the directory
				fileNames = yield fsReadDir(directoryName);

				// Fetch stats related to all the files that were read
				fileStats = yield Q.all(fileNames.map(function(file)
				{
					return fsStat(directoryName + file);
				}));

				// Compose an array of full system paths for all fetched files, keeping in mind to use the
				// file stats to filter out all sub-directories that may have been returned when the directory
				// was read
				for (i = 0; i < fileStats.length; i++)
				{
					if (fileStats[i].isFile())
					{
						if ( (!(extensionFilter)) || (fileNames[i].endsWith(extensionFilter)) )
						{
							files.push(
							{
								'name': fileNames[i],
								'path': '/' + directoryName + fileNames[i]
							});
						}
					}
					else if ((recursiveRead) && (fileStats[i].isDirectory()))
					{
						// Recursively scrape out files within the subdirectory provided that the recursiveRead
						// flag was set
						subDirectoryFiles = yield fileNameScraper(directoryName + fileNames[i] + '/', null, true,
							extensionFilter);
						files = files.concat(subDirectoryFiles);
					}
				}

				return files;
			}
			catch(error)
			{
				console.error('ERROR ---> fileManager.fileNameScraper');
				console.error(error);
			}
		}),

		/**
		 * Generator function responsible for reading the contents of files given the system path to that file
		 *
		 * @param {Array[String] | String} filePaths - either an array containing multiple file objects housing
		 * 		system file paths and file names or a string representing just one system file path
		 *
		 * @returns {Array[String] | String} - if given a collection of multiple system file paths, the function will
		 * 		return an array of specialized objects  containing the contents of each of those files indicated by the
		 * 		paths. If given a string representing just one system file path, function will return a simple string
		 * 		representing the contents of that one targeted file
		 *
		 * @throws - an exception generated when attempting to stream content from files
		 *
		 * @author kinsho
		 */
		fileContentScraper = Q.async(function* (filePaths)
		{
			var fileContents,
				labelledFileContents,
				i;

			try
			{
				if (filePaths instanceof Array)
				{
					fileContents = yield Q.all(filePaths.map(function(file)
					{
						return fsReadFile(file.path);
					}));

					// With the file contents in hand, set up an associative array so that each content block is
					// identifiable to the service that ultimately invoked this fileManager
					labelledFileContents = [];
					for (i = 0; i < fileContents.length; i++)
					{
						labelledFileContents[i] =
						{
							name: filePaths[i].name,
							content: fileContents[i].toString()
						};
					}
				}
				else
				{
					fileContents = yield fsReadFile(filePaths);
					fileContents = fileContents.toString();
				}
			}
			catch(error)
			{
				console.error('ERROR ---> fileManager.fileContentScraper');
				console.error(error);
			}

			return fileContents;
		});

// ----------------- MODULE DEFINITION --------------------------
	var my =
	{
		/**
		 * Generator function that returns the contents of all foundational template that are needed when
		 * the page initially loads
		 *
		 * @returns {Array[Object]} - a collection of objects containing the contents of each foundational template
		 *		as well as the name of that template within the file system
		 *
		 * @author kinsho
		 */
		fetchFoundationalTemplates: Q.async(function* ()
		{
			var paths,
				templateContent;

			// Fetch all the file names from the foundational view sub-directory
			paths = yield fileNameScraper(CLIENT_DIRECTORY + VIEWS_DIRECTORY + FOUNDATION_DIRECTORY, true);
			templateContent = yield fileContentScraper(paths);

			return templateContent;
		}),

		/**
		 * Generator function that returns all library and foundational stylesheet file names
		 *
		 * @returns {Array[Object]} - a collection of objects containing the contents of each stylesheet
		 *		as well as the name of that stylesheet within the file system
		 *
		 * @author kinsho
		 */
		fetchAllFoundationalStylesheets: Q.async(function* ()
		{
			var libraryPaths,
				modulePaths;

			libraryPaths = yield fileNameScraper(CLIENT_DIRECTORY + STYLESHEET_DIRECTORY + LIBRARY_DIRECTORY,
				true, CSS_EXTENSION);
			modulePaths = yield fileNameScraper(CLIENT_DIRECTORY + STYLESHEET_DIRECTORY + MODULES_DIRECTORY,
				true, CSS_EXTENSION);

			return (libraryPaths.concat(modulePaths));
		}),

		/**
		 * Generator function that returns the content a specific template file
		 *
		 * @param {String} templateFolder - the name of the sub-directory within the views folder where
		 * 		the targeted template resides
		 * @param {String} templateName - the name of the template to fetch
		 *
		 * @returns {String} - the contents of the template specified by the parameters
		 *
		 * @author kinsho
		 */
		fetchTemplate: Q.async(function* (templateFolder, templateName)
		{
			return yield fileContentScraper(CLIENT_DIRECTORY + VIEWS_DIRECTORY + templateFolder +
				templateName + TEMPLATE_EXTENSION);
		}),

		/**
		 * Generator function that returns the contents of all templates within the specified directory
		 *
		 * @param {String} viewFolder - the name of the sub-directory under the client-side views folder from which
		 * 		files will be fetched
		 *
		 * @returns {Array[Object]} - a collection of objects containing the contents of each template in the specified
		 * 		directory as well as the name of that template within the file system
		 *
		 * @author kinsho
		 */
		fetchTemplates: Q.async(function* (templateFolder)
		{
			var paths,
				templateContent;

			// Fetch all the file names from the passed view sub-directory
			paths = yield fileNameScraper(CLIENT_DIRECTORY + VIEWS_DIRECTORY + templateFolder, false, TEMPLATE_EXTENSION);
			templateContent = yield fileContentScraper(paths);

			return templateContent;
		}),

		/**
		 * Generator function that returns the contents of the JSON file indicated by the parameters
		 *
		 * @param {String} directoryPath - the directory path under the ancestor server folder from which the JSON file
		 * 		will be fetched
		 * @param {String} fileName - the name of that JSON file
		 *
		 * @returns {String} - the contents of thw JSON file specified by the parameters
		 *
		 * @author kinsho
		 */
		fetchJSON: Q.async(function* (directoryPath, fileName)
		{
			return yield fileContentScraper(SERVER_DIRECTORY + directoryPath + fileName + JSON_EXTENSION);
		})
	};

// ----------------- END --------------------------
	return my;
});