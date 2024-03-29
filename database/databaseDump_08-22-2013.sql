-- MySQL dump 10.13  Distrib 5.5.13, for Win64 (x86)
--
-- Host: localhost    Database: owlStakes
-- ------------------------------------------------------
-- Server version	5.5.13

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `games`
--

DROP TABLE IF EXISTS `games`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `games` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `homeTeam` int(10) unsigned NOT NULL,
  `awayTeam` int(10) unsigned NOT NULL,
  `underdog` int(10) unsigned DEFAULT NULL,
  `spread` decimal(3,1) DEFAULT NULL,
  `didUnderdogWin` bit(1) NOT NULL DEFAULT b'0',
  `week` tinyint(3) unsigned NOT NULL DEFAULT '1',
  `kickoffTime` datetime NOT NULL,
  `createdOn` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `updatedOn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=121 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `games`
--

LOCK TABLES `games` WRITE;
/*!40000 ALTER TABLE `games` DISABLE KEYS */;
INSERT INTO `games` VALUES (1,29,21,NULL,NULL,'\0',1,'2013-09-05 20:30:00','2013-08-14 23:18:33','2013-08-14 23:19:59'),(2,20,18,NULL,NULL,'\0',1,'2013-09-08 13:00:00','2013-08-14 23:36:19','2013-08-14 23:36:19'),(3,22,27,NULL,NULL,'\0',1,'2013-09-08 13:00:00','2013-08-14 23:36:45','2013-08-14 23:36:45'),(4,9,10,NULL,NULL,'\0',1,'2013-09-08 13:00:00','2013-08-14 23:37:02','2013-08-14 23:37:02'),(5,17,11,NULL,NULL,'\0',1,'2013-09-08 13:00:00','2013-08-14 23:37:21','2013-08-14 23:37:21'),(6,28,31,NULL,NULL,'\0',1,'2013-09-08 13:00:00','2013-08-14 23:38:04','2013-08-14 23:38:04'),(7,12,14,NULL,NULL,'\0',1,'2013-09-08 13:00:00','2013-08-14 23:39:20','2013-08-14 23:39:20'),(8,6,24,NULL,NULL,'\0',1,'2013-09-08 13:00:00','2013-08-14 23:39:38','2013-08-14 23:39:38'),(9,23,19,NULL,NULL,'\0',1,'2013-09-08 13:00:00','2013-08-14 23:40:03','2013-08-14 23:40:03'),(10,7,8,NULL,NULL,'\0',1,'2013-09-08 13:00:00','2013-08-14 23:40:22','2013-08-14 23:40:22'),(11,25,30,NULL,NULL,'\0',1,'2013-09-08 13:00:00','2013-08-14 23:40:40','2013-08-14 23:40:40'),(12,13,5,NULL,NULL,'\0',1,'2013-09-08 16:25:00','2013-08-14 23:41:18','2013-08-14 23:41:18'),(13,16,15,NULL,NULL,'\0',1,'2013-09-08 16:25:00','2013-08-14 23:43:46','2013-08-14 23:43:46'),(14,3,1,NULL,NULL,'\0',1,'2013-09-08 20:30:00','2013-08-14 23:44:33','2013-08-14 23:44:33'),(15,4,2,NULL,NULL,'\0',1,'2013-09-09 19:10:00','2013-08-14 23:45:08','2013-08-14 23:45:08'),(16,32,26,NULL,NULL,'\0',1,'2013-09-09 22:20:00','2013-08-14 23:45:40','2013-08-14 23:45:40'),(17,18,17,NULL,NULL,'\0',2,'2013-09-12 20:25:00','2013-08-16 03:19:38','2013-08-16 03:25:02'),(18,10,16,NULL,NULL,'\0',2,'2013-09-15 13:00:00','2013-08-16 03:22:25','2013-08-16 03:22:25'),(19,2,32,NULL,NULL,'\0',2,'2013-09-15 13:00:00','2013-08-16 03:25:33','2013-08-16 03:25:33'),(20,31,3,NULL,NULL,'\0',2,'2013-09-15 13:00:00','2013-08-16 03:25:45','2013-08-16 03:25:45'),(21,25,19,NULL,NULL,'\0',2,'2013-09-15 13:00:00','2013-08-16 03:29:35','2013-08-16 03:29:35'),(22,26,27,NULL,NULL,'\0',2,'2013-09-15 13:00:00','2013-08-16 03:30:37','2013-08-16 03:30:37'),(23,5,4,NULL,NULL,'\0',2,'2013-09-15 13:00:00','2013-08-16 03:31:00','2013-08-16 03:31:00'),(24,21,23,NULL,NULL,'\0',2,'2013-09-15 13:00:00','2013-08-16 03:31:27','2013-08-16 03:31:27'),(25,20,12,NULL,NULL,'\0',2,'2013-09-15 13:00:00','2013-08-16 03:31:36','2013-08-16 03:31:36'),(26,6,8,NULL,NULL,'\0',2,'2013-09-15 13:00:00','2013-08-16 03:31:55','2013-08-16 03:31:55'),(27,11,9,NULL,NULL,'\0',2,'2013-09-15 16:05:00','2013-08-16 03:32:45','2013-08-16 03:32:45'),(28,15,7,NULL,NULL,'\0',2,'2013-09-15 16:05:00','2013-08-16 03:32:55','2013-08-16 03:32:55'),(29,30,28,NULL,NULL,'\0',2,'2013-09-15 16:25:00','2013-08-16 03:33:16','2013-08-16 03:33:16'),(30,1,29,NULL,NULL,'\0',2,'2013-09-15 16:25:00','2013-08-16 03:33:34','2013-08-16 03:33:34'),(31,14,13,NULL,NULL,'\0',2,'2013-09-15 20:30:00','2013-08-16 03:33:47','2013-08-16 03:38:05'),(32,24,22,NULL,NULL,'\0',2,'2013-09-16 20:40:00','2013-08-16 03:34:33','2013-08-16 03:34:33'),(33,2,31,NULL,NULL,'\0',3,'2013-09-19 20:25:00','2013-08-16 03:43:49','2013-08-16 03:43:49'),(34,21,26,NULL,NULL,'\0',3,'2013-09-22 13:00:00','2013-08-16 03:44:22','2013-08-16 03:44:22'),(35,12,1,NULL,NULL,'\0',3,'2013-09-22 13:00:00','2013-08-16 03:45:45','2013-08-16 03:45:45'),(36,4,7,NULL,NULL,'\0',3,'2013-09-22 13:00:00','2013-08-16 03:45:55','2013-08-16 03:45:55'),(37,27,32,NULL,NULL,'\0',3,'2013-09-22 13:00:00','2013-08-16 03:46:06','2013-08-16 03:46:06'),(38,9,15,NULL,NULL,'\0',3,'2013-09-22 13:00:00','2013-08-16 03:46:32','2013-08-16 03:46:32'),(39,18,11,NULL,NULL,'\0',3,'2013-09-22 13:00:00','2013-08-16 03:46:45','2013-08-16 03:46:45'),(40,24,5,NULL,NULL,'\0',3,'2013-09-22 13:00:00','2013-08-16 03:46:58','2013-08-16 03:46:58'),(41,3,16,NULL,NULL,'\0',3,'2013-09-22 13:00:00','2013-08-16 03:47:21','2013-08-16 03:47:21'),(42,8,23,NULL,NULL,'\0',3,'2013-09-22 13:00:00','2013-08-16 03:47:35','2013-08-16 03:47:35'),(43,19,10,NULL,NULL,'\0',3,'2013-09-22 16:05:00','2013-08-16 03:47:58','2013-08-16 03:47:58'),(44,17,20,NULL,NULL,'\0',3,'2013-09-22 16:25:00','2013-08-16 03:48:26','2013-08-16 03:48:26'),(45,13,25,NULL,NULL,'\0',3,'2013-09-22 16:25:00','2013-08-16 03:48:38','2013-08-16 03:48:38'),(46,14,28,NULL,NULL,'\0',3,'2013-09-22 16:25:00','2013-08-16 03:49:11','2013-08-16 03:49:11'),(47,22,6,NULL,NULL,'\0',3,'2013-09-22 20:30:00','2013-08-16 03:49:53','2013-08-16 03:49:53'),(48,29,30,NULL,NULL,'\0',3,'2013-09-23 20:40:00','2013-08-16 03:50:17','2013-08-16 03:50:17'),(49,16,13,NULL,NULL,'\0',4,'2013-09-26 20:25:00','2013-08-16 08:19:01','2013-08-16 08:48:53'),(50,20,21,NULL,NULL,'\0',4,'2013-09-29 13:00:00','2013-08-16 08:19:22','2013-08-16 08:48:53'),(51,11,15,NULL,NULL,'\0',4,'2013-09-29 13:00:00','2013-08-16 08:20:33','2013-08-16 08:48:53'),(52,8,22,NULL,NULL,'\0',4,'2013-09-29 13:00:00','2013-08-16 08:20:44','2013-08-16 08:48:53'),(53,31,1,NULL,NULL,'\0',4,'2013-09-29 13:00:00','2013-08-16 08:20:56','2013-08-16 08:48:53'),(54,28,25,NULL,NULL,'\0',4,'2013-09-29 13:00:00','2013-08-16 08:21:06','2013-08-16 08:48:53'),(55,26,14,NULL,NULL,'\0',4,'2013-09-29 13:00:00','2013-08-16 08:21:23','2013-08-16 08:48:53'),(56,23,24,NULL,NULL,'\0',4,'2013-09-29 13:00:00','2013-08-16 08:21:41','2013-08-16 08:48:53'),(57,7,6,NULL,NULL,'\0',4,'2013-09-29 13:00:00','2013-08-16 08:21:58','2013-08-16 08:48:53'),(58,27,17,NULL,NULL,'\0',4,'2013-09-29 16:05:00','2013-08-16 08:22:18','2013-08-16 08:48:53'),(59,30,4,NULL,NULL,'\0',4,'2013-09-29 16:25:00','2013-08-16 08:22:33','2013-08-16 08:48:53'),(60,29,2,NULL,NULL,'\0',4,'2013-09-29 16:25:00','2013-08-16 08:22:45','2013-08-16 08:48:53'),(61,32,3,NULL,NULL,'\0',4,'2013-09-29 16:25:00','2013-08-16 08:23:10','2013-08-16 08:48:53'),(62,10,18,NULL,NULL,'\0',4,'2013-09-29 18:30:00','2013-08-16 08:23:33','2013-08-16 08:48:53'),(63,9,19,NULL,NULL,'\0',4,'2013-09-30 20:40:00','2013-08-16 08:24:02','2013-08-16 08:48:53'),(64,23,20,NULL,NULL,'\0',5,'2013-10-03 20:25:00','2013-08-16 08:24:56','2013-08-16 08:49:35'),(65,24,18,NULL,NULL,'\0',5,'2013-10-06 13:00:00','2013-08-16 08:26:37','2013-08-16 08:49:35'),(66,5,7,NULL,NULL,'\0',5,'2013-10-06 13:00:00','2013-08-16 08:26:49','2013-08-16 08:49:35'),(67,25,14,NULL,NULL,'\0',5,'2013-10-06 13:00:00','2013-08-16 08:27:02','2013-08-16 08:49:35'),(68,19,21,NULL,NULL,'\0',5,'2013-10-06 13:00:00','2013-08-16 08:27:12','2013-08-16 08:49:35'),(69,6,9,NULL,NULL,'\0',5,'2013-10-06 13:00:00','2013-08-16 08:27:26','2013-08-16 08:49:35'),(70,1,2,NULL,NULL,'\0',5,'2013-10-06 13:00:00','2013-08-16 08:27:36','2013-08-16 08:49:35'),(71,27,31,NULL,NULL,'\0',5,'2013-10-06 13:00:00','2013-08-16 08:27:46','2013-08-16 08:49:35'),(72,16,28,NULL,NULL,'\0',5,'2013-10-06 13:00:00','2013-08-16 08:28:02','2013-08-16 08:49:35'),(73,15,12,NULL,NULL,'\0',5,'2013-10-06 16:05:00','2013-08-16 08:28:28','2013-08-16 08:49:35'),(74,3,29,NULL,NULL,'\0',5,'2013-10-06 16:25:00','2013-08-16 08:28:48','2013-08-16 08:49:35'),(75,30,32,NULL,NULL,'\0',5,'2013-10-06 16:25:00','2013-08-16 08:29:00','2013-08-16 08:49:35'),(76,13,26,NULL,NULL,'\0',5,'2013-10-06 20:30:00','2013-08-16 08:29:29','2013-08-16 08:49:35'),(77,10,17,NULL,NULL,'\0',5,'2013-10-07 20:40:00','2013-08-16 08:29:49','2013-08-16 08:49:35'),(78,6,1,NULL,NULL,'\0',6,'2013-10-10 20:25:00','2013-08-16 08:30:42','2013-08-16 08:32:43'),(79,21,5,NULL,NULL,'\0',6,'2013-10-13 13:00:00','2013-08-16 08:33:28','2013-08-16 08:33:28'),(80,20,24,NULL,NULL,'\0',6,'2013-10-13 13:00:00','2013-08-16 08:33:41','2013-08-16 08:33:41'),(81,23,7,NULL,NULL,'\0',6,'2013-10-13 13:00:00','2013-08-16 08:33:51','2013-08-16 08:33:51'),(82,26,16,NULL,NULL,'\0',6,'2013-10-13 13:00:00','2013-08-16 08:33:59','2013-08-16 08:33:59'),(83,8,12,NULL,NULL,'\0',6,'2013-10-13 13:00:00','2013-08-16 08:34:09','2013-08-16 08:34:09'),(84,31,30,NULL,NULL,'\0',6,'2013-10-13 13:00:00','2013-08-16 08:34:18','2013-08-16 08:34:18'),(85,17,22,NULL,NULL,'\0',6,'2013-10-13 13:00:00','2013-08-16 08:34:30','2013-08-16 08:34:30'),(86,11,2,NULL,NULL,'\0',6,'2013-10-13 13:00:00','2013-08-16 08:34:47','2013-08-16 08:34:47'),(87,29,28,NULL,NULL,'\0',6,'2013-10-13 16:05:00','2013-08-16 08:35:10','2013-08-16 08:35:10'),(88,14,27,NULL,NULL,'\0',6,'2013-10-13 16:05:00','2013-08-16 08:35:23','2013-08-16 08:35:23'),(89,18,9,NULL,NULL,'\0',6,'2013-10-13 16:25:00','2013-08-16 08:35:41','2013-08-16 08:35:41'),(90,13,15,NULL,NULL,'\0',6,'2013-10-13 16:25:00','2013-08-16 08:35:51','2013-08-16 08:35:51'),(91,3,4,NULL,NULL,'\0',6,'2013-10-13 20:30:00','2013-08-16 08:36:13','2013-08-16 08:36:13'),(92,32,25,NULL,NULL,'\0',6,'2013-10-14 20:40:00','2013-08-16 08:36:45','2013-08-16 08:36:45'),(93,15,14,NULL,NULL,'\0',7,'2013-10-17 20:25:00','2013-08-16 08:51:20','2013-08-16 08:51:20'),(94,10,11,NULL,NULL,'\0',7,'2013-10-20 13:00:00','2013-08-16 08:51:44','2013-08-16 08:51:44'),(95,4,6,NULL,NULL,'\0',7,'2013-10-20 13:00:00','2013-08-16 08:51:54','2013-08-16 08:51:54'),(96,2,3,NULL,NULL,'\0',7,'2013-10-20 13:00:00','2013-08-16 08:52:05','2013-08-16 08:52:05'),(97,17,18,NULL,NULL,'\0',7,'2013-10-20 13:00:00','2013-08-16 08:52:15','2013-08-16 08:52:15'),(98,19,20,NULL,NULL,'\0',7,'2013-10-20 13:00:00','2013-08-16 08:52:26','2013-08-16 08:52:26'),(99,12,16,NULL,NULL,'\0',7,'2013-10-20 13:00:00','2013-08-16 08:52:37','2013-08-16 08:52:37'),(100,7,24,NULL,NULL,'\0',7,'2013-10-20 13:00:00','2013-08-16 08:52:54','2013-08-16 08:52:54'),(101,28,32,NULL,NULL,'\0',7,'2013-10-20 13:00:00','2013-08-16 08:53:16','2013-08-16 08:53:16'),(102,31,26,NULL,NULL,'\0',7,'2013-10-20 13:00:00','2013-08-16 08:53:25','2013-08-16 08:53:25'),(103,27,13,NULL,NULL,'\0',7,'2013-10-20 16:05:00','2013-08-16 08:53:35','2013-08-16 08:54:45'),(104,5,23,NULL,NULL,'\0',7,'2013-10-20 16:25:00','2013-08-16 08:55:01','2013-08-16 08:55:01'),(105,22,21,NULL,NULL,'\0',7,'2013-10-20 16:25:00','2013-08-16 08:55:20','2013-08-16 08:55:20'),(106,25,29,NULL,NULL,'\0',7,'2013-10-20 20:30:00','2013-08-16 08:55:50','2013-08-16 08:55:50'),(107,1,8,NULL,NULL,'\0',7,'2013-10-21 20:40:00','2013-08-16 08:56:14','2013-08-16 08:56:14'),(108,11,12,NULL,NULL,'\0',8,'2013-10-24 20:25:00','2013-08-16 08:57:33','2013-08-16 08:57:33'),(109,28,13,NULL,NULL,'\0',8,'2013-10-27 13:00:00','2013-08-16 08:58:11','2013-08-16 08:58:11'),(110,31,23,NULL,NULL,'\0',8,'2013-10-27 13:00:00','2013-08-16 08:58:20','2013-08-16 08:58:20'),(111,18,19,NULL,NULL,'\0',8,'2013-10-27 13:00:00','2013-08-16 08:58:30','2013-08-16 08:58:30'),(112,9,20,NULL,NULL,'\0',8,'2013-10-27 13:00:00','2013-08-16 08:58:42','2013-08-16 08:58:42'),(113,7,3,NULL,NULL,'\0',8,'2013-10-27 13:00:00','2013-08-16 08:58:52','2013-08-16 08:58:52'),(114,2,1,NULL,NULL,'\0',8,'2013-10-27 13:00:00','2013-08-16 08:59:07','2013-08-16 08:59:07'),(115,30,22,NULL,NULL,'\0',8,'2013-10-27 16:05:00','2013-08-16 08:59:30','2013-08-16 08:59:30'),(116,24,17,NULL,NULL,'\0',8,'2013-10-27 16:05:00','2013-08-16 08:59:53','2013-08-16 08:59:53'),(117,15,10,NULL,NULL,'\0',8,'2013-10-27 16:25:00','2013-08-16 09:00:10','2013-08-16 09:00:10'),(118,29,4,NULL,NULL,'\0',8,'2013-10-27 16:25:00','2013-08-16 09:00:24','2013-08-16 09:00:24'),(119,8,5,NULL,NULL,'\0',8,'2013-10-27 20:30:00','2013-08-16 09:00:50','2013-08-16 09:00:50'),(120,16,14,NULL,NULL,'\0',8,'2013-10-28 20:40:00','2013-08-16 09:01:33','2013-08-16 09:01:33');
/*!40000 ALTER TABLE `games` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teams`
--

