<?php

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
	  * @param $data {Array} - the data use to populate the template
	  * @param $templateURL {String} - the location of the template to use here in framing
	  *		the HTML to generate
	  * @param [$emptyTemplateURL] {String} - the location of the template to use here in case
	  *		the passed dataset is empty
	  *
	  * @return {String} - the HTML generated via Mustache using the provided data and template
	  *
	  * @author kinsho
	  */
	public static function renderTemplate($data, $templateURL, $emptyTemplateURL)
	{
		global $view;

		// If the Mustache engine has not been instantiated, start it up
		if ( !(isset(MustacheManager::$mustache)) )
		{
			self::$mustache = new Mustache_Engine;
		}

		// Fetch the templates using the provided template URLs
		$template = file_get_contents($_SERVER['DOCUMENT_ROOT'] . '/views/' . $templateURL);
		if ( !(empty($emptyTemplateURL)) )
		{
			$emptyTemplate = file_get_contents($_SERVER['DOCUMENT_ROOT'] . '/views/' . $emptyTemplateURL);
		}

		// Generate the HTML via Mustache and return it
		$html = '';
		foreach ($data as $record)
		{
			$html .= MustacheManager::$mustache->render($template, $record);
		}
		if (!empty($html))
		{
			$html = MustacheManager::$mustache->render($emptyTemplate, []);
		}

		return $html;
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
			if ( !(isset($dataset[$index][self::CLASS_MUSTACHE_TAG])) )
			{
				$dataset[$index][self::CLASS_MUSTACHE_TAG] = ' ' . ($index % 2 === 1 ? self::ODD_ROW_CLASS : '');
			}
			else
			{			
				$dataset[$index][self::CLASS_MUSTACHE_TAG] .= ' ' . ($index % 2 === 1 ? self::ODD_ROW_CLASS : '');
			}
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
			if ( !(isset($dataset[$index][self::CLASS_MUSTACHE_TAG])) )
			{
				$dataset[$index][self::CLASS_MUSTACHE_TAG] = ' ' . ($testFunction($datum) ? self::POSITIVE_THEME_CLASS : self::NEGATIVE_THEME_CLASS);
			}
			else
			{
				$dataset[$index][self::CLASS_MUSTACHE_TAG] .= ' ' . ($testFunction($datum) ? self::POSITIVE_THEME_CLASS : self::NEGATIVE_THEME_CLASS);
			}
		}

		return $dataset;	
	}
}
?>