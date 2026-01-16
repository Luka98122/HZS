-- MySQL dump 10.13  Distrib 8.0.44, for Linux (x86_64)
--
-- Host: localhost    Database: hakaton
-- ------------------------------------------------------
-- Server version	8.0.44-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `exercises`
--

DROP TABLE IF EXISTS `exercises`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exercises` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` int NOT NULL,
  `exercise_type` varchar(255) NOT NULL,
  `reps` int NOT NULL,
  `duration` int NOT NULL,
  `calories_burned` float NOT NULL,
  `completed_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `session_id` (`session_id`),
  CONSTRAINT `exercises_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `workout_sessions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=133 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exercises`
--

LOCK TABLES `exercises` WRITE;
/*!40000 ALTER TABLE `exercises` DISABLE KEYS */;
INSERT INTO `exercises` VALUES (1,6,'Push-ups',15,0,0,'2026-01-15 15:39:43'),(2,6,'Push-ups',15,0,0,'2026-01-15 15:40:01'),(3,6,'Push-ups',15,0,0,'2026-01-15 15:40:08'),(4,9,'Push-ups',20,0,7,'2026-01-15 15:46:47'),(5,9,'Push-ups',20,0,7,'2026-01-15 15:46:49'),(6,9,'Push-ups',20,0,7,'2026-01-15 15:46:49'),(7,9,'Pull-ups',5,0,3,'2026-01-15 15:47:02'),(8,9,'Pull-ups',5,0,3,'2026-01-15 15:47:03'),(9,9,'Pull-ups',5,0,3,'2026-01-15 15:47:06'),(10,9,'Bodyweight Squats',25,0,6,'2026-01-15 15:47:11'),(11,9,'Bodyweight Squats',25,0,6,'2026-01-15 15:47:11'),(12,9,'Bodyweight Squats',25,0,6,'2026-01-15 15:47:12'),(13,9,'Plank',0,45,4,'2026-01-15 15:47:15'),(14,9,'Plank',0,45,4,'2026-01-15 15:47:17'),(15,9,'Plank',0,45,4,'2026-01-15 15:47:18'),(16,10,'Push-ups',30,0,11,'2026-01-15 18:21:01'),(17,10,'Pull-ups',15,0,9,'2026-01-15 18:21:07'),(18,10,'Bodyweight Squats',50,0,13,'2026-01-15 18:21:17'),(19,10,'Plank',0,3000,240,'2026-01-15 18:24:27'),(20,11,'Push-ups',12,0,4,'2026-01-15 22:33:27'),(21,11,'Pull-ups',8,0,5,'2026-01-15 22:33:47'),(22,11,'Push-ups',10,0,4,'2026-01-15 22:33:59'),(23,11,'Pull-ups',12,0,7,'2026-01-15 22:34:24'),(24,11,'Bodyweight Squats',10,0,3,'2026-01-15 22:34:34'),(25,11,'Plank',0,66,5,'2026-01-15 22:34:45'),(26,11,'Plank',0,120,10,'2026-01-15 22:35:20'),(27,11,'Plank',0,40,3,'2026-01-15 22:35:35'),(28,12,'Push-ups',15,0,5,'2026-01-16 00:02:45'),(29,12,'Push-ups',15,0,5,'2026-01-16 00:02:45'),(30,12,'Pull-ups',0,0,0,'2026-01-16 00:02:46'),(31,12,'Pull-ups',10,0,6,'2026-01-16 00:02:50'),(32,12,'Pull-ups',10,0,6,'2026-01-16 00:02:51'),(33,12,'Bodyweight Squats',20,0,5,'2026-01-16 00:02:53'),(34,12,'Plank',0,30,2,'2026-01-16 00:02:54'),(35,12,'Bodyweight Squats',20,0,5,'2026-01-16 00:02:54'),(36,12,'Plank',0,30,2,'2026-01-16 00:02:55'),(37,14,'Push-ups',15,0,5,'2026-01-16 13:00:59'),(38,15,'Push-ups',15,0,5,'2026-01-16 13:04:04'),(39,15,'Push-ups',15,0,5,'2026-01-16 13:04:06'),(40,16,'Push-ups',15,0,5,'2026-01-16 13:05:42'),(41,17,'Push-ups',15,0,5,'2026-01-16 13:10:12'),(42,17,'Push-ups',15,0,5,'2026-01-16 13:10:13'),(43,17,'Pull-ups',0,0,0,'2026-01-16 13:10:14'),(44,17,'Pull-ups',0,0,0,'2026-01-16 13:10:21'),(45,17,'Bodyweight Squats',20,0,5,'2026-01-16 13:10:22'),(46,17,'Bodyweight Squats',20,0,5,'2026-01-16 13:10:23'),(47,17,'Plank',0,30,2,'2026-01-16 13:10:24'),(48,17,'Plank',0,30,2,'2026-01-16 13:10:24'),(49,18,'Push-ups',15,0,5,'2026-01-16 13:13:39'),(50,18,'Push-ups',15,0,5,'2026-01-16 13:13:41'),(51,18,'Pull-ups',0,0,0,'2026-01-16 13:13:46'),(52,18,'Pull-ups',0,0,0,'2026-01-16 13:14:01'),(53,18,'Pull-ups',0,0,0,'2026-01-16 13:14:03'),(54,19,'Push-ups',15,0,5,'2026-01-16 13:15:37'),(55,19,'Push-ups',15,0,5,'2026-01-16 13:15:38'),(56,20,'Push-ups',15,0,5,'2026-01-16 13:17:23'),(57,21,'Push-ups',15,0,5,'2026-01-16 13:19:28'),(58,21,'Push-ups',15,0,5,'2026-01-16 13:19:28'),(59,21,'Pull-ups',0,0,0,'2026-01-16 13:19:31'),(60,21,'Pull-ups',12,0,7,'2026-01-16 13:19:34'),(61,21,'Bodyweight Squats',20,0,5,'2026-01-16 13:19:36'),(62,21,'Bodyweight Squats',20,0,5,'2026-01-16 13:19:37'),(63,21,'Plank',0,30,2,'2026-01-16 13:19:38'),(64,21,'Plank',0,30,2,'2026-01-16 13:19:38'),(65,21,'Plank',0,30,2,'2026-01-16 13:20:58'),(66,22,'Push-ups',15,0,5,'2026-01-16 13:22:20'),(67,22,'Push-ups',15,0,5,'2026-01-16 13:22:21'),(68,23,'Push-ups',15,0,5,'2026-01-16 13:25:25'),(69,23,'Push-ups',15,0,5,'2026-01-16 13:25:25'),(70,23,'Bodyweight Squats',20,0,5,'2026-01-16 13:25:27'),(71,23,'Plank',0,30,2,'2026-01-16 13:25:28'),(72,24,'Push-ups',15,0,5,'2026-01-16 13:25:34'),(73,24,'Push-ups',15,0,5,'2026-01-16 13:25:35'),(74,5001,'pushup',40,240,45,'2025-12-19 16:22:20'),(75,5001,'squat',60,300,65.2,'2025-12-19 16:32:20'),(76,5001,'plank',0,180,100.3,'2025-12-19 16:42:20'),(77,5002,'pushup',45,260,52,'2025-12-22 16:24:20'),(78,5002,'squat',70,320,78,'2025-12-22 16:36:20'),(79,5002,'plank',0,210,110,'2025-12-22 16:48:20'),(80,5003,'pushup',35,220,42.4,'2025-12-25 16:20:20'),(81,5003,'squat',65,310,73.8,'2025-12-25 16:30:20'),(82,5003,'plank',0,160,79,'2025-12-25 16:40:20'),(83,5004,'pushup',50,280,60,'2025-12-28 16:22:20'),(84,5004,'squat',80,360,92.8,'2025-12-28 16:37:20'),(85,5004,'plank',0,240,113,'2025-12-28 16:52:20'),(86,5005,'pushup',30,200,35.4,'2025-12-30 16:20:20'),(87,5005,'squat',55,280,55,'2025-12-30 16:28:20'),(88,5005,'plank',0,150,70,'2025-12-30 16:36:20'),(89,5006,'pushup',48,275,58,'2026-01-01 16:24:20'),(90,5006,'squat',78,350,90,'2026-01-01 16:38:20'),(91,5006,'plank',0,220,107,'2026-01-01 16:52:20'),(92,5007,'pushup',38,230,46,'2026-01-03 16:21:20'),(93,5007,'squat',62,300,69.6,'2026-01-03 16:30:20'),(94,5007,'plank',0,170,60,'2026-01-03 16:39:20'),(95,5008,'pushup',55,300,66,'2026-01-05 16:24:20'),(96,5008,'squat',85,380,104.1,'2026-01-05 16:40:20'),(97,5008,'plank',0,260,120,'2026-01-05 16:56:20'),(98,5009,'pushup',42,255,50,'2026-01-07 16:22:20'),(99,5009,'squat',68,320,80,'2026-01-07 16:34:20'),(100,5009,'plank',0,190,75,'2026-01-07 16:46:20'),(101,5010,'pushup',60,320,72,'2026-01-10 16:26:20'),(102,5010,'squat',90,400,120.4,'2026-01-10 16:42:20'),(103,5010,'plank',0,280,118,'2026-01-10 16:58:20'),(104,5011,'pushup',36,220,44.2,'2026-01-12 16:20:20'),(105,5011,'squat',60,300,72,'2026-01-12 16:30:20'),(106,5011,'plank',0,160,54,'2026-01-12 16:40:20'),(107,5012,'pushup',46,270,55.9,'2026-01-14 16:24:20'),(108,5012,'squat',74,340,92,'2026-01-14 16:38:20'),(109,5012,'plank',0,210,88,'2026-01-14 16:50:20'),(110,5013,'Push-ups',12,0,4,'2026-01-16 18:29:21'),(111,5013,'Push-ups',15,0,5,'2026-01-16 18:29:26'),(112,5013,'Push-ups',10,0,4,'2026-01-16 18:29:29'),(113,5013,'Pull-ups',8,0,5,'2026-01-16 18:29:36'),(114,5013,'Pull-ups',8,0,5,'2026-01-16 18:29:37'),(115,5013,'Pull-ups',3,0,2,'2026-01-16 18:29:40'),(116,5013,'Bodyweight Squats',20,0,5,'2026-01-16 18:29:44'),(117,5013,'Bodyweight Squats',25,0,6,'2026-01-16 18:29:47'),(118,5013,'Plank',0,45,4,'2026-01-16 18:29:51'),(119,5013,'Plank',0,12,1,'2026-01-16 18:29:54'),(120,5013,'Plank',0,30,2,'2026-01-16 18:29:58'),(121,5014,'Push-ups',12,0,4,'2026-01-16 19:14:07'),(122,5014,'Push-ups',15,0,5,'2026-01-16 19:14:11'),(123,5014,'Push-ups',10,0,4,'2026-01-16 19:14:14'),(124,5014,'Pull-ups',5,0,3,'2026-01-16 19:14:17'),(125,5014,'Pull-ups',3,0,2,'2026-01-16 19:14:21'),(126,5014,'Pull-ups',8,0,5,'2026-01-16 19:14:24'),(127,5014,'Bodyweight Squats',25,0,6,'2026-01-16 19:14:28'),(128,5014,'Bodyweight Squats',30,0,8,'2026-01-16 19:14:31'),(129,5014,'Bodyweight Squats',15,0,4,'2026-01-16 19:14:33'),(130,5014,'Plank',0,35,3,'2026-01-16 19:14:37'),(131,5014,'Plank',0,15,1,'2026-01-16 19:14:40'),(132,5014,'Plank',0,20,2,'2026-01-16 19:14:44');
/*!40000 ALTER TABLE `exercises` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `focus_sessions`
--

DROP TABLE IF EXISTS `focus_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `focus_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `session_type` varchar(255) NOT NULL,
  `duration` int NOT NULL,
  `breathing_pattern` json DEFAULT NULL,
  `ambient_sound` varchar(255) DEFAULT NULL,
  `completed_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `focus_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `focus_sessions`
--

LOCK TABLES `focus_sessions` WRITE;
/*!40000 ALTER TABLE `focus_sessions` DISABLE KEYS */;
INSERT INTO `focus_sessions` VALUES (1,1,'breathing',60,'\"4-7-8 (4-7-8)\"',NULL,'2026-01-15 13:38:59'),(2,1,'breathing',60,'\"4-7-8 (4-7-8)\"',NULL,'2026-01-15 13:41:56'),(3,1,'breathing',60,'\"4-7-8 (4-7-8)\"',NULL,'2026-01-15 13:42:57'),(4,1,'ambient',300,'null','forest','2026-01-15 13:46:00'),(5,1,'ambient',300,'null','rain','2026-01-15 13:46:56'),(6,1,'ambient',300,'null','rain','2026-01-15 13:47:07'),(7,1,'ambient',300,'null','forest','2026-01-15 13:47:12'),(8,1,'ambient',300,'null','forest','2026-01-15 13:47:18'),(9,2,'ambient',300,'null','rain','2026-01-15 17:46:09'),(10,3,'breathing',60,'\"4-7-8 (4-7-8)\"',NULL,'2026-01-16 00:56:12'),(11,3,'ambient',300,'null','forest','2026-01-16 00:56:17'),(12,3,'ambient',300,'null','forest','2026-01-16 00:56:18'),(13,6,'ambient',300,'null','rain','2026-01-16 15:57:41'),(14,5,'breathing',300,'{\"hold\": 2, \"exhale\": 6, \"inhale\": 4}',NULL,'2026-01-04 16:12:20'),(15,5,'ambient',900,NULL,'rain','2026-01-06 16:12:20'),(16,5,'meditation',600,NULL,NULL,'2026-01-07 16:12:20'),(17,5,'breathing',240,'{\"hold\": 0, \"exhale\": 4, \"inhale\": 4}',NULL,'2026-01-09 16:12:20'),(18,5,'ambient',1200,NULL,'forest','2026-01-10 16:12:20'),(19,5,'breathing',300,'{\"hold\": 2, \"exhale\": 5, \"inhale\": 5}',NULL,'2026-01-11 16:12:20'),(20,5,'meditation',600,NULL,NULL,'2026-01-12 16:12:20'),(21,5,'ambient',600,NULL,'white_noise','2026-01-13 16:12:20'),(22,5,'breathing',300,'{\"hold\": 4, \"exhale\": 4, \"inhale\": 4}',NULL,'2026-01-14 16:12:20'),(23,5,'meditation',600,NULL,NULL,'2026-01-15 16:12:20'),(24,7,'breathing',60,'\"4-7-8 (4-7-8)\"',NULL,'2026-01-16 18:32:50'),(25,7,'ambient',300,'null','rain','2026-01-16 18:33:36'),(26,7,'ambient',300,'null','forest','2026-01-16 18:33:49'),(27,7,'ambient',300,'null','forest','2026-01-16 18:33:54'),(28,9,'ambient',300,'null','rain','2026-01-16 19:17:41'),(29,9,'ambient',300,'null','white','2026-01-16 19:18:02'),(30,9,'ambient',300,'null','forest','2026-01-16 19:18:12'),(31,9,'ambient',300,'null','forest','2026-01-16 19:18:22'),(32,9,'breathing',60,'\"4-7-8 (4-7-8)\"',NULL,'2026-01-16 19:18:54');
/*!40000 ALTER TABLE `focus_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gratitude_entries`
--

DROP TABLE IF EXISTS `gratitude_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gratitude_entries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `entry_text` text,
  `created_at` datetime NOT NULL,
  `date` date NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `gratitude_entries_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gratitude_entries`
--

LOCK TABLES `gratitude_entries` WRITE;
/*!40000 ALTER TABLE `gratitude_entries` DISABLE KEYS */;
INSERT INTO `gratitude_entries` VALUES (1,5,'Grateful for a solid workout and feeling stronger.','2026-01-11 12:12:20','2026-01-10'),(2,5,'Grateful for getting study tasks done earlier than expected.','2026-01-12 13:12:20','2026-01-11'),(3,5,'Grateful for a calm evening walk.','2026-01-13 11:12:20','2026-01-12'),(4,5,'Grateful for good focus during pomodoros.','2026-01-14 13:12:20','2026-01-13'),(5,5,'Grateful for support from friends.','2026-01-15 12:12:20','2026-01-14'),(6,5,'Grateful for staying hydrated and sleeping better.','2026-01-16 13:12:20','2026-01-15'),(7,5,'Grateful for making progress step by step.','2026-01-16 14:12:20','2026-01-16');
/*!40000 ALTER TABLE `gratitude_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mood_checkins`
--

DROP TABLE IF EXISTS `mood_checkins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mood_checkins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `mood_score` int NOT NULL,
  `notes` text,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `mood_checkins_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mood_checkins`
--

LOCK TABLES `mood_checkins` WRITE;
/*!40000 ALTER TABLE `mood_checkins` DISABLE KEYS */;
INSERT INTO `mood_checkins` VALUES (1,1,1,NULL,'2026-01-15 13:44:54'),(2,1,2,NULL,'2026-01-15 13:44:56'),(3,1,3,NULL,'2026-01-15 13:44:57'),(4,1,5,NULL,'2026-01-15 13:44:59'),(5,1,5,NULL,'2026-01-15 13:45:00'),(6,1,5,NULL,'2026-01-15 13:45:26'),(7,1,5,NULL,'2026-01-15 14:00:54'),(8,1,5,NULL,'2026-01-15 14:00:55'),(9,2,5,NULL,'2026-01-15 18:24:54'),(10,2,5,'Amazing!!','2026-01-15 18:25:03'),(11,2,5,NULL,'2026-01-15 18:25:04'),(12,2,3,'testing out','2026-01-15 18:59:48'),(13,3,3,NULL,'2026-01-16 00:56:21'),(14,3,5,NULL,'2026-01-16 00:56:21'),(15,3,5,NULL,'2026-01-16 00:56:22'),(16,3,5,NULL,'2026-01-16 00:56:22'),(17,3,5,NULL,'2026-01-16 00:56:23'),(18,3,5,NULL,'2026-01-16 00:56:23'),(19,3,5,NULL,'2026-01-16 00:56:23'),(20,3,5,NULL,'2026-01-16 00:56:24'),(21,3,5,NULL,'2026-01-16 00:56:24'),(22,3,5,NULL,'2026-01-16 00:56:24'),(23,3,5,NULL,'2026-01-16 00:56:24'),(24,3,5,NULL,'2026-01-16 00:56:25'),(25,3,5,NULL,'2026-01-16 00:56:25'),(26,3,5,NULL,'2026-01-16 00:56:25'),(27,3,5,NULL,'2026-01-16 00:56:25'),(28,3,5,NULL,'2026-01-16 00:56:25'),(29,3,5,NULL,'2026-01-16 00:56:26'),(30,3,5,NULL,'2026-01-16 00:56:26'),(31,3,5,NULL,'2026-01-16 00:56:26'),(32,3,5,NULL,'2026-01-16 00:56:26'),(33,3,5,NULL,'2026-01-16 00:56:26'),(34,3,5,NULL,'2026-01-16 00:56:26'),(35,3,5,NULL,'2026-01-16 00:56:27'),(36,6,4,NULL,'2026-01-16 15:57:04'),(37,6,5,'a','2026-01-16 15:57:21'),(38,6,2,NULL,'2026-01-16 15:57:24'),(39,5,3,'A bit tired but okay.','2026-01-04 10:12:20'),(40,5,4,'Good energy today.','2026-01-05 10:12:20'),(41,5,4,'Focused and productive.','2026-01-06 10:12:20'),(42,5,3,'Some stress, managed with breathing.','2026-01-07 10:12:20'),(43,5,5,'Great day overall.','2026-01-08 10:12:20'),(44,5,4,'Solid workout helped mood.','2026-01-09 10:12:20'),(45,5,4,'Pretty balanced day.','2026-01-10 10:12:20'),(46,5,3,'Busy day, a bit anxious.','2026-01-11 10:12:20'),(47,5,4,'Good progress on studying.','2026-01-12 10:12:20'),(48,5,5,'Very motivated.','2026-01-13 10:12:20'),(49,5,4,'Felt calm after meditation.','2026-01-14 10:12:20'),(50,5,4,'Sleep was better.','2026-01-15 10:12:20'),(51,5,5,'Great focus and mood.','2026-01-16 10:12:20'),(52,5,4,'Feeling good today.','2026-01-16 14:12:20'),(53,7,5,'Feeling good','2026-01-16 18:32:27'),(54,7,2,'A bit tired.','2026-01-16 18:32:34'),(55,7,4,'Happy','2026-01-16 18:32:40'),(56,7,4,'Energetic','2026-01-16 18:32:46'),(57,9,5,'Feeling relaxed.','2026-01-16 19:17:55'),(58,9,4,'Feeling abstract.','2026-01-16 19:18:08'),(59,9,2,'Feeling tired','2026-01-16 19:18:20'),(60,9,5,'Feeling excited!','2026-01-16 19:18:30');
/*!40000 ALTER TABLE `mood_checkins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `onboarding_data`
--

DROP TABLE IF EXISTS `onboarding_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `onboarding_data` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `categories` json DEFAULT NULL,
  `physical_goals` json DEFAULT NULL,
  `study_goals` json DEFAULT NULL,
  `focus_goals` json DEFAULT NULL,
  `stress_goals` json DEFAULT NULL,
  `recommendations` text,
  `completed_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `onboarding_data_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `onboarding_data`
--

LOCK TABLES `onboarding_data` WRITE;
/*!40000 ALTER TABLE `onboarding_data` DISABLE KEYS */;
INSERT INTO `onboarding_data` VALUES (1,1,'[\"physical\", \"study\"]','{\"water_glasses_per_day\": 7, \"calories_burn_per_week\": 500}','{\"study_hours_per_week\": 5}','{}','{}','Start with 3 workout sessions per week and track your water intake daily. Use the Pomodoro technique: 25 minutes of focused work, 5 minute breaks.','2026-01-15 19:08:44'),(2,3,'[\"physical\", \"study\"]','{\"water_glasses_per_day\": 4, \"calories_burn_per_week\": 550}','{\"study_hours_per_week\": 8}','{}','{}','Start with 3 workout sessions per week and track your water intake daily. Use the Pomodoro technique: 25 minutes of focused work, 5 minute breaks.','2026-01-15 21:50:57'),(3,4,'[\"physical\", \"study\"]','{\"water_glasses_per_day\": 4, \"calories_burn_per_week\": 200}','{\"study_hours_per_week\": 80}','{}','{}','Start with 3 workout sessions per week and track your water intake daily. Use the Pomodoro technique: 25 minutes of focused work, 5 minute breaks.','2026-01-15 22:32:23'),(4,2,'[\"physical\", \"study\"]','{\"water_glasses_per_day\": 4, \"calories_burn_per_week\": 2200}','{\"study_hours_per_week\": 13}','{}','{}','Start with 3 workout sessions per week and track your water intake daily. Use the Pomodoro technique: 25 minutes of focused work, 5 minute breaks.','2026-01-16 13:31:02'),(6,6,'[\"physical\", \"study\"]','{\"water_glasses_per_day\": 6, \"calories_burn_per_week\": 300}','{\"study_hours_per_week\": 10}','{}','{}','Start with 3 workout sessions per week and track your water intake daily. Use the Pomodoro technique: 25 minutes of focused work, 5 minute breaks.','2026-01-16 15:56:03'),(7,5,'[\"physical\", \"study\"]','{\"water_glasses_per_day\": 8, \"calories_burn_per_week\": 1200}','{\"study_hours_per_week\": 10}','{}','{}','Start with 3 workout sessions per week and track your water intake daily. Use the Pomodoro technique: 25 minutes of focused work, 5 minute breaks.','2025-12-02 16:12:20'),(8,7,'[\"physical\", \"study\"]','{\"water_glasses_per_day\": 11, \"calories_burn_per_week\": 300}','{\"study_hours_per_week\": 7}','{}','{}','Start with 3 workout sessions per week and track your water intake daily. Use the Pomodoro technique: 25 minutes of focused work, 5 minute breaks.','2026-01-16 18:28:58'),(9,8,'[\"physical\", \"study\"]','{\"water_glasses_per_day\": 8, \"calories_burn_per_week\": 2000}','{\"study_hours_per_week\": 10}','{}','{}','Start with 3 workout sessions per week and track your water intake daily. Use the Pomodoro technique: 25 minutes of focused work, 5 minute breaks.','2026-01-16 18:37:12'),(10,9,'[\"physical\", \"study\"]','{\"water_glasses_per_day\": 12, \"calories_burn_per_week\": 350}','{\"study_hours_per_week\": 5}','{}','{}','Start with 3 workout sessions per week and track your water intake daily. Use the Pomodoro technique: 25 minutes of focused work, 5 minute breaks.','2026-01-16 19:13:51');
/*!40000 ALTER TABLE `onboarding_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `session_uuid` varchar(255) NOT NULL,
  `user_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `expires_at` datetime NOT NULL,
  `is_valid` tinyint(1) NOT NULL,
  PRIMARY KEY (`session_uuid`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('0541672b-0829-451f-a71d-2344392261ca',7,'2026-01-16 18:50:49','2026-04-16 18:50:49',0),('0abb0975-339e-49f9-89c9-fed7d4b87030',9,'2026-01-16 19:13:37','2026-04-16 19:13:37',0),('0d81df06-6c87-410e-896d-b2521dd0d227',3,'2026-01-15 22:08:21','2026-04-15 22:08:21',0),('14a0b2ba-d2d2-4b85-affd-4b579779dce3',3,'2026-01-16 01:20:25','2026-04-16 01:20:25',0),('289fb8a2-7b04-4168-9e70-adcd426018ea',3,'2026-01-16 01:12:24','2026-04-16 01:12:24',0),('392c6eae-a5d8-453f-8ca9-cc9d36faa1c6',2,'2026-01-16 13:25:04','2026-04-16 13:25:04',1),('3b179333-311f-4a44-9fd2-6dbd5b6d1ca1',1,'2026-01-16 13:52:27','2026-04-16 13:52:27',0),('3b99ef5c-a6c1-4f1e-8833-85ce23af323c',1,'2026-01-16 14:07:12','2026-04-16 14:07:12',0),('567e2dd7-ddaa-486d-9723-38356e5dab6e',8,'2026-01-16 18:37:07','2026-04-16 18:37:07',0),('67c129e3-eced-4bea-abe4-4f1472ad1832',5,'2026-01-16 18:22:05','2026-04-16 18:22:05',0),('6870bef7-b289-4b3b-8ad8-62c9383a4f9e',1,'2026-01-16 14:03:41','2026-04-16 14:03:41',0),('76570914-1726-4a05-9b17-55a67f346762',3,'2026-01-16 01:09:54','2026-04-16 01:09:54',1),('857eff29-917e-4961-8dc8-9149210b7e5c',5,'2026-01-16 15:48:28','2026-04-16 15:48:28',0),('85c98114-8c37-4ffd-8c38-3648d5dddc5c',7,'2026-01-16 18:40:56','2026-04-16 18:40:56',0),('913ba962-f8c5-408c-8817-bb7cea1b5463',2,'2026-01-15 17:41:13','2026-04-15 17:41:13',0),('99dce74a-d26d-447c-9174-7769a44abd92',5,'2026-01-16 17:33:46','2026-04-16 17:33:46',0),('9b4b4a70-f0d5-4897-9e34-e4888a375a55',1,'2026-01-14 21:54:18','2026-04-14 21:54:18',0),('9f39fbe6-2d51-45b0-a3e5-1a42b07d49c1',6,'2026-01-16 15:55:43','2026-04-16 15:55:43',1),('a98d763e-30eb-46c9-9401-cdd207788d16',3,'2026-01-16 01:11:03','2026-04-16 01:11:03',1),('ad51a5d6-a752-460d-9a28-89512fdb1ec3',1,'2026-01-15 18:08:49','2026-04-15 18:08:49',0),('b3eca5a9-0286-4c7a-a036-58ea5880a4a3',1,'2026-01-16 14:22:07','2026-04-16 14:22:07',0),('b6c893b6-ad33-4e66-a92f-e6888da34069',7,'2026-01-16 18:47:40','2026-04-16 18:47:40',0),('c3c85307-cdbf-4ba4-bb61-f4c7ff25d661',3,'2026-01-16 13:00:37','2026-04-16 13:00:37',0),('ccec264b-4f71-430e-bc12-59678afb3b3b',2,'2026-01-15 20:40:36','2026-04-15 20:40:36',1),('d565965f-ab5b-49b7-8050-557040629ef4',3,'2026-01-15 21:55:02','2026-04-15 21:55:02',0),('e0c667ee-1d5e-425c-a883-ee9fdddd83f7',1,'2026-01-14 21:54:41','2026-04-14 21:54:41',0),('e1c2afbe-0d64-4807-88ed-11fc76c23364',1,'2026-01-16 20:06:39','2026-04-16 20:06:39',1),('e5615ee4-0ce1-4757-9d26-d029a87a6b0a',3,'2026-01-15 21:50:45','2026-04-15 21:50:45',0),('ec201c02-ca29-46d9-a72a-2b2552d91e3c',4,'2026-01-15 22:30:02','2026-04-15 22:30:02',1),('f21d6d58-80cb-4fb9-9f32-d6a23c931423',1,'2026-01-15 18:39:19','2026-04-15 18:39:19',0),('f2790a3a-bb31-4d98-a154-7b3b4d8c4e96',7,'2026-01-16 18:28:34','2026-04-16 18:28:34',0),('f70a361b-3229-4772-b7a4-e0aeb809cb75',1,'2026-01-16 14:06:58','2026-04-16 14:06:58',0);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stress_journal`
--

DROP TABLE IF EXISTS `stress_journal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stress_journal` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `entry_text` text,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `stress_journal_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stress_journal`
--

LOCK TABLES `stress_journal` WRITE;
/*!40000 ALTER TABLE `stress_journal` DISABLE KEYS */;
INSERT INTO `stress_journal` VALUES (1,1,'Feeling productive','2026-01-15 13:43:11'),(2,1,'Feeling a bit tired.','2026-01-15 13:43:26'),(3,3,'Hello, earth.','2026-01-16 00:32:58'),(4,3,'Testing, new','2026-01-16 00:50:53'),(5,5,'Felt overwhelmed by deadlines. Did 5 minutes breathing and broke tasks into small steps.','2026-01-05 14:12:20'),(6,5,'Noticed distraction during study. Put phone away and used pomodoro timer.','2026-01-09 13:12:20'),(7,5,'Workload heavy. Prioritized top 3 tasks and postponed non-urgent stuff.','2026-01-11 12:12:20'),(8,5,'Anxious in the morning. Walk + water helped a lot.','2026-01-14 14:12:20'),(9,5,'Feeling more in control this week. Keeping routines consistent.','2026-01-16 14:12:20'),(10,7,'Today was a long day. I did my math homework, and studied history.','2026-01-16 18:33:28'),(11,9,'Today was an exciting day! I worked on a project, and then did my homework.','2026-01-16 19:18:49');
/*!40000 ALTER TABLE `stress_journal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stretch_reminders`
--

DROP TABLE IF EXISTS `stretch_reminders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stretch_reminders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `reminded_at` datetime NOT NULL,
  `completed` tinyint(1) NOT NULL,
  `completed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `stretch_reminders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stretch_reminders`
--

LOCK TABLES `stretch_reminders` WRITE;
/*!40000 ALTER TABLE `stretch_reminders` DISABLE KEYS */;
INSERT INTO `stretch_reminders` VALUES (1,5,'2026-01-05 01:12:20',1,'2026-01-05 01:20:20'),(2,5,'2026-01-08 07:12:20',1,'2026-01-08 07:18:20'),(3,5,'2026-01-11 03:12:20',1,'2026-01-11 03:19:20'),(4,5,'2026-01-14 02:12:20',0,NULL),(5,5,'2026-01-16 08:12:20',1,'2026-01-16 08:17:20');
/*!40000 ALTER TABLE `stretch_reminders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `study_sessions`
--

DROP TABLE IF EXISTS `study_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `study_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `total_duration` int NOT NULL,
  `pomodoro_count` int NOT NULL,
  `distraction_count` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `study_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7018 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `study_sessions`
--

LOCK TABLES `study_sessions` WRITE;
/*!40000 ALTER TABLE `study_sessions` DISABLE KEYS */;
INSERT INTO `study_sessions` VALUES (1,1,'2026-01-14 22:06:07','2026-01-14 22:06:22',14,10,6),(2,1,'2026-01-14 22:06:27','2026-01-14 22:06:28',0,0,0),(3,1,'2026-01-14 22:09:02','2026-01-14 22:09:03',1,0,0),(4,1,'2026-01-14 22:11:14','2026-01-14 22:12:24',69,15,0),(5,1,'2026-01-14 22:12:29','2026-01-14 22:12:31',2,0,0),(6,1,'2026-01-14 22:58:21','2026-01-14 22:58:22',0,0,0),(7,1,'2026-01-15 12:37:19','2026-01-15 12:53:34',975,1,0),(8,1,'2026-01-15 13:36:22',NULL,0,0,0),(9,1,'2026-01-15 13:47:58',NULL,0,0,0),(10,2,'2026-01-15 19:00:20','2026-01-15 19:00:33',12,2,1),(11,4,'2026-01-15 22:37:12',NULL,0,0,0),(12,4,'2026-01-15 22:39:27','2026-01-15 22:40:08',41,0,0),(13,4,'2026-01-15 22:40:21','2026-01-15 22:41:06',45,4,2),(14,6,'2026-01-16 15:58:53',NULL,0,0,0),(7001,5,'2025-12-27 16:12:20','2025-12-27 17:42:20',5400,3,2),(7002,5,'2025-12-29 16:12:20','2025-12-29 17:27:20',4500,2,1),(7003,5,'2025-12-31 16:12:20','2025-12-31 18:02:20',6600,4,3),(7004,5,'2026-01-02 16:12:20','2026-01-02 17:12:20',3600,2,0),(7005,5,'2026-01-04 16:12:20','2026-01-04 17:47:20',5700,3,1),(7006,5,'2026-01-06 16:12:20','2026-01-06 17:32:20',4800,2,2),(7007,5,'2026-01-07 16:12:20','2026-01-07 17:22:20',4200,2,1),(7008,5,'2026-01-09 16:12:20','2026-01-09 17:52:20',6000,3,2),(7009,5,'2026-01-10 16:12:20','2026-01-10 17:37:20',5100,3,1),(7010,5,'2026-01-11 16:12:20','2026-01-11 17:17:20',3900,2,1),(7011,5,'2026-01-12 16:12:20','2026-01-12 18:12:20',7200,4,2),(7012,5,'2026-01-13 16:12:20','2026-01-13 17:27:20',4500,2,0),(7013,5,'2026-01-14 16:12:20','2026-01-14 17:42:20',5400,3,1),(7014,5,'2026-01-15 16:12:20','2026-01-15 17:12:20',3600,2,0),(7015,5,'2026-01-16 10:12:20','2026-01-16 11:32:20',4800,2,1),(7016,7,'2026-01-16 18:30:35','2026-01-16 18:31:14',39,0,2),(7017,9,'2026-01-16 19:16:30','2026-01-16 19:17:02',32,0,2);
/*!40000 ALTER TABLE `study_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `study_streaks`
--

DROP TABLE IF EXISTS `study_streaks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `study_streaks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `current_streak` int NOT NULL,
  `longest_streak` int NOT NULL,
  `last_study_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `study_streaks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `study_streaks`
--

LOCK TABLES `study_streaks` WRITE;
/*!40000 ALTER TABLE `study_streaks` DISABLE KEYS */;
INSERT INTO `study_streaks` VALUES (1,1,2,2,'2026-01-15'),(2,2,1,1,'2026-01-15'),(3,4,1,1,'2026-01-15'),(4,5,7,21,'2026-01-16'),(5,7,1,1,'2026-01-16'),(6,9,1,1,'2026-01-16');
/*!40000 ALTER TABLE `study_streaks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `study_tasks`
--

DROP TABLE IF EXISTS `study_tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `study_tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `session_id` int DEFAULT NULL,
  `task_name` varchar(200) NOT NULL,
  `estimated_time` int NOT NULL,
  `actual_time` int DEFAULT NULL,
  `completed` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL,
  `completed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `session_id` (`session_id`),
  CONSTRAINT `study_tasks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `study_tasks_ibfk_2` FOREIGN KEY (`session_id`) REFERENCES `study_sessions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `study_tasks`
--

LOCK TABLES `study_tasks` WRITE;
/*!40000 ALTER TABLE `study_tasks` DISABLE KEYS */;
INSERT INTO `study_tasks` VALUES (4,1,NULL,'Make landing page',25,NULL,1,'2026-01-14 22:56:49','2026-01-14 22:57:08'),(5,1,NULL,'Make user authentication',60,NULL,1,'2026-01-14 22:57:04','2026-01-14 22:57:09'),(6,1,NULL,'Make /home page',25,NULL,1,'2026-01-14 22:57:15','2026-01-14 22:57:16'),(7,1,NULL,'Make sure its mobile friendly',45,NULL,0,'2026-01-14 22:57:23',NULL),(9,4,NULL,'Biology',60,NULL,1,'2026-01-15 22:37:34','2026-01-15 22:38:29'),(11,5,7008,'Algorithms: big-O practice set',60,55,1,'2026-01-09 16:12:20','2026-01-09 17:22:20'),(12,5,7011,'Databases: indexing + EXPLAIN notes',90,100,1,'2026-01-11 16:12:20','2026-01-12 18:12:20'),(13,5,7013,'System design: caching patterns',75,80,1,'2026-01-13 16:12:20','2026-01-14 18:12:20'),(14,5,NULL,'Finish math homework (linear algebra)',45,NULL,0,'2026-01-14 16:12:20',NULL),(15,5,NULL,'Read 20 pages (psychology)',30,NULL,0,'2026-01-15 16:12:20',NULL),(16,5,7014,'English: vocab + flashcards',25,25,1,'2026-01-15 16:12:20','2026-01-15 16:47:20'),(17,5,NULL,'Prepare tomorrow’s study plan',20,NULL,0,'2026-01-16 04:12:20',NULL),(18,5,7015,'CS: recursion exercises',40,42,1,'2026-01-16 06:12:20','2026-01-16 11:42:20'),(19,7,NULL,'Math homework - pages 1-3',15,NULL,1,'2026-01-16 18:30:22','2026-01-16 18:31:06'),(20,7,NULL,'Landing page on project',60,NULL,0,'2026-01-16 18:30:34',NULL),(23,9,NULL,'Math homework',15,NULL,0,'2026-01-16 19:16:17',NULL),(24,9,NULL,'Computer Science Homework',45,NULL,1,'2026-01-16 19:16:28','2026-01-16 19:16:47');
/*!40000 ALTER TABLE `study_tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'luka98122','luka98122@gmail.com','Luka Markovic','5b2f5f02efbabc16aa9cfdc205d0cc37ba3a5ae20605d6796caf96603f1116a8','2026-01-14 21:54:18'),(2,'@miticc','mitic.marko2007@gmail.com','Marko Mitić','a1b6d908f9b04fcccd108ef7384aee2e66a2ba13fdcc1a107d9a5b159e958a63','2026-01-15 17:41:13'),(3,'@johndoe','johndoe@gmail.com','John Doe','ea18407038e512c8ada0bfef63cdc996fc1ea77c96a92a9017b8ed40891edcd7','2026-01-15 21:50:45'),(4,'ivanam.bgd@gmail.com','ivanam.bgd@gmail.com','Ivana Markovic','f2d9756f1341514b9d573dc4264238c7efde60944d5be83486d42010e9cd587c','2026-01-15 22:30:02'),(5,'demo','demo@hoi5.com','Demo Person','4243cfc3339819673986c4ab05cde05d63db990c92ca624b6ca518192f6e27e3','2026-01-16 15:48:28'),(6,'petar','petar29112008@gmail.com','Petar Tolimir','51996db3e5c3e79e54eb41d668e63ba3834fb8fa99499fa15014e926293b798e','2026-01-16 15:55:43'),(7,'demouser2','demouser+2@react.hoi5.com','Demo User Two','087f0118e2de17071ecc0a0884792925a547908c54dcf113bfcaeb24a64619a7','2026-01-16 18:28:34'),(8,'test','testy@god.com','test','10f4294e3166470d16ec9d083cc361d2b9e6be91bc08d5ea717cc43a669ee41f','2026-01-16 18:37:07'),(9,'userdemo2','userdemo+2@react.hoi5.com','User Demo','5ed868acdf0ee67e78bd4c1dd0c6a234c5fcafb418a50d149ffa8bd305d88fc5','2026-01-16 19:13:37');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `water_intake`
--

DROP TABLE IF EXISTS `water_intake`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `water_intake` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `glasses` int NOT NULL,
  `date` date NOT NULL,
  `logged_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `water_intake_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `water_intake`
--

LOCK TABLES `water_intake` WRITE;
/*!40000 ALTER TABLE `water_intake` DISABLE KEYS */;
INSERT INTO `water_intake` VALUES (1,1,8,'2026-01-15','2026-01-15 16:34:11'),(2,2,5,'2026-01-15','2026-01-15 19:42:53'),(3,3,6,'2026-01-16','2026-01-16 00:02:28'),(4,1,5,'2026-01-16','2026-01-16 13:52:36'),(5,2,3,'2026-01-16','2026-01-16 14:27:18'),(6,6,5,'2026-01-16','2026-01-16 15:56:30'),(7,5,6,'2026-01-03','2026-01-04 13:12:20'),(8,5,7,'2026-01-04','2026-01-05 12:12:20'),(9,5,8,'2026-01-05','2026-01-06 14:12:20'),(10,5,5,'2026-01-06','2026-01-07 11:12:20'),(11,5,9,'2026-01-07','2026-01-08 13:12:20'),(12,5,8,'2026-01-08','2026-01-09 12:12:20'),(13,5,7,'2026-01-09','2026-01-10 13:12:20'),(14,5,8,'2026-01-10','2026-01-11 14:12:20'),(15,5,6,'2026-01-11','2026-01-12 12:12:20'),(16,5,9,'2026-01-12','2026-01-13 14:12:20'),(17,5,8,'2026-01-13','2026-01-14 13:12:20'),(18,5,10,'2026-01-14','2026-01-15 14:12:20'),(19,5,7,'2026-01-15','2026-01-16 12:12:20'),(20,5,8,'2026-01-16','2026-01-16 14:12:20'),(21,7,7,'2026-01-16','2026-01-16 18:31:44'),(22,9,9,'2026-01-16','2026-01-16 19:19:29');
/*!40000 ALTER TABLE `water_intake` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workout_sessions`
--

DROP TABLE IF EXISTS `workout_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workout_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `total_duration` int NOT NULL,
  `total_calories_burned` float NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `workout_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5015 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workout_sessions`
--

LOCK TABLES `workout_sessions` WRITE;
/*!40000 ALTER TABLE `workout_sessions` DISABLE KEYS */;
INSERT INTO `workout_sessions` VALUES (1,1,'2026-01-15 15:28:15',NULL,0,0),(2,1,'2026-01-15 15:28:24',NULL,0,0),(3,1,'2026-01-15 15:28:33',NULL,0,0),(4,1,'2026-01-15 15:30:01',NULL,0,0),(5,1,'2026-01-15 15:33:37',NULL,0,0),(6,1,'2026-01-15 15:39:41',NULL,0,0),(7,1,'2026-01-15 15:45:30',NULL,0,0),(8,1,'2026-01-15 15:45:40',NULL,0,0),(9,1,'2026-01-15 15:46:35','2026-01-15 15:47:36',61,60),(10,2,'2026-01-15 18:20:51','2026-01-15 18:24:30',218,273),(11,4,'2026-01-15 22:33:21','2026-01-15 22:36:03',161,41),(12,3,'2026-01-16 00:02:43','2026-01-16 00:07:12',268,36),(13,3,'2026-01-16 13:00:52','2026-01-16 13:00:52',0,0),(14,3,'2026-01-16 13:00:56',NULL,0,5),(15,3,'2026-01-16 13:04:03',NULL,0,10),(16,3,'2026-01-16 13:05:38',NULL,0,5),(17,3,'2026-01-16 13:10:11',NULL,0,24),(18,3,'2026-01-16 13:13:38',NULL,0,10),(19,3,'2026-01-16 13:15:35',NULL,0,10),(20,3,'2026-01-16 13:17:22','2026-01-16 13:19:24',122,5),(21,3,'2026-01-16 13:19:27','2026-01-16 13:21:14',107,33),(22,3,'2026-01-16 13:22:19','2026-01-16 13:22:31',12,10),(23,3,'2026-01-16 13:25:24','2026-01-16 13:25:30',5,17),(24,3,'2026-01-16 13:25:32','2026-01-16 13:25:36',3,10),(5001,5,'2025-12-19 16:12:20','2025-12-19 16:50:20',2280,210.5),(5002,5,'2025-12-22 16:12:20','2025-12-22 16:54:20',2520,240),(5003,5,'2025-12-25 16:12:20','2025-12-25 16:47:20',2100,195.2),(5004,5,'2025-12-28 16:12:20','2025-12-28 16:58:20',2760,265.8),(5005,5,'2025-12-30 16:12:20','2025-12-30 16:42:20',1800,160.4),(5006,5,'2026-01-01 16:12:20','2026-01-01 16:56:20',2640,255),(5007,5,'2026-01-03 16:12:20','2026-01-03 16:45:20',1980,175.6),(5008,5,'2026-01-05 16:12:20','2026-01-05 17:00:20',2880,290.1),(5009,5,'2026-01-07 16:12:20','2026-01-07 16:48:20',2160,205),(5010,5,'2026-01-10 16:12:20','2026-01-10 17:02:20',3000,310.4),(5011,5,'2026-01-12 16:12:20','2026-01-12 16:44:20',1920,170.2),(5012,5,'2026-01-14 16:12:20','2026-01-14 16:53:20',2460,235.9),(5013,7,'2026-01-16 18:29:14','2026-01-16 18:30:01',46,43),(5014,9,'2026-01-16 19:14:03','2026-01-16 19:14:47',44,47);
/*!40000 ALTER TABLE `workout_sessions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-16 21:01:58