DROP TABLE IF EXISTS `teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `teams` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `market` varchar(50) NOT NULL,
  `name` varchar(50) NOT NULL,
  `updatedOn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teams`
--

LOCK TABLES `teams` WRITE;
/*!40000 ALTER TABLE `teams` DISABLE KEYS */;
INSERT INTO `teams` VALUES (1,'New York','Giants','2013-08-14 23:50:37'),(2,'Philadelphia','Eagles','2013-08-14 23:51:41'),(3,'Dallas','Cowboys','2013-08-14 23:51:50'),(4,'Washington','Redskins','2013-08-14 23:52:02'),(5,'Green Bay','Packers','2013-08-14 23:52:15'),(6,'Chicago','Bears','2013-08-14 23:52:28'),(7,'Detroit','Lions','2013-08-14 23:53:19'),(8,'Minnesota','Vikings','2013-08-14 23:53:40'),(9,'New Orleans','Saints','2013-08-14 23:53:51'),(10,'Atlanta','Falcons','2013-08-14 23:54:03'),(11,'Tampa Bay','Buccaneers','2013-08-14 23:55:01'),(12,'Carolina','Panthers','2013-08-14 23:55:12'),(13,'San Francisco','49ers','2013-08-14 23:55:22'),(14,'Seattle','Seahawks','2013-08-14 23:55:33'),(15,'Arizona','Cardinals','2013-08-14 23:55:48'),(16,'St. Louis','Rams','2013-08-14 23:55:59'),(17,'New York','Jets','2013-08-14 23:56:19'),(18,'New England','Patriots','2013-08-14 23:56:28'),(19,'Miami','Dolphins','2013-08-14 23:56:39'),(20,'Buffalo','Bills','2013-08-14 23:56:49'),(21,'Baltimore','Ravens','2013-08-14 23:56:58'),(22,'Pittsburgh','Steelers','2013-08-14 23:57:07'),(23,'Cleveland','Browns','2013-08-14 23:57:56'),(24,'Cincinnati','Bengals','2013-08-14 23:58:06'),(25,'Indianapolis','Colts','2013-08-14 23:58:16'),(26,'Houston','Texans','2013-08-14 23:58:24'),(27,'Tennessee','Titans','2013-08-14 23:58:42'),(28,'Jacksonville','Jaguars','2013-08-14 23:58:51'),(29,'Denver','Broncos','2013-08-14 23:59:00'),(30,'Oakland','Raiders','2013-08-14 23:59:08'),(31,'Kansas City','Chiefs','2013-08-14 23:59:17'),(32,'San Diego','Chargers','2013-08-14 23:59:28');
/*!40000 ALTER TABLE `teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `test_table`
--

