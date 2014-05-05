<?php

/**
 * Dumb little class meant to whip up some test data quickly
 *
 * @author kinsho
 */
	class TestGenerator
	{
		private $alphabet = 'abcdefghijklmnopqrstuvwxyz';
		public $min = 1;
		public $max = 500;
		public $minStringLength = 3;
		public $maxStringLength = 10;

		/**
	     * Constructor for the TestGenerator class
		 * 
		 * @param $min - the range floor for the random number generator
		 * @param $max - the range ceiling for the random number generator
		 * @param $minStringLength - the minimum number of letters each randomly generated string must have
		 * @param $maxStringLength - the maximum number of letters each randomly generated string can have
		 *
		 * @author kinsho
		 */
		public function __construct($min = null, $max = null, $minStringLength = null, $maxStringLength = null)
		{
			if ($min !== null)
			{
				$this->min = $min;
			}

			if ($max !== null)
			{
				$this->max = $max;
			}

			if ($minStringLength !== null)
			{
				$this->minStringLength = $minStringLength;
			}

			if ($maxStringLength !== null)
			{
				$this->maxStringLength = $maxStringLength;
			}
		}

		/**
	     * Generates test data and packs that data into an array
		 * 
		 * @param $numberOfRecords - the number of records that need to be generated
		 * @param $dataTypes - the type of data which will comprise each record
		 *
		 * @return an array full of test data
		 *
		 * @author kinsho
		 */
		public function generateData($numberOfRecords = 0, $dataTypes = array())
		{
			$data = array();
			$record = array();
			$str = '';

			for ($j = 0; $j < $numberOfRecords; $j++)
			{
				foreach ($dataTypes as $label => $type)
				{
					if ($type === 'n')
					{
						$record[$label] = mt_rand($this->min, $this->max);
					}
					else if ($type === 's')
					{
						for ($i = mt_rand($this->minStringLength, $this->maxStringLength); $i > 0; $i--)
						{
							$str .= $this->alphabet[mt_rand(0, 25)];
						}
						$record[$label] = $str;
						$str = '';
					}
				}

				$data[] = $record;
				$record = array();
			}

			return $data;
		}
	}
?>