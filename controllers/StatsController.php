<?php

	REQUIRE 'foundation/BaseController.php';

/**
  * The controller class for the stats page
  *
  * @author kinsho
  */

	class StatsController extends BaseController
	{
		const GENERIC_NAME = 'stats';

		public static function initPage()
		{
			parent::blockIfNotLoggedIn();

			self::getSeasonRankings();
			self::getPointDistributionData();
			self::getWeekByWeekData();

			parent::initPage();
		}

		private static function getSeasonRankings()
		{
			global $view;

// --------- TEST --------------------------------------------------------------
			$tester = new TestGenerator();
			$tester2 = new TestGenerator(-100, 400, null, null);
			$dataTypes = array
			(
				'rank' => 'n',
				'userName' => 's',
				'pointTotal' => 'n',
			);
			$dataTypes2 = array
			(
				'team' => 's',
				'points' => 'n'
			);

			$view->rankings = $tester->generateData(50, $dataTypes);
			foreach($view->rankings as $index => $ranking)
			{
				$view->rankings[$index]['pick'] = $tester2->generateData(mt_rand(1, 5), $dataTypes2);
			}
// ---------------------------------------------------------------------------
		}

		private static function getPointDistributionData()
		{

// --------- TEST --------------------------------------------------------------
			$tester = new TestGenerator();
			$dataTypes = array
			(
				'contestants' => 'n',
				'totalPoints' => 'n'
			);

			$data = $tester->generateData(100, $dataTypes);
// ---------------------------------------------------------------------------

			$comparableFunction = function($a, $b)
			{
				return ($a['totalPoints'] - $b['totalPoints']);
			};
			usort($data, $comparableFunction);

			self::bootstrapData($data, 'pointDistributionData');
		}

		private static function getWeekByWeekData()
		{
			global $view;

			$games = array();
			$topStandings = array();
			$tester = new TestGenerator(0, 100, 3, 16);
			$tester2 = new TestGenerator();
			$tester3 = new TestGenerator(-100, 400, null, null);
			$dataTypes = array
			(
				'upset' => 's',
				'favorite' => 's',
				'percentagePicked' => 'n'
			);
			$dataTypes2 = array
			(
				'rank' => 'n',
				'userName' => 's',
				'pointTotal' => 'n',
			);
			$dataTypes3 = array
			(
				'team' => 's',
				'points' => 'n'
			);

			for ($i = 1; $i <= 17; $i++)
			{
				$games = $tester->generateData(16, $dataTypes);
				foreach ($games as $index => $record)
				{
					$games[$index]['winner'] = ( mt_rand(0, 1) ? $record['upset'] : $record['favorite'] );
				}

				$topStandings = $tester2->generateData(10, $dataTypes2);
				foreach($topStandings as $index => $ranking)
				{
					$topStandings[$index]['pick'] = $tester3->generateData(mt_rand(1, 5), $dataTypes3);
				}

				$results[$i]['games'] = $games;
				$results[$i]['topStandings'] = $topStandings;
			}
			$view->weeklyStats = $results;
		}
	}
?>