DROP TABLE IF EXISTS `test_table`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `test_table` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `stamp_created` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `stamp_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `test_table`
--

LOCK TABLES `test_table` WRITE;
/*!40000 ALTER TABLE `test_table` DISABLE KEYS */;
INSERT INTO `test_table` VALUES (4,'2013-08-03 18:33:20','2013-08-03 18:33:53');
/*!40000 ALTER TABLE `test_table` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `firstName` varchar(50) NOT NULL DEFAULT '',
  `lastName` varchar(75) NOT NULL DEFAULT '',
  `address` varchar(255) NOT NULL,
  `city` varchar(100) NOT NULL,
  `state` char(2) NOT NULL,
  `birthMonth` int(10) unsigned NOT NULL,
  `birthDate` int(10) unsigned NOT NULL,
  `birthYear` int(10) unsigned NOT NULL,
  `userName` varchar(50) NOT NULL,
  `password` varchar(25) NOT NULL,
  `emailAddress` varchar(100) NOT NULL,
  `createdOn` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `updatedOn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Rickin','Shah','22B Chatham St.','North Plainfield','NJ',4,27,1987,'kinsho','Kamche00','kinsho@gmail.com','2013-08-04 20:16:36','2013-08-04 20:16:36');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2013-08-16 22:42:04
