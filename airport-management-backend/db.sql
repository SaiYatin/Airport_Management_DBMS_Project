-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: airport_management
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `airport`
--

DROP TABLE IF EXISTS `airport`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `airport` (
  `airport_id` varchar(10) NOT NULL,
  `name` varchar(100) NOT NULL,
  `city` varchar(50) NOT NULL,
  `country` varchar(50) DEFAULT 'India',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`airport_id`),
  CONSTRAINT `airport_id_format` CHECK ((length(`airport_id`) = 3))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `airport`
--

LOCK TABLES `airport` WRITE;
/*!40000 ALTER TABLE `airport` DISABLE KEYS */;
INSERT INTO `airport` VALUES ('BLR','Kempegowda International Airport','Bengaluru','India','2025-10-10 03:58:04','2025-10-25 18:04:00'),('BOM','Chhatrapati Shivaji Maharaj International Airport','Mumbai','India','2025-10-10 03:58:04','2025-10-10 03:58:04'),('CCU','Netaji Subhas Chandra Bose International Airport','Kolkata','India','2025-10-10 03:58:04','2025-10-10 03:58:04'),('COK','Cochin International Airport','Kochi','India','2025-10-10 03:58:04','2025-10-10 03:58:04'),('DEL','Indira Gandhi International Airport','Delhi','India','2025-10-10 03:58:04','2025-10-10 03:58:04'),('GOI','Goa International Airport','Goa','India','2025-10-10 03:58:04','2025-10-10 03:58:04'),('HYD','Rajiv Gandhi International Airport','Hyderabad','India','2025-10-10 03:58:04','2025-10-10 03:58:04'),('MAA','Chennai International Airport','Chennai','India','2025-10-10 03:58:04','2025-10-10 03:58:04');
/*!40000 ALTER TABLE `airport` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `airportstatistics`
--

DROP TABLE IF EXISTS `airportstatistics`;
/*!50001 DROP VIEW IF EXISTS `airportstatistics`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `airportstatistics` AS SELECT 
 1 AS `airport_id`,
 1 AS `airport_name`,
 1 AS `city`,
 1 AS `total_stores`,
 1 AS `total_workers`,
 1 AS `departing_flights`,
 1 AS `arriving_flights`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `bookingagent`
--

DROP TABLE IF EXISTS `bookingagent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookingagent` (
  `agent_id` varchar(10) NOT NULL,
  `booking_company_name` varchar(100) NOT NULL,
  `commission_rate` decimal(5,2) DEFAULT '5.00',
  `contact_email` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`agent_id`),
  KEY `idx_ba_name` (`booking_company_name`),
  CONSTRAINT `bookingagent_ibfk_1` FOREIGN KEY (`agent_id`) REFERENCES `supplier` (`supplier_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `valid_commission` CHECK (((`commission_rate` >= 0) and (`commission_rate` <= 100)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookingagent`
--

LOCK TABLES `bookingagent` WRITE;
/*!40000 ALTER TABLE `bookingagent` DISABLE KEYS */;
INSERT INTO `bookingagent` VALUES ('BA001','MakeMyTrip',7.50,'support@makemytrip.com','2025-10-10 03:58:04'),('BA002','Cleartrip',6.00,'support@cleartrip.com','2025-10-10 03:58:04'),('BA003','Goibibo',6.50,'support@goibibo.com','2025-10-10 03:58:04');
/*!40000 ALTER TABLE `bookingagent` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flight`
--

DROP TABLE IF EXISTS `flight`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flight` (
  `flight_number` varchar(10) NOT NULL,
  `departure_airport` varchar(10) NOT NULL,
  `arrival_airport` varchar(10) NOT NULL,
  `flight_date` date NOT NULL,
  `departure_hour` time NOT NULL,
  `arrival_hour` time NOT NULL,
  `total_seats` int NOT NULL DEFAULT '180',
  `available_seats` int NOT NULL DEFAULT '180',
  `status` varchar(20) DEFAULT 'scheduled',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `flight_company_id` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`flight_number`),
  KEY `idx_flight_date` (`flight_date`),
  KEY `idx_flight_status` (`status`),
  KEY `idx_flight_departure` (`departure_airport`),
  KEY `idx_flight_arrival` (`arrival_airport`),
  KEY `flight_company_id` (`flight_company_id`),
  CONSTRAINT `flight_ibfk_1` FOREIGN KEY (`departure_airport`) REFERENCES `airport` (`airport_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `flight_ibfk_2` FOREIGN KEY (`arrival_airport`) REFERENCES `airport` (`airport_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `flight_ibfk_3` FOREIGN KEY (`flight_company_id`) REFERENCES `flightcompany` (`flight_company_id`) ON DELETE RESTRICT,
  CONSTRAINT `valid_seats` CHECK (((`available_seats` >= 0) and (`available_seats` <= `total_seats`))),
  CONSTRAINT `valid_status` CHECK ((`status` in (_utf8mb4'scheduled',_utf8mb4'boarding',_utf8mb4'departed',_utf8mb4'arrived',_utf8mb4'cancelled',_utf8mb4'delayed')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flight`
--

LOCK TABLES `flight` WRITE;
/*!40000 ALTER TABLE `flight` DISABLE KEYS */;
INSERT INTO `flight` VALUES ('6E202','DEL','BOM','2025-11-07','14:00:00','16:30:00',186,178,'scheduled','2025-10-10 03:58:04','2025-11-07 08:53:43','FC002'),('6E301','CCU','GOI','2025-11-20','15:00:00','17:30:00',186,180,'scheduled','2025-10-10 03:58:04','2025-11-05 05:48:51','FC002'),('AI101','BLR','DEL','2025-11-10','08:00:00','11:00:00',180,148,'scheduled','2025-10-10 03:58:04','2025-11-07 07:23:44','FC001'),('AI104','MAA','HYD','2025-11-13','15:00:00','16:30:00',180,174,'boarding','2025-10-10 03:58:04','2025-11-10 04:53:50','FC001'),('AI201','BLR','CCU','2025-11-15','10:00:00','12:30:00',180,163,'scheduled','2025-10-10 03:58:04','2025-11-08 18:48:57','FC001'),('AI301','COK','DEL','2025-11-20','11:00:00','14:00:00',180,170,'scheduled','2025-10-10 03:58:04','2025-11-05 05:48:51','FC001'),('AI777','BLR','MAA','2025-11-20','14:00:00','15:30:00',180,179,'scheduled','2025-10-25 18:14:57','2025-11-07 07:25:23','FC001'),('IND001','MAA','COK','2025-11-11','10:01:00','11:00:00',180,180,'scheduled','2025-11-08 06:48:22','2025-11-08 06:48:22',NULL),('IND1011','DEL','COK','2025-11-15','10:00:00','12:00:00',180,180,'scheduled','2025-11-10 04:56:39','2025-11-10 04:56:39',NULL),('SG303','BOM','MAA','2025-11-17','09:00:00','11:00:00',150,140,'scheduled','2025-10-10 03:58:04','2025-11-06 12:55:09','FC003'),('SG401','GOI','COK','2025-11-20','08:30:00','10:00:00',150,145,'scheduled','2025-10-10 03:58:04','2025-11-05 05:48:51','FC003'),('TEST101','BLR','MAA','2025-11-20','10:00:00','12:30:00',180,180,'scheduled','2025-10-25 18:11:27','2025-11-05 05:48:51',NULL),('UK505','HYD','BLR','2025-11-20','07:00:00','08:30:00',156,156,'scheduled','2025-10-10 03:58:04','2025-11-05 05:48:51',NULL),('UK601','DEL','BLR','2025-11-20','16:00:00','18:30:00',156,150,'scheduled','2025-10-10 03:58:04','2025-11-05 05:48:51',NULL);
/*!40000 ALTER TABLE `flight` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flightcompany`
--

DROP TABLE IF EXISTS `flightcompany`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flightcompany` (
  `flight_company_id` varchar(10) NOT NULL,
  `flight_company_name` varchar(100) NOT NULL,
  `country` varchar(50) DEFAULT NULL,
  `contact_email` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`flight_company_id`),
  UNIQUE KEY `flight_company_name` (`flight_company_name`),
  KEY `idx_fc_name` (`flight_company_name`),
  CONSTRAINT `flightcompany_ibfk_1` FOREIGN KEY (`flight_company_id`) REFERENCES `supplier` (`supplier_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flightcompany`
--

LOCK TABLES `flightcompany` WRITE;
/*!40000 ALTER TABLE `flightcompany` DISABLE KEYS */;
INSERT INTO `flightcompany` VALUES ('FC001','Air India','India','support@airindia.com','2025-10-10 03:58:04'),('FC002','IndiGo','India','support@goindigo.in','2025-10-10 03:58:04'),('FC003','SpiceJet','India','support@spicejet.com','2025-10-10 03:58:04'),('FC004','Vistara','India','support@airvistara.com','2025-10-10 03:58:04');
/*!40000 ALTER TABLE `flightcompany` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `flightrevenue`
--

DROP TABLE IF EXISTS `flightrevenue`;
/*!50001 DROP VIEW IF EXISTS `flightrevenue`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `flightrevenue` AS SELECT 
 1 AS `flight_number`,
 1 AS `flight_date`,
 1 AS `flight_company_name`,
 1 AS `tickets_sold`,
 1 AS `total_revenue`,
 1 AS `avg_ticket_price`,
 1 AS `total_seats`,
 1 AS `available_seats`,
 1 AS `seats_booked`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `passenger`
--

DROP TABLE IF EXISTS `passenger`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `passenger` (
  `passenger_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `age` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`passenger_id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_passenger_email` (`email`),
  KEY `idx_passenger_name` (`name`),
  CONSTRAINT `valid_age` CHECK (((`age` > 0) and (`age` < 120))),
  CONSTRAINT `valid_email` CHECK ((`email` like _utf8mb4'%@%.%'))
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `passenger`
--

LOCK TABLES `passenger` WRITE;
/*!40000 ALTER TABLE `passenger` DISABLE KEYS */;
INSERT INTO `passenger` VALUES (1,'Rajesh Kumar','rajesh.kumar@email.com','9876543210',35,'2025-10-10 03:58:04'),(2,'Priya Sharma','priya.sharma@email.com','9876543211',28,'2025-10-10 03:58:04'),(3,'Amit Patel','amit.patel@email.com','9876543212',42,'2025-10-10 03:58:04'),(4,'Sneha Reddy','sneha.reddy@email.com','9876543213',31,'2025-10-10 03:58:04'),(5,'Vikram Singh','vikram.singh@email.com','9876543214',45,'2025-10-10 03:58:04'),(6,'Anita Deshmukh','anita.d@email.com','9876543215',29,'2025-10-10 03:58:04'),(7,'Rahul Verma','rahul.v@email.com','9876543216',38,'2025-10-10 03:58:04'),(8,'Kavita Iyer','kavita.iyer@email.com','9876543217',33,'2025-10-10 03:58:04'),(9,'Sanjay Gupta','sanjay.g@email.com','9876543218',51,'2025-10-10 03:58:04'),(10,'Meera Nair','meera.nair@email.com','9876543219',27,'2025-10-10 03:58:04'),(11,'Ramesh Gupta','ramesh.gupta@email.com','9876543220',38,'2025-11-04 16:49:43'),(12,'sai yatin','sumakkiyatin@gmail.com',NULL,20,'2025-11-04 19:04:18'),(13,'tarun ','sriakkiyata@gmail.com',NULL,20,'2025-11-05 03:07:29'),(14,'Tarun Ragunath','tarun.ragunath@gmail.com','9876543210',119,'2025-11-05 05:51:15'),(15,'Ur mum','ur.mom@gmail.com',NULL,29,'2025-11-06 12:08:39'),(16,'Yass','yaas@example.com',NULL,119,'2025-11-08 18:43:06'),(17,'Tarun','tarun@gmail.com',NULL,20,'2025-11-10 04:51:35');
/*!40000 ALTER TABLE `passenger` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `passengerbookinghistory`
--

DROP TABLE IF EXISTS `passengerbookinghistory`;
/*!50001 DROP VIEW IF EXISTS `passengerbookinghistory`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `passengerbookinghistory` AS SELECT 
 1 AS `passenger_id`,
 1 AS `name`,
 1 AS `email`,
 1 AS `total_bookings`,
 1 AS `total_spent`,
 1 AS `last_booking_date`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `purchase`
--

DROP TABLE IF EXISTS `purchase`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase` (
  `purchase_id` int NOT NULL AUTO_INCREMENT,
  `order_number` varchar(15) NOT NULL,
  `supplier_id` varchar(10) NOT NULL,
  `flight_number` varchar(10) NOT NULL,
  `purchase_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`purchase_id`),
  UNIQUE KEY `unique_purchase` (`order_number`,`supplier_id`),
  KEY `idx_purchase_supplier` (`supplier_id`),
  KEY `idx_purchase_flight` (`flight_number`),
  CONSTRAINT `purchase_ibfk_1` FOREIGN KEY (`order_number`) REFERENCES `ticket` (`order_number`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `purchase_ibfk_2` FOREIGN KEY (`supplier_id`) REFERENCES `supplier` (`supplier_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `purchase_ibfk_3` FOREIGN KEY (`flight_number`) REFERENCES `flight` (`flight_number`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase`
--

LOCK TABLES `purchase` WRITE;
/*!40000 ALTER TABLE `purchase` DISABLE KEYS */;
INSERT INTO `purchase` VALUES (1,'TKT001','BA001','AI101','2025-10-10 03:58:04'),(2,'TKT002','BA002','6E202','2025-10-10 03:58:04'),(3,'TKT003','BA001','SG303','2025-10-10 03:58:04'),(4,'TKT004','BA003','AI104','2025-10-10 03:58:04'),(5,'TKT005','BA002','UK505','2025-10-10 03:58:04'),(6,'TKT006','BA001','AI201','2025-10-10 03:58:04'),(7,'TKT007','BA003','6E301','2025-10-10 03:58:04'),(8,'TKT008','BA002','SG401','2025-10-10 03:58:04');
/*!40000 ALTER TABLE `purchase` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `store`
--

DROP TABLE IF EXISTS `store`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store` (
  `store_id` varchar(10) NOT NULL,
  `name` varchar(100) NOT NULL,
  `place` varchar(50) NOT NULL,
  `store_type` varchar(50) NOT NULL,
  `product_type` varchar(50) DEFAULT NULL,
  `airport_id` varchar(10) NOT NULL,
  `status` varchar(20) DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`store_id`),
  KEY `idx_store_airport` (`airport_id`),
  KEY `idx_store_type` (`store_type`),
  CONSTRAINT `store_ibfk_1` FOREIGN KEY (`airport_id`) REFERENCES `airport` (`airport_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `valid_store_status` CHECK ((`status` in (_utf8mb4'active',_utf8mb4'inactive',_utf8mb4'maintenance'))),
  CONSTRAINT `valid_store_type` CHECK ((`store_type` in (_utf8mb4'retail',_utf8mb4'food',_utf8mb4'service',_utf8mb4'duty-free',_utf8mb4'other')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `store`
--

LOCK TABLES `store` WRITE;
/*!40000 ALTER TABLE `store` DISABLE KEYS */;
INSERT INTO `store` VALUES ('ST001','Cafe Coffee Day','Terminal 1','food','beverages','BLR','active','2025-10-10 03:58:04','2025-10-10 03:58:04'),('ST002','Duty Free Shop','Terminal 2','duty-free','luxury','BLR','active','2025-10-10 03:58:04','2025-10-10 03:58:04'),('ST003','Book Store','Terminal 1','retail','books','DEL','active','2025-10-10 03:58:04','2025-10-10 03:58:04'),('ST004','Food Court','Terminal 3','food','multi-cuisine','BOM','active','2025-10-10 03:58:04','2025-10-10 03:58:04'),('ST005','Gift Shop','Terminal 1','retail','souvenirs','MAA','active','2025-10-10 03:58:04','2025-10-10 03:58:04'),('ST006','Electronics Store','Terminal 2','retail','electronics','HYD','active','2025-10-10 03:58:04','2025-10-10 03:58:04'),('ST007','Restaurant','Terminal 1','food','dining','CCU','active','2025-10-10 03:58:04','2025-10-10 03:58:04'),('ST008','Souvenir Shop','Terminal 1','retail','gifts','GOI','active','2025-10-10 03:58:04','2025-10-10 03:58:04'),('ST009','Coffee Shop','Terminal 1','food','beverages','COK','active','2025-10-10 03:58:04','2025-10-10 03:58:04'),('ST010','Fashion Store','Terminal 2','duty-free','fashion','BLR','active','2025-10-10 03:58:04','2025-10-10 03:58:04'),('ST011','Mcdonalds','Terminal 1','food','Food','MAA','active','2025-11-08 06:44:45','2025-11-08 06:44:45'),('ST012','Cafe Delight','Terminal 1','food','beverages','BLR','active','2025-11-09 04:30:30','2025-11-09 04:30:30'),('ST013','QuickBite Snacks','Terminal 2','food','snacks','DEL','active','2025-11-09 04:30:30','2025-11-09 04:30:30'),('ST014','Bombay Treats','Terminal 3','food','multi-cuisine','BOM','active','2025-11-09 04:30:30','2025-11-09 04:30:30'),('ST015','Madras Coffee','Terminal 1','food','coffee','MAA','active','2025-11-09 04:30:30','2025-11-09 04:30:30'),('ST016','Goa Delights','Terminal 1','retail','souvenirs','GOI','active','2025-11-09 04:30:30','2025-11-09 04:30:30'),('ST017','BLR Duty-Free Plus','Terminal 2','duty-free','luxury','BLR','active','2025-11-09 04:30:30','2025-11-09 04:30:30'),('ST018','Hyderabad Bazaar','Terminal 1','retail','local goods','HYD','active','2025-11-09 04:30:30','2025-11-09 04:30:30'),('ST019','KFC','Terminal 2','food','Fast food','GOI','active','2025-11-10 04:55:22','2025-11-10 04:55:22');
/*!40000 ALTER TABLE `store` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `storeemployeecount`
--

DROP TABLE IF EXISTS `storeemployeecount`;
/*!50001 DROP VIEW IF EXISTS `storeemployeecount`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `storeemployeecount` AS SELECT 
 1 AS `store_id`,
 1 AS `store_name`,
 1 AS `store_type`,
 1 AS `airport_name`,
 1 AS `employee_count`,
 1 AS `total_payroll`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `storerevenue`
--

DROP TABLE IF EXISTS `storerevenue`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `storerevenue` (
  `revenue_id` int NOT NULL AUTO_INCREMENT,
  `store_id` varchar(10) NOT NULL,
  `revenue` decimal(12,2) NOT NULL,
  `worker_revenue` decimal(12,2) DEFAULT '0.00',
  `profit_loss` decimal(12,2) DEFAULT '0.00',
  `notes` text,
  `revenue_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`revenue_id`),
  KEY `store_id` (`store_id`),
  CONSTRAINT `storerevenue_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `store` (`store_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=82 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `storerevenue`
--

LOCK TABLES `storerevenue` WRITE;
/*!40000 ALTER TABLE `storerevenue` DISABLE KEYS */;
INSERT INTO `storerevenue` VALUES (1,'ST001',45000.00,22000.00,8000.00,'High footfall - morning rush','2025-11-07','2025-11-08 04:52:30'),(2,'ST001',42000.00,20000.00,7500.00,'Normal business day','2025-11-06','2025-11-08 04:52:30'),(3,'ST001',38000.00,18000.00,6000.00,'Slow afternoon','2025-11-05','2025-11-08 04:52:30'),(4,'ST001',52000.00,25000.00,10000.00,'Weekend - excellent sales','2025-11-04','2025-11-08 04:52:30'),(5,'ST001',48000.00,23000.00,9000.00,'Corporate orders received','2025-11-03','2025-11-08 04:52:30'),(6,'ST001',41000.00,19500.00,7000.00,'Average day','2025-11-02','2025-11-08 04:52:30'),(7,'ST001',39000.00,18500.00,6500.00,'Equipment maintenance - slower service','2025-11-01','2025-11-08 04:52:30'),(8,'ST002',125000.00,60000.00,35000.00,'International flight peak - great sales','2025-11-07','2025-11-08 04:52:30'),(9,'ST002',98000.00,45000.00,25000.00,'Normal duty-free sales','2025-11-06','2025-11-08 04:52:30'),(10,'ST002',110000.00,52000.00,30000.00,'High-value purchases','2025-11-05','2025-11-08 04:52:30'),(11,'ST002',135000.00,65000.00,40000.00,'Premium liquor & cosmetics sold','2025-11-04','2025-11-08 04:52:30'),(12,'ST002',92000.00,43000.00,22000.00,'Slower international schedule','2025-11-03','2025-11-08 04:52:30'),(13,'ST002',115000.00,55000.00,32000.00,'Tourist group purchases','2025-11-02','2025-11-08 04:52:30'),(14,'ST002',105000.00,50000.00,28000.00,'Steady business','2025-11-01','2025-11-08 04:52:30'),(15,'ST003',32000.00,15000.00,5000.00,'Magazine and bestseller sales','2025-11-07','2025-11-08 04:52:30'),(16,'ST003',28000.00,13000.00,4200.00,'Regular day','2025-11-06','2025-11-08 04:52:30'),(17,'ST003',35000.00,16500.00,6000.00,'Travel guide section popular','2025-11-05','2025-11-08 04:52:30'),(18,'ST003',30000.00,14000.00,4800.00,'Newspaper sales high','2025-11-04','2025-11-08 04:52:30'),(19,'ST003',26000.00,12000.00,3500.00,'Slower foot traffic','2025-11-03','2025-11-08 04:52:30'),(20,'ST003',38000.00,18000.00,7000.00,'Stationery rush - back to school','2025-11-02','2025-11-08 04:52:30'),(21,'ST003',31000.00,14500.00,5200.00,'Average sales','2025-11-01','2025-11-08 04:52:30'),(22,'ST004',85000.00,40000.00,18000.00,'Lunch and dinner rush','2025-11-07','2025-11-08 04:52:30'),(23,'ST004',78000.00,37000.00,16000.00,'High volume orders','2025-11-06','2025-11-08 04:52:30'),(24,'ST004',92000.00,43000.00,20000.00,'Weekend family crowds','2025-11-05','2025-11-08 04:52:30'),(25,'ST004',82000.00,38500.00,17000.00,'Consistent sales','2025-11-04','2025-11-08 04:52:30'),(26,'ST004',75000.00,35000.00,14500.00,'Delayed flights - lower traffic','2025-11-03','2025-11-08 04:52:30'),(27,'ST004',88000.00,41000.00,19000.00,'Corporate lunch orders','2025-11-02','2025-11-08 04:52:30'),(28,'ST004',80000.00,37500.00,16500.00,'Normal operations','2025-11-01','2025-11-08 04:52:30'),(29,'ST005',42000.00,20000.00,8500.00,'Souvenir sales peak','2025-11-07','2025-11-08 04:52:30'),(30,'ST005',38000.00,18000.00,7200.00,'Tourist groups buying gifts','2025-11-06','2025-11-08 04:52:30'),(31,'ST005',45000.00,21500.00,9500.00,'Festival season - gift sets','2025-11-05','2025-11-08 04:52:30'),(32,'ST005',40000.00,19000.00,8000.00,'Regular sales','2025-11-04','2025-11-08 04:52:30'),(33,'ST005',35000.00,16500.00,6500.00,'Slower day','2025-11-03','2025-11-08 04:52:30'),(34,'ST005',48000.00,23000.00,10000.00,'International departures high','2025-11-02','2025-11-08 04:52:30'),(35,'ST005',41000.00,19500.00,8200.00,'Average business','2025-11-01','2025-11-08 04:52:30'),(36,'ST006',95000.00,45000.00,22000.00,'Headphones and adapters popular','2025-11-07','2025-11-08 04:52:30'),(37,'ST006',88000.00,42000.00,20000.00,'Travel accessories sold well','2025-11-06','2025-11-08 04:52:30'),(38,'ST006',102000.00,48500.00,25000.00,'High-value laptop sales','2025-11-05','2025-11-08 04:52:30'),(39,'ST006',92000.00,44000.00,21000.00,'Charger and cable sales','2025-11-04','2025-11-08 04:52:30'),(40,'ST006',85000.00,40000.00,18500.00,'Normal operations','2025-11-03','2025-11-08 04:52:30'),(41,'ST006',98000.00,46500.00,23500.00,'Camera equipment sold','2025-11-02','2025-11-08 04:52:30'),(42,'ST006',90000.00,43000.00,20500.00,'Steady business','2025-11-01','2025-11-08 04:52:30'),(43,'ST007',72000.00,34000.00,15000.00,'Full house during dinner','2025-11-07','2025-11-08 04:52:30'),(44,'ST007',68000.00,32000.00,14000.00,'Breakfast rush','2025-11-06','2025-11-08 04:52:30'),(45,'ST007',78000.00,37000.00,17000.00,'High-value orders','2025-11-05','2025-11-08 04:52:30'),(46,'ST007',70000.00,33000.00,14500.00,'Regular day','2025-11-04','2025-11-08 04:52:30'),(47,'ST007',65000.00,30500.00,13000.00,'Slower afternoon','2025-11-03','2025-11-08 04:52:30'),(48,'ST007',75000.00,35500.00,16000.00,'Weekend dinner crowd','2025-11-02','2025-11-08 04:52:30'),(49,'ST007',71000.00,33500.00,14800.00,'Average sales','2025-11-01','2025-11-08 04:52:30'),(50,'ST008',55000.00,26000.00,12000.00,'Tourist shopping - resort wear','2025-11-07','2025-11-08 04:52:30'),(51,'ST008',48000.00,23000.00,10000.00,'Accessories popular','2025-11-06','2025-11-08 04:52:30'),(52,'ST008',62000.00,29500.00,14500.00,'Beach wear sales peak','2025-11-05','2025-11-08 04:52:30'),(53,'ST008',52000.00,24500.00,11000.00,'Regular sales','2025-11-04','2025-11-08 04:52:30'),(54,'ST008',45000.00,21000.00,9000.00,'Slower day','2025-11-03','2025-11-08 04:52:30'),(55,'ST008',58000.00,27500.00,13000.00,'Weekend travelers','2025-11-02','2025-11-08 04:52:30'),(56,'ST008',51000.00,24000.00,10800.00,'Average business','2025-11-01','2025-11-08 04:52:30'),(57,'ST009',38000.00,18000.00,7000.00,'Coffee sales high','2025-11-07','2025-11-08 04:52:30'),(58,'ST009',35000.00,16500.00,6200.00,'Normal day','2025-11-06','2025-11-08 04:52:30'),(59,'ST009',42000.00,20000.00,8500.00,'Pastry sales peak','2025-11-05','2025-11-08 04:52:30'),(60,'ST009',37000.00,17500.00,6800.00,'Regular operations','2025-11-04','2025-11-08 04:52:30'),(61,'ST009',33000.00,15500.00,5500.00,'Slower traffic','2025-11-03','2025-11-08 04:52:30'),(62,'ST009',40000.00,19000.00,7800.00,'Early morning rush','2025-11-02','2025-11-08 04:52:30'),(63,'ST009',36000.00,17000.00,6500.00,'Average sales','2025-11-01','2025-11-08 04:52:30'),(64,'ST010',48000.00,23000.00,9500.00,'Snacks and drinks sold well','2025-11-07','2025-11-08 04:52:30'),(65,'ST010',44000.00,21000.00,8500.00,'Regular day','2025-11-06','2025-11-08 04:52:30'),(66,'ST010',52000.00,25000.00,11000.00,'High foot traffic','2025-11-05','2025-11-08 04:52:30'),(67,'ST010',46000.00,22000.00,9000.00,'Normal operations','2025-11-04','2025-11-08 04:52:30'),(68,'ST010',42000.00,20000.00,7800.00,'Slower day','2025-11-03','2025-11-08 04:52:30'),(69,'ST010',50000.00,24000.00,10500.00,'Weekend sales','2025-11-02','2025-11-08 04:52:30'),(70,'ST010',45000.00,21500.00,8800.00,'Average business','2025-11-01','2025-11-08 04:52:30'),(71,'ST001',43000.00,20500.00,7500.00,'Normal week operations','2025-10-25','2025-11-08 04:52:30'),(72,'ST001',46000.00,22000.00,8500.00,'Good week','2025-10-18','2025-11-08 04:52:30'),(73,'ST002',112000.00,53000.00,31000.00,'Strong international sales','2025-10-25','2025-11-08 04:52:30'),(74,'ST002',108000.00,51000.00,29000.00,'Consistent business','2025-10-18','2025-11-08 04:52:30'),(75,'ST003',33000.00,15500.00,5500.00,'Regular operations','2025-10-25','2025-11-08 04:52:30'),(76,'ST003',31000.00,14500.00,5000.00,'Normal week','2025-10-18','2025-11-08 04:52:30'),(77,'ST004',83000.00,39000.00,17500.00,'Busy food week','2025-10-25','2025-11-08 04:52:30'),(78,'ST004',81000.00,38000.00,16800.00,'Good operations','2025-10-18','2025-11-08 04:52:30'),(79,'ST005',43000.00,20500.00,8800.00,'Gift sales steady','2025-10-25','2025-11-08 04:52:30'),(80,'ST005',41000.00,19500.00,8200.00,'Normal week','2025-10-18','2025-11-08 04:52:30');
/*!40000 ALTER TABLE `storerevenue` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `storesupply`
--

DROP TABLE IF EXISTS `storesupply`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `storesupply` (
  `supply_id` int NOT NULL AUTO_INCREMENT,
  `store_id` varchar(10) NOT NULL,
  `supplier_id` varchar(10) NOT NULL,
  `product_name` varchar(100) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `supply_date` date DEFAULT (curdate()),
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`supply_id`),
  KEY `idx_supply_store` (`store_id`),
  KEY `idx_supply_supplier` (`supplier_id`),
  CONSTRAINT `storesupply_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `store` (`store_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `storesupply_ibfk_2` FOREIGN KEY (`supplier_id`) REFERENCES `supplier` (`supplier_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `valid_quantity` CHECK ((`quantity` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `storesupply`
--

LOCK TABLES `storesupply` WRITE;
/*!40000 ALTER TABLE `storesupply` DISABLE KEYS */;
INSERT INTO `storesupply` VALUES (1,'ST001','BA001','Coffee Beans',50,'2025-10-01','2025-10-10 03:58:04'),(2,'ST002','BA002','Perfumes',100,'2025-10-02','2025-10-10 03:58:04'),(3,'ST003','BA001','Books',200,'2025-10-03','2025-10-10 03:58:04'),(4,'ST004','BA003','Food Items',500,'2025-10-04','2025-10-10 03:58:04'),(5,'ST005','BA002','Souvenirs',150,'2025-10-05','2025-10-10 03:58:04');
/*!40000 ALTER TABLE `storesupply` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supplier`
--

DROP TABLE IF EXISTS `supplier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier` (
  `supplier_id` varchar(10) NOT NULL,
  `type` varchar(20) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`supplier_id`),
  CONSTRAINT `valid_supplier_type` CHECK ((`type` in (_utf8mb4'flight_company',_utf8mb4'booking_agent')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supplier`
--

LOCK TABLES `supplier` WRITE;
/*!40000 ALTER TABLE `supplier` DISABLE KEYS */;
INSERT INTO `supplier` VALUES ('BA001','booking_agent','2025-10-10 03:58:04'),('BA002','booking_agent','2025-10-10 03:58:04'),('BA003','booking_agent','2025-10-10 03:58:04'),('FC001','flight_company','2025-10-10 03:58:04'),('FC002','flight_company','2025-10-10 03:58:04'),('FC003','flight_company','2025-10-10 03:58:04'),('FC004','flight_company','2025-10-10 03:58:04');
/*!40000 ALTER TABLE `supplier` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket`
--

DROP TABLE IF EXISTS `ticket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket` (
  `order_number` varchar(15) NOT NULL,
  `passenger_id` int DEFAULT NULL,
  `passenger_name` varchar(100) NOT NULL,
  `seat_class` varchar(20) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `flight_number` varchar(10) NOT NULL,
  `flight_company_id` varchar(10) NOT NULL,
  `booking_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `booking_status` varchar(20) DEFAULT 'confirmed',
  `seat_number` varchar(10) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_number`),
  KEY `flight_company_id` (`flight_company_id`),
  KEY `idx_ticket_flight` (`flight_number`),
  KEY `idx_ticket_passenger` (`passenger_id`),
  KEY `idx_ticket_booking_date` (`booking_date`),
  KEY `idx_ticket_status` (`booking_status`),
  CONSTRAINT `ticket_ibfk_1` FOREIGN KEY (`passenger_id`) REFERENCES `passenger` (`passenger_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ticket_ibfk_2` FOREIGN KEY (`flight_number`) REFERENCES `flight` (`flight_number`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `ticket_ibfk_3` FOREIGN KEY (`flight_company_id`) REFERENCES `flightcompany` (`flight_company_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `valid_booking_status` CHECK ((`booking_status` in (_utf8mb4'confirmed',_utf8mb4'cancelled',_utf8mb4'pending',_utf8mb4'completed'))),
  CONSTRAINT `valid_price` CHECK ((`price` > 0)),
  CONSTRAINT `valid_seat_class` CHECK ((`seat_class` in (_utf8mb4'economy',_utf8mb4'business',_utf8mb4'first')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket`
--

LOCK TABLES `ticket` WRITE;
/*!40000 ALTER TABLE `ticket` DISABLE KEYS */;
INSERT INTO `ticket` VALUES ('TKT_PROC1',11,'Ramesh Gupta','business',12500.00,'6E202','FC002','2025-11-04 16:49:43','confirmed','5C','2025-11-04 16:49:43'),('TKT_TEST1',1,'Rajesh Kumar','economy',5500.00,'AI101','FC001','2025-10-25 18:01:45','confirmed','15B','2025-10-25 18:01:45'),('TKT001',1,'Rajesh Kumar','economy',5500.00,'AI101','FC001','2025-10-10 03:58:04','confirmed','12A','2025-10-10 03:58:04'),('TKT002',2,'Priya Sharma','business',15000.00,'6E202','FC002','2025-10-10 03:58:04','confirmed','2B','2025-10-10 03:58:04'),('TKT003',3,'Amit Patel','economy',4500.00,'SG303','FC003','2025-10-10 03:58:04','cancelled','18C','2025-10-10 03:58:04'),('TKT004',4,'Sneha Reddy','economy',3800.00,'AI104','FC001','2025-10-10 03:58:04','cancelled','25D','2025-10-10 03:58:04'),('TKT005',5,'Vikram Singh','first',25000.00,'UK505','FC004','2025-10-10 03:58:04','confirmed','1A','2025-10-10 03:58:04'),('TKT006',6,'Anita Deshmukh','economy',6200.00,'AI201','FC001','2025-10-10 03:58:04','confirmed','15E','2025-10-10 03:58:04'),('TKT007',7,'Rahul Verma','business',12000.00,'6E301','FC002','2025-10-10 03:58:04','confirmed','3F','2025-10-10 03:58:04'),('TKT008',8,'Kavita Iyer','economy',4200.00,'SG401','FC003','2025-10-10 03:58:04','confirmed','20G','2025-10-10 03:58:04'),('TKT009',9,'Sanjay Gupta','economy',7500.00,'AI301','FC001','2025-10-10 03:58:04','confirmed','22H','2025-10-10 03:58:04'),('TKT010',10,'Meera Nair','business',13500.00,'UK601','FC004','2025-10-10 03:58:04','confirmed','4J','2025-10-10 03:58:04'),('TKT011',1,'Rajesh Kumar','economy',5800.00,'AI201','FC001','2025-10-10 03:58:04','confirmed','16K','2025-10-10 03:58:04'),('TKT012',2,'Priya Sharma','economy',4800.00,'SG303','FC003','2025-10-10 03:58:04','pending','19L','2025-10-10 03:58:04'),('TKT2321875362',14,'Tarun Ragunath','first',20000.00,'AI201','FC001','2025-11-05 05:51:15','confirmed','1A','2025-11-05 05:51:15'),('TKT2433709103',15,'Ur mum','business',12500.00,'SG303','FC003','2025-11-06 12:55:09','confirmed','1A','2025-11-06 12:55:09'),('TKT2500224689',12,'sai yatin','business',12500.00,'AI101','FC001','2025-11-07 07:23:44','confirmed','2B','2025-11-07 07:23:44'),('TKT2500323457',12,'sai yatin','business',12500.00,'AI777','FC001','2025-11-07 07:25:23','confirmed','12A','2025-11-07 07:25:23'),('TKT2505623360',12,'sai yatin','business',12500.00,'6E202','FC002','2025-11-07 08:53:43','confirmed','K','2025-11-07 08:53:43'),('TKT2627661114',16,'Yass','first',20000.00,'AI104','FC001','2025-11-08 18:47:41','confirmed','1A','2025-11-08 18:47:41'),('TKT2627737788',16,'Yass','first',20000.00,'AI201','FC001','2025-11-08 18:48:57','confirmed','1F','2025-11-08 18:48:57'),('TKT2750430358',17,'Tarun','business',12500.00,'AI104','FC001','2025-11-10 04:53:50','confirmed','2A','2025-11-10 04:53:50');
/*!40000 ALTER TABLE `ticket` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticketcancellationlog`
--

DROP TABLE IF EXISTS `ticketcancellationlog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticketcancellationlog` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `order_number` varchar(15) DEFAULT NULL,
  `passenger_name` varchar(100) DEFAULT NULL,
  `flight_number` varchar(10) DEFAULT NULL,
  `cancellation_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `original_price` decimal(10,2) DEFAULT NULL,
  `reason` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`log_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticketcancellationlog`
--

LOCK TABLES `ticketcancellationlog` WRITE;
/*!40000 ALTER TABLE `ticketcancellationlog` DISABLE KEYS */;
INSERT INTO `ticketcancellationlog` VALUES (1,'TKT004','Sneha Reddy','AI104','2025-10-25 18:10:57',3800.00,NULL);
/*!40000 ALTER TABLE `ticketcancellationlog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `upcomingflights`
--

DROP TABLE IF EXISTS `upcomingflights`;
/*!50001 DROP VIEW IF EXISTS `upcomingflights`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `upcomingflights` AS SELECT 
 1 AS `flight_number`,
 1 AS `flight_date`,
 1 AS `departure_hour`,
 1 AS `arrival_hour`,
 1 AS `departure_airport_name`,
 1 AS `departure_city`,
 1 AS `arrival_airport_name`,
 1 AS `arrival_city`,
 1 AS `available_seats`,
 1 AS `total_seats`,
 1 AS `status`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `worker`
--

DROP TABLE IF EXISTS `worker`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `worker` (
  `worker_id` varchar(10) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `age` int NOT NULL,
  `job` varchar(50) NOT NULL,
  `payment` decimal(10,2) NOT NULL,
  `store_id` varchar(10) DEFAULT NULL,
  `airport_id` varchar(10) NOT NULL,
  `status` varchar(20) DEFAULT 'active',
  `hire_date` date DEFAULT (curdate()),
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `role` varchar(50) DEFAULT 'Worker',
  PRIMARY KEY (`worker_id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_worker_store` (`store_id`),
  KEY `idx_worker_airport` (`airport_id`),
  KEY `idx_worker_status` (`status`),
  CONSTRAINT `worker_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `store` (`store_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `worker_ibfk_2` FOREIGN KEY (`airport_id`) REFERENCES `airport` (`airport_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `valid_payment` CHECK ((`payment` > 0)),
  CONSTRAINT `valid_worker_age` CHECK (((`age` >= 18) and (`age` <= 70))),
  CONSTRAINT `valid_worker_status` CHECK ((`status` in (_utf8mb4'active',_utf8mb4'inactive',_utf8mb4'on-leave',_utf8mb4'terminated')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `worker`
--

LOCK TABLES `worker` WRITE;
/*!40000 ALTER TABLE `worker` DISABLE KEYS */;
INSERT INTO `worker` VALUES ('W_PROC1','Deepak Sharma','deepak.sharma@airport.com',29,'Security Guard',30000.00,NULL,'DEL','active','2025-10-25','2025-10-25 18:15:50','2025-11-06 13:33:52','AirportStaff'),('W_TEST2','Valid Worker','valid.worker@airport.com',25,'Security',28000.00,'ST001','BLR','active','2025-10-25','2025-10-25 18:07:01','2025-11-06 13:33:52','AirportStaff'),('W001','Ravi Kumar','ravi.kumar@airport.com',28,'Barista',25000.00,'ST001','BLR','active','2025-10-10','2025-10-10 03:58:04','2025-11-06 13:33:52','Worker'),('W002','Anita Desai','anita.desai@airport.com',32,'Store Manager',45000.00,'ST002','BLR','active','2025-10-10','2025-10-10 03:58:04','2025-11-06 13:33:52','Manager'),('W003','Suresh Menon','suresh.menon@airport.com',25,'Sales Associate',22000.00,'ST003','DEL','active','2025-10-10','2025-10-10 03:58:04','2025-11-06 13:33:52','Worker'),('W004','Lakshmi Iyer','lakshmi.iyer@airport.com',30,'Chef',35000.00,'ST004','BOM','active','2025-10-10','2025-10-10 03:58:04','2025-11-06 13:33:52','Worker'),('W005','Karthik Reddy','karthik.reddy@airport.com',27,'Cashier',23000.00,'ST005','MAA','active','2025-10-10','2025-10-10 03:58:04','2025-11-06 13:33:52','Worker'),('W006','Deepak Shah','deepak.shah@airport.com',35,'Technician',40000.00,'ST006','HYD','active','2025-10-10','2025-10-10 03:58:04','2025-11-06 13:33:52','AirportStaff'),('W007','Pooja Nair','pooja.nair@airport.com',29,'Waitress',28000.00,'ST007','CCU','active','2025-10-10','2025-10-10 03:58:04','2025-11-06 13:33:52','Worker'),('W008','Arun Kumar','arun.kumar@airport.com',26,'Sales Associate',21000.00,'ST008','GOI','active','2025-10-10','2025-10-10 03:58:04','2025-11-06 13:33:52','Worker'),('W009','Divya Singh','divya.singh@airport.com',24,'Barista',24000.00,'ST009','COK','active','2025-10-10','2025-10-10 03:58:04','2025-11-06 13:33:52','Worker'),('W010','Mohit Sharma','mohit.sharma@airport.com',31,'Store Manager',42000.00,'ST010','BLR','active','2025-10-10','2025-10-10 03:58:04','2025-11-06 13:33:52','Manager'),('W011','Neha Gupta','neha.gupta@airport.com',28,'Supervisor',32000.00,NULL,'BLR','active','2025-10-10','2025-10-10 03:58:04','2025-11-06 13:33:52','Manager'),('W012','Arjun Rao','arjun.rao@airport.com',33,'Security Officer',30000.00,NULL,'DEL','active','2025-10-10','2025-10-10 03:58:04','2025-11-06 13:33:52','AirportStaff'),('W013','Rohan Patel','rohan.patel@airport.com',38,'System Administrator',60000000.00,NULL,'DEL','active','2024-08-15','2025-11-06 13:38:11','2025-11-08 18:52:20','Admin'),('W014','Priya Sharma','priya.sharma@airport.com',41,'Operations Head',58000.00,NULL,'BLR','active','2024-06-20','2025-11-06 13:38:11','2025-11-06 13:38:11','Admin'),('W015','Amit Verma','amit.verma@airport.com',35,'Store Manager',45000.00,NULL,'HYD','active','2024-09-01','2025-11-06 13:38:11','2025-11-06 13:38:11','Manager'),('W016','Sneha Iyer','sneha.iyer@airport.com',33,'Shift Supervisor',42000.00,NULL,'MAA','active','2024-11-01','2025-11-06 13:38:11','2025-11-06 13:38:11','Manager'),('W017','Rajesh Khanna','rajesh.khanna@airport.com',37,'Operations Manager',47000.00,NULL,'DEL','active','2025-01-10','2025-11-06 13:38:11','2025-11-06 13:38:11','Manager'),('W018','Vikram Mehta','vikram.mehta@airport.com',45,'Duty-Free Owner',70000.00,'ST017','BLR','active','2023-12-15','2025-11-06 13:38:11','2025-11-09 04:30:46','StoreOwner'),('W019','Anjali Rao','anjali.rao@airport.com',40,'Franchise Owner',68000.00,'ST018','HYD','active','2024-02-18','2025-11-06 13:38:11','2025-11-09 04:30:46','StoreOwner'),('W020','Sahil Kapoor','sahil.kapoor@airport.com',27,'Barista',25000.00,'ST012','BLR','active','2025-03-12','2025-11-06 13:38:11','2025-11-09 04:30:46','Worker'),('W021','Nikita Jain','nikita.jain@airport.com',25,'Cashier',23000.00,'ST013','DEL','active','2025-04-22','2025-11-06 13:38:11','2025-11-09 04:30:46','Worker'),('W022','Aarav Singh','aarav.singh@airport.com',29,'Chef',30000.00,'ST014','BOM','active','2025-05-10','2025-11-06 13:38:11','2025-11-09 04:30:46','Worker'),('W023','Isha Menon','isha.menon@airport.com',26,'Sales Associate',22000.00,'ST015','MAA','active','2025-06-01','2025-11-06 13:38:11','2025-11-09 04:30:46','Worker'),('W024','Kunal Desai','kunal.desai@airport.com',30,'Waiter',21000.00,'ST016','GOI','active','2025-07-20','2025-11-06 13:38:11','2025-11-09 04:30:46','Worker'),('W025','Tanya Nair','tanya.nair@airport.com',28,'Security Officer',32000.00,NULL,'BLR','active','2025-01-15','2025-11-06 13:38:11','2025-11-06 13:38:11','AirportStaff'),('W026','Naveen Rao','naveen.rao@airport.com',31,'Technician',35000.00,NULL,'HYD','active','2025-02-05','2025-11-06 13:38:11','2025-11-06 13:38:11','AirportStaff'),('W027','Harish Pillai','harish.pillai@airport.com',36,'Cleaner',20000.00,NULL,'DEL','active','2025-03-30','2025-11-06 13:38:11','2025-11-06 13:38:11','AirportStaff'),('W028','Reena Das','reena.das@airport.com',32,'Ground Staff',25000.00,NULL,'COK','active','2025-04-12','2025-11-06 13:38:11','2025-11-06 13:38:11','AirportStaff'),('W029','TVNS Yatin',NULL,20,'Billing dept',30000.00,'ST011','MAA','active','2025-11-08','2025-11-08 06:46:04','2025-11-08 06:46:04','Worker');
/*!40000 ALTER TABLE `worker` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workerdailyrevenue`
--

DROP TABLE IF EXISTS `workerdailyrevenue`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workerdailyrevenue` (
  `id` int NOT NULL AUTO_INCREMENT,
  `worker_id` varchar(50) NOT NULL,
  `store_id` varchar(50) NOT NULL,
  `revenue` decimal(10,2) NOT NULL,
  `revenue_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_worker_date` (`worker_id`,`revenue_date`),
  KEY `store_id` (`store_id`),
  CONSTRAINT `workerdailyrevenue_ibfk_1` FOREIGN KEY (`worker_id`) REFERENCES `worker` (`worker_id`) ON DELETE CASCADE,
  CONSTRAINT `workerdailyrevenue_ibfk_2` FOREIGN KEY (`store_id`) REFERENCES `store` (`store_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workerdailyrevenue`
--

LOCK TABLES `workerdailyrevenue` WRITE;
/*!40000 ALTER TABLE `workerdailyrevenue` DISABLE KEYS */;
/*!40000 ALTER TABLE `workerdailyrevenue` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `airportstatistics`
--

/*!50001 DROP VIEW IF EXISTS `airportstatistics`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `airportstatistics` AS select `a`.`airport_id` AS `airport_id`,`a`.`name` AS `airport_name`,`a`.`city` AS `city`,count(distinct `s`.`store_id`) AS `total_stores`,count(distinct `w`.`worker_id`) AS `total_workers`,count(distinct (case when (`f`.`departure_airport` = `a`.`airport_id`) then `f`.`flight_number` end)) AS `departing_flights`,count(distinct (case when (`f`.`arrival_airport` = `a`.`airport_id`) then `f`.`flight_number` end)) AS `arriving_flights` from (((`airport` `a` left join `store` `s` on((`a`.`airport_id` = `s`.`airport_id`))) left join `worker` `w` on(((`a`.`airport_id` = `w`.`airport_id`) and (`w`.`status` = 'active')))) left join `flight` `f` on((`a`.`airport_id` in (`f`.`departure_airport`,`f`.`arrival_airport`)))) group by `a`.`airport_id`,`a`.`name`,`a`.`city` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `flightrevenue`
--

/*!50001 DROP VIEW IF EXISTS `flightrevenue`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `flightrevenue` AS select `f`.`flight_number` AS `flight_number`,`f`.`flight_date` AS `flight_date`,`fc`.`flight_company_name` AS `flight_company_name`,count(`t`.`order_number`) AS `tickets_sold`,coalesce(sum(`t`.`price`),0) AS `total_revenue`,coalesce(avg(`t`.`price`),0) AS `avg_ticket_price`,`f`.`total_seats` AS `total_seats`,`f`.`available_seats` AS `available_seats`,(`f`.`total_seats` - `f`.`available_seats`) AS `seats_booked` from ((`flight` `f` left join `ticket` `t` on(((`f`.`flight_number` = `t`.`flight_number`) and (`t`.`booking_status` = 'confirmed')))) left join `flightcompany` `fc` on((`t`.`flight_company_id` = `fc`.`flight_company_id`))) group by `f`.`flight_number`,`f`.`flight_date`,`fc`.`flight_company_name`,`f`.`total_seats`,`f`.`available_seats` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `passengerbookinghistory`
--

/*!50001 DROP VIEW IF EXISTS `passengerbookinghistory`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `passengerbookinghistory` AS select `p`.`passenger_id` AS `passenger_id`,`p`.`name` AS `name`,`p`.`email` AS `email`,count(`t`.`order_number`) AS `total_bookings`,coalesce(sum(`t`.`price`),0) AS `total_spent`,max(`t`.`booking_date`) AS `last_booking_date` from (`passenger` `p` left join `ticket` `t` on((`p`.`passenger_id` = `t`.`passenger_id`))) group by `p`.`passenger_id`,`p`.`name`,`p`.`email` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `storeemployeecount`
--

/*!50001 DROP VIEW IF EXISTS `storeemployeecount`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `storeemployeecount` AS select `s`.`store_id` AS `store_id`,`s`.`name` AS `store_name`,`s`.`store_type` AS `store_type`,`a`.`name` AS `airport_name`,count(`w`.`worker_id`) AS `employee_count`,coalesce(sum(`w`.`payment`),0) AS `total_payroll` from ((`store` `s` left join `worker` `w` on(((`s`.`store_id` = `w`.`store_id`) and (`w`.`status` = 'active')))) join `airport` `a` on((`s`.`airport_id` = `a`.`airport_id`))) group by `s`.`store_id`,`s`.`name`,`s`.`store_type`,`a`.`name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `upcomingflights`
--

/*!50001 DROP VIEW IF EXISTS `upcomingflights`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `upcomingflights` AS select `f`.`flight_number` AS `flight_number`,`f`.`flight_date` AS `flight_date`,`f`.`departure_hour` AS `departure_hour`,`f`.`arrival_hour` AS `arrival_hour`,`a1`.`name` AS `departure_airport_name`,`a1`.`city` AS `departure_city`,`a2`.`name` AS `arrival_airport_name`,`a2`.`city` AS `arrival_city`,`f`.`available_seats` AS `available_seats`,`f`.`total_seats` AS `total_seats`,`f`.`status` AS `status` from ((`flight` `f` join `airport` `a1` on((`f`.`departure_airport` = `a1`.`airport_id`))) join `airport` `a2` on((`f`.`arrival_airport` = `a2`.`airport_id`))) where ((`f`.`flight_date` >= curdate()) and (`f`.`status` <> 'cancelled')) order by `f`.`flight_date`,`f`.`departure_hour` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-10 10:34:10
