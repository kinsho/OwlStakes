<?php

TOS_REQUIRE_ONCE('vendor/autoload.php');

/*
 * Utility class meant to facilitate the generation of HTML through templates via Mustache
 *
 * @author kinsho
 */
class MustacheManager
{

// -------------------------- CONSTANTS ---------------------------

	const ODD_ROW_CLASS = 'odd';
	const POSITIVE_THEME_CLASS = 'positiveTheme';
	const NEGATIVE_THEME_CLASS = 'negativeTheme';

	const CLASS_MUSTACHE_TAG = 'mustache-class';

// -------------------------- CLASS MEMBERS ---------------------------

	protected static $mustache; // Mustache object that will be used to generate HTML using templates and passed data

// -------------------------- MUSTACHE UTILITY FUNCTIONS ----------------------------

	/**
	  * Function used to render the templates using the Mustache engine
	  *
	  * @param $template {String} - the template to use here in framing the HTML to generate
	  * @param $data {Array} - the data use to populate the template
	  * @param $viewLabel {String} - the key that will be used when storing the generated HTML into
	  * 	the global $view object
	  *
	  * @author kinsho
	  */
	public static function renderTemplate($template, $data, $viewLabel)
	{
		global $view;

		// If the Mustache engine has not been instantiated, start it up
		if ( unset(self::$mustache) )
		{
			self::$mustache = new Mustache_Engine;
		}

		$view[$viewLabel] = self::$mustache($template, $data);
	}

	/**
	  * Function designed to pre-process the data set to be fed into a template in a 
	  * manner so that alternate records within the data set are marked with a specific
	  * property to allow for alternating background colors when the Mustache result is
	  * rendered on the view
	  *
	  * @param $dataset {Array} - the dataset to preprocess to allow for alternate background colors
	  * 
	  * @return {Array} - the processed dataset
	  *
	  * @author kinsho
	  */
	public static function alternateRowColors($dataset)
	{
		foreach ($dataset as $index => $datum)
		{
			$dataset[$index][self::CLASS_MUSTACHE_TAG] = ($index % 2 === 1 ? self::ODD_ROW_CLASS : '');
		}

		return $dataset;
	}

	/**
	  * Function designed to pre-process the data set to be fed into a template in a 
	  * manner so that records in a data are marked as either positive or negative depending on
	  * whether the record passes a test function that's also passed in
	  *
	  * @param $dataset {Array} - the dataset to preprocess to allow for mood styling
	  * @param $testFunction {Function} - a test function to determine whether each record within
	  * 	the dataset qualifies as either positive or negative
	  *
	  * @return {Array} - the processed dataset
	  *
	  * @author kinsho
	  */
	public static function alternateDataByMood($dataset, $testFunction)
	{
		foreach ($dataset as $index => $datum)
		{
			$dataset[$index][self::CLASS_MUSTACHE_TAG] = ($testFunction($datum) ? self::POSITIVE_THEME_CLASS : self::NEGATIVE_THEME_CLASS);
		}

		return $dataset;	
	}
}
?>