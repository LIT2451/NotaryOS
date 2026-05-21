-- MySQL dump 10.13  Distrib 9.6.0, for macos26.2 (arm64)
--
-- Host: localhost    Database: NOTARYOS_DB
-- ------------------------------------------------------
-- Server version	9.6.0

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
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '8c6b2b46-21c3-11f1-845b-b7af4756d839:1-35804';

--
-- Current Database: `NOTARYOS_DB`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `NOTARYOS_DB` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `NOTARYOS_DB`;

--
-- Table structure for table `__EFMigrationsHistory`
--

DROP TABLE IF EXISTS `__EFMigrationsHistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `__EFMigrationsHistory` (
  `MigrationId` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ProductVersion` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`MigrationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `__EFMigrationsHistory`
--

LOCK TABLES `__EFMigrationsHistory` WRITE;
/*!40000 ALTER TABLE `__EFMigrationsHistory` DISABLE KEYS */;
INSERT INTO `__EFMigrationsHistory` VALUES ('20260428012920_AddBankInfoToInvoice','8.0.2'),('20260428013825_AddRbac','8.0.2');
/*!40000 ALTER TABLE `__EFMigrationsHistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `AuditLogs`
--

DROP TABLE IF EXISTS `AuditLogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `AuditLogs` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `UserId` int DEFAULT NULL,
  `Action` varchar(100) NOT NULL,
  `EntityType` varchar(50) DEFAULT NULL,
  `EntityId` int DEFAULT NULL,
  `OldValues` text,
  `NewValues` text,
  `Timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  KEY `UserId` (`UserId`),
  CONSTRAINT `auditlogs_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AuditLogs`
--

LOCK TABLES `AuditLogs` WRITE;
/*!40000 ALTER TABLE `AuditLogs` DISABLE KEYS */;
INSERT INTO `AuditLogs` VALUES (1,4,'Created','Invoice',125,NULL,'{\"Id\":125,\"InvoiceNumber\":\"LOGTEST001\",\"ClientName\":\"Log Test\",\"ClientIdNumber\":null,\"ClientEmail\":null,\"Amount\":100000,\"ServiceTypeId\":1,\"ServiceType\":null,\"NotaryDate\":\"2026-04-28T01:34:01.635658+07:00\",\"CreatedBy\":4,\"User\":null,\"CreatedAt\":\"2026-04-28T01:34:01.635675+07:00\",\"UpdatedAt\":\"2026-04-28T01:34:01.635683+07:00\"}','2026-04-28 01:34:02'),(2,4,'ResetPassword','User',4,NULL,NULL,'2026-04-28 01:46:28'),(3,4,'ResetPassword','User',2,NULL,NULL,'2026-04-28 01:46:37'),(4,4,'Created','Role',3,NULL,'{\"RoleName\":\"Qu\\u1EA3n l\\u00FD\",\"Permissions\":[\"Invoices.Create\",\"Invoices.Export\",\"Stats.View\",\"Roles.Manage\",\"Users.Manage\"]}','2026-04-28 09:30:31'),(5,4,'Updated','User',3,'{\"FullName\":\"D\\u01B0\\u01A1ng Lu\\u1EADn\",\"RoleId\":2}','{\"Id\":3,\"Username\":\"duongluan\",\"PasswordHash\":\"$2a$11$iDOd4mxIYlEQMszduPwIEOYMXe/4NfU9xs9tnv5QBRsahWksTn4vy\",\"FullName\":\"D\\u01B0\\u01A1ng Lu\\u1EADn\",\"RoleId\":3,\"Role\":null,\"CreatedAt\":\"2026-04-25T21:00:57\",\"Invoices\":[]}','2026-04-28 09:30:43'),(6,4,'Updated','User',3,'{\"FullName\":\"D\\u01B0\\u01A1ng Lu\\u1EADn\",\"RoleId\":3}','{\"Id\":3,\"Username\":\"duongluan\",\"PasswordHash\":\"$2a$11$iDOd4mxIYlEQMszduPwIEOYMXe/4NfU9xs9tnv5QBRsahWksTn4vy\",\"FullName\":\"D\\u01B0\\u01A1ng Lu\\u1EADn\",\"RoleId\":2,\"Role\":null,\"CreatedAt\":\"2026-04-25T21:00:57\",\"Invoices\":[]}','2026-04-28 09:39:48'),(7,4,'Updated','User',3,'{\"FullName\":\"D\\u01B0\\u01A1ng Lu\\u1EADn\",\"RoleId\":2}','{\"Id\":3,\"Username\":\"duongluan\",\"PasswordHash\":\"$2a$11$iDOd4mxIYlEQMszduPwIEOYMXe/4NfU9xs9tnv5QBRsahWksTn4vy\",\"FullName\":\"D\\u01B0\\u01A1ng Lu\\u1EADn\",\"RoleId\":3,\"Role\":null,\"CreatedAt\":\"2026-04-25T21:00:57\",\"Invoices\":[]}','2026-04-28 09:42:21'),(8,4,'Updated','User',3,'{\"FullName\":\"D\\u01B0\\u01A1ng Lu\\u1EADn\",\"RoleId\":3}','{\"Id\":3,\"Username\":\"duongluan\",\"PasswordHash\":\"$2a$11$iDOd4mxIYlEQMszduPwIEOYMXe/4NfU9xs9tnv5QBRsahWksTn4vy\",\"FullName\":\"D\\u01B0\\u01A1ng Lu\\u1EADn\",\"RoleId\":2,\"Role\":null,\"CreatedAt\":\"2026-04-25T21:00:57\",\"Invoices\":[]}','2026-04-28 10:10:39'),(9,4,'Deleted','Role',3,'{\"Id\":3,\"RoleName\":\"Qu\\u1EA3n l\\u00FD\",\"Users\":[],\"RolePermissions\":[]}',NULL,'2026-04-28 10:11:04'),(10,4,'Created','Role',4,NULL,'{\"RoleName\":\"Qu\\u1EA3n L\\u00FD\",\"Permissions\":[\"Invoices.Create\",\"Roles.Manage\"]}','2026-04-28 10:11:20'),(11,4,'Updated','User',3,'{\"FullName\":\"D\\u01B0\\u01A1ng Lu\\u1EADn\",\"RoleId\":2}','{\"Id\":3,\"Username\":\"duongluan\",\"PasswordHash\":\"$2a$11$iDOd4mxIYlEQMszduPwIEOYMXe/4NfU9xs9tnv5QBRsahWksTn4vy\",\"FullName\":\"D\\u01B0\\u01A1ng Lu\\u1EADn\",\"RoleId\":4,\"Role\":null,\"CreatedAt\":\"2026-04-25T21:00:57\",\"Invoices\":[]}','2026-04-28 10:12:24'),(12,4,'Updated','User',3,'{\"FullName\":\"D\\u01B0\\u01A1ng Lu\\u1EADn\",\"RoleId\":4}','{\"FullName\":\"D\\u01B0\\u01A1ng Lu\\u1EADn\",\"RoleId\":2}','2026-04-28 10:16:05'),(13,4,'Updated','User',3,'{\"FullName\":\"D\\u01B0\\u01A1ng Lu\\u1EADn\",\"RoleId\":2}','{\"FullName\":\"D\\u01B0\\u01A1ng Lu\\u1EADn\",\"RoleId\":4}','2026-04-28 10:17:15'),(14,4,'Updated','Role',4,'{\"RoleName\":\"Qu\\u1EA3n L\\u00FD\",\"Permissions\":[\"Invoices.Create\",\"Roles.Manage\"]}','{\"RoleName\":\"Qu\\u1EA3n L\\u00FD\",\"Permissions\":[\"Invoices.Create\",\"Roles.Manage\",\"Invoices.Delete\",\"Invoices.DeleteAll\",\"Invoices.Edit\",\"Invoices.EditAll\",\"Invoices.Export\",\"Invoices.View\",\"Invoices.ViewAll\"]}','2026-04-28 10:18:44'),(15,4,'Updated','Role',4,'{\"RoleName\":\"Qu\\u1EA3n L\\u00FD\",\"Permissions\":[\"Invoices.Create\",\"Invoices.Delete\",\"Invoices.DeleteAll\",\"Invoices.Edit\",\"Invoices.EditAll\",\"Invoices.Export\",\"Invoices.View\",\"Invoices.ViewAll\",\"Roles.Manage\",\"ServiceTypes.Manage\",\"Stats.View\",\"Users.Manage\"]}','{\"RoleName\":\"Qu\\u1EA3n L\\u00FD\",\"Permissions\":[\"Invoices.Delete\",\"Invoices.Create\",\"Invoices.Edit\",\"Invoices.EditAll\",\"Invoices.Export\",\"Invoices.View\",\"Invoices.ViewAll\",\"Stats.View\",\"Invoices.DeleteAll\"]}','2026-04-28 10:20:53'),(16,4,'Updated','Role',4,'{\"RoleName\":\"Qu\\u1EA3n L\\u00FD\",\"Permissions\":[\"Invoices.Create\",\"Invoices.Delete\",\"Invoices.DeleteAll\",\"Invoices.Edit\",\"Invoices.EditAll\",\"Invoices.Export\",\"Invoices.View\",\"Invoices.ViewAll\",\"Stats.View\"]}','{\"RoleName\":\"Qu\\u1EA3n L\\u00FD\",\"Permissions\":[\"Invoices.Create\",\"Invoices.DeleteAll\",\"Invoices.Edit\",\"Invoices.EditAll\",\"Invoices.Export\",\"Invoices.View\",\"Invoices.ViewAll\",\"Stats.View\",\"Invoices.Delete\",\"ServiceTypes.Manage\"]}','2026-04-28 10:21:33'),(17,4,'Updated','Role',4,'{\"RoleName\":\"Qu\\u1EA3n L\\u00FD\",\"Permissions\":[\"Invoices.Create\",\"Invoices.Delete\",\"Invoices.DeleteAll\",\"Invoices.Edit\",\"Invoices.EditAll\",\"Invoices.Export\",\"Invoices.View\",\"Invoices.ViewAll\",\"ServiceTypes.Manage\",\"Stats.View\"]}','{\"RoleName\":\"Qu\\u1EA3n L\\u00FD\",\"Permissions\":[\"Invoices.Create\",\"Invoices.DeleteAll\",\"Invoices.Edit\",\"Invoices.EditAll\",\"Invoices.Export\",\"Invoices.View\",\"Invoices.ViewAll\",\"Stats.View\",\"Invoices.Delete\"]}','2026-04-28 10:22:29');
/*!40000 ALTER TABLE `AuditLogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Invoices`
--

DROP TABLE IF EXISTS `Invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Invoices` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `InvoiceNumber` varchar(50) NOT NULL,
  `ClientName` varchar(100) DEFAULT NULL,
  `ClientIdNumber` varchar(20) DEFAULT NULL,
  `ClientEmail` varchar(100) DEFAULT NULL,
  `Amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `ServiceTypeId` int DEFAULT NULL,
  `NotaryDate` datetime NOT NULL,
  `CreatedBy` int DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `BankName` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `BankAccount` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `InvoiceNumber` (`InvoiceNumber`),
  KEY `ServiceTypeId` (`ServiceTypeId`),
  KEY `CreatedBy` (`CreatedBy`),
  CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`ServiceTypeId`) REFERENCES `ServiceTypes` (`Id`),
  CONSTRAINT `invoices_ibfk_2` FOREIGN KEY (`CreatedBy`) REFERENCES `Users` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=126 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Invoices`
--

LOCK TABLES `Invoices` WRITE;
/*!40000 ALTER TABLE `Invoices` DISABLE KEYS */;
INSERT INTO `Invoices` VALUES (1,'HD001','Trần Thị B',NULL,NULL,500000.00,1,'2026-04-20 09:00:00',3,'2026-04-25 21:00:05','2026-04-28 01:01:59',NULL,NULL),(2,'HD002','Lê Văn C',NULL,NULL,1200000.00,3,'2026-04-21 14:30:00',3,'2026-04-25 21:00:05','2026-04-28 01:01:59',NULL,NULL),(3,'HD003','Phạm Văn D',NULL,NULL,300000.00,5,'2026-04-22 10:15:00',3,'2026-04-25 21:00:05','2026-04-28 01:01:59',NULL,NULL),(4,'HD1','Nam',NULL,NULL,20000.00,2,'2026-04-25 00:00:00',3,'2026-04-25 21:05:38','2026-04-28 01:01:59',NULL,NULL),(5,'HD004','Nguyễn Thị Hoa','001099001001','hoa.nt@gmail.com',450000.00,1,'2026-03-25 08:30:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(6,'HD005','Trần Văn Bình','001099001002','binh.tv@gmail.com',1500000.00,3,'2026-03-26 10:45:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(7,'HD006','Lê Công Tuấn','001099001003','tuan.lc@gmail.com',250000.00,5,'2026-03-27 15:20:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(8,'HD007','Phạm Minh Đức','001099001004','duc.pm@gmail.com',800000.00,2,'2026-03-28 09:15:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(9,'HD008','Hoàng Bảo Anh','001099001005','anh.hb@gmail.com',1200000.00,1,'2026-03-29 14:00:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(10,'HD009','Vũ Thành Long','001099001006','long.vt@gmail.com',350000.00,4,'2026-03-30 11:30:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(11,'HD010','Đặng Thu Trang','001099001007','trang.dt@gmail.com',600000.00,2,'2026-03-31 16:45:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(12,'HD011','Bùi Xuân Hùng','001099001008','hung.bx@gmail.com',550000.00,3,'2026-04-01 08:20:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(13,'HD012','Ngô Quang Khải','001099001009','khai.nq@gmail.com',2000000.00,1,'2026-04-01 13:10:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(14,'HD013','Đỗ Thùy Linh','001099001010','linh.dt@gmail.com',400000.00,5,'2026-04-02 10:00:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(15,'HD014','Lý Hải Đăng','001099001011','dang.lh@gmail.com',750000.00,4,'2026-04-02 15:50:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(16,'HD015','Dương Quốc Anh','001099001012','anh.dq@gmail.com',950000.00,2,'2026-04-03 09:40:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(17,'HD016','Trịnh Gia Bảo','001099001013','bao.tg@gmail.com',1800000.00,3,'2026-04-03 14:25:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(18,'HD017','Phan Thanh Tùng','001099001014','tung.pt@gmail.com',300000.00,1,'2026-04-04 11:15:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(19,'HD018','Cao Minh Triết','001099001015','triet.cm@gmail.com',500000.00,5,'2026-04-04 16:05:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(20,'HD019','Mai Phương Thảo','001099001016','thao.mp@gmail.com',650000.00,2,'2026-04-05 08:55:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(21,'HD020','Đinh Văn Mạnh','001099001017','manh.dv@gmail.com',1100000.00,3,'2026-04-05 13:40:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(22,'HD021','Kiều Thị Xuân','001099001018','xuan.kt@gmail.com',420000.00,1,'2026-04-06 10:20:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(23,'HD022','Tạ Minh Nhật','001099001019','nhat.tm@gmail.com',850000.00,4,'2026-04-06 15:10:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(24,'HD023','Hồ Vĩnh Khoa','001099001020','khoa.hv@gmail.com',1300000.00,2,'2026-04-07 09:30:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(25,'HD024','Lương Thế Thành','001099001021','thanh.lt@gmail.com',280000.00,5,'2026-04-07 14:00:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(26,'HD025','Hà Anh Tuấn','001099001022','tuan.ha@gmail.com',500000.00,1,'2026-04-08 11:45:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(27,'HD026','Sơn Tùng MTP','001099001023','tung.st@gmail.com',2500000.00,3,'2026-04-08 16:30:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(28,'HD027','Bích Phương','001099001024','phuong.b@gmail.com',700000.00,2,'2026-04-09 08:40:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(29,'HD028','Đen Vâu','001099001025','den.vau@gmail.com',450000.00,4,'2026-04-09 13:20:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(30,'HD029','Hoàng Thùy Linh','001099001026','linh.ht@gmail.com',900000.00,1,'2026-04-10 10:10:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(31,'HD030','Trúc Nhân','001099001027','nhan.t@gmail.com',320000.00,5,'2026-04-10 15:00:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(32,'HD031','Erik','001099001028','erik@gmail.com',600000.00,2,'2026-04-11 09:20:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(33,'HD032','Đức Phúc','001099001029','phuc.d@gmail.com',1200000.00,3,'2026-04-11 14:15:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(34,'HD033','Hòa Minzy','001099001030','hoa.mz@gmail.com',550000.00,1,'2026-04-12 11:00:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(35,'HD034','Min','001099001031','min@gmail.com',800000.00,4,'2026-04-12 16:40:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(36,'HD035','Amee','001099001032','amee@gmail.com',380000.00,2,'2026-04-13 08:30:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(37,'HD036','Noo Phước Thịnh','001099001033','noo@gmail.com',1500000.00,3,'2026-04-13 13:45:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(38,'HD037','Đông Nhi','001099001034','nhi.d@gmail.com',650000.00,1,'2026-04-14 10:00:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(39,'HD038','Ông Cao Thắng','001099001035','thang.oc@gmail.com',200000.00,5,'2026-04-14 15:30:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(40,'HD039','Isaac','001099001036','isaac@gmail.com',950000.00,2,'2026-04-15 09:15:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(41,'HD040','Jun Phạm','001099001037','jun.p@gmail.com',420000.00,4,'2026-04-15 14:50:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(42,'HD041','Phạm Hương','001099001038','huong.p@gmail.com',1100000.00,1,'2026-04-16 11:20:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(43,'HD042','Lan Khuê','001099001039','khue.l@gmail.com',300000.00,3,'2026-04-16 16:10:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(44,'HD043','Minh Tú','001099001040','tu.m@gmail.com',750000.00,2,'2026-04-17 08:50:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(45,'HD044','Võ Hoàng Yến','001099001041','yen.vh@gmail.com',500000.00,5,'2026-04-17 13:40:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(46,'HD045','Thanh Hằng','001099001042','hang.t@gmail.com',2000000.00,1,'2026-04-18 10:25:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(47,'HD046','Hồ Ngọc Hà','001099001043','ha.hn@gmail.com',3500000.00,3,'2026-04-18 15:55:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(48,'HD047','Lệ Quyên','001099001044','quyen.l@gmail.com',850000.00,2,'2026-04-19 09:35:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(49,'HD048','Đàm Vĩnh Hưng','001099001045','dam.vh@gmail.com',1200000.00,4,'2026-04-19 14:20:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(50,'HD049','Mỹ Tâm','001099001046','tam.m@gmail.com',5000000.00,1,'2026-04-20 11:10:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(51,'HD050','Tùng Dương','001099001047','duong.t@gmail.com',400000.00,5,'2026-04-20 16:45:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(52,'HD051','Uống Thị Bình','001099001048','binh.ut@gmail.com',600000.00,2,'2026-04-21 08:40:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(53,'HD052','Trần Bảo Ngọc','001099001049','ngoc.tb@gmail.com',950000.00,3,'2026-04-21 13:25:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(54,'HD053','Lê Thị Diễm','001099001050','diem.lt@gmail.com',320000.00,1,'2026-04-22 10:15:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(55,'HD054','Phạm Công Vinh','001099001051','vinh.pc@gmail.com',700000.00,4,'2026-04-22 15:50:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(56,'HD055','Thủy Tiên','001099001052','tien.t@gmail.com',1100000.00,2,'2026-04-23 09:20:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(57,'HD056','Công Phượng','001099001053','phuong.c@gmail.com',450000.00,5,'2026-04-23 14:10:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(58,'HD057','Quang Hải','001099001054','hai.q@gmail.com',1800000.00,1,'2026-04-24 11:30:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(59,'HD058','Đoàn Văn Hậu','001099001055','hau.dv@gmail.com',300000.00,3,'2026-04-24 16:20:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(60,'HD059','Tiến Linh','001099001056','linh.t@gmail.com',800000.00,2,'2026-04-25 08:50:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(61,'HD060','Đặng Văn Lâm','001099001057','lam.dv@gmail.com',550000.00,4,'2026-04-25 13:35:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(62,'HD061','Văn Toàn','001099001058','toan.v@gmail.com',1200000.00,1,'2026-04-26 10:45:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(63,'HD062','Tuấn Anh','001099001059','anh.t@gmail.com',400000.00,5,'2026-04-26 15:55:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(64,'HD063','Hùng Dũng','001099001060','dung.h@gmail.com',950000.00,2,'2026-04-27 09:10:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(65,'HD064','Quế Ngọc Hải','001099001061','hai.qn@gmail.com',600000.00,3,'2026-04-27 14:40:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(66,'HD065','Phạm Xuân Mạnh','001099001062','manh.px@gmail.com',250000.00,1,'2026-04-27 00:00:00',3,'2026-04-28 00:57:46','2026-04-28 01:08:03',NULL,NULL),(67,'HD066','Trần Đình Trọng','001099001063','trong.td@gmail.com',750000.00,4,'2026-04-28 08:20:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(68,'HD067','Duy Mạnh','001099001064','manh.d@gmail.com',1100000.00,2,'2026-04-28 10:15:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(69,'HD068','Phan Văn Đức','001099001065','duc.pv@gmail.com',500000.00,5,'2026-04-28 13:40:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(70,'HD069','Lương Xuân Trường','001099001066','truong.lx@gmail.com',1500000.00,1,'2026-04-28 15:50:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(71,'HD070','Nguyễn Thị Tuyết','001099001067','tuyet.nt@gmail.com',320000.00,3,'2026-04-29 09:05:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(72,'HD071','Hoàng Thị Thảo','001099001068','thao.ht@gmail.com',850000.00,2,'2026-04-29 11:35:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(73,'HD072','Lê Thị Hà','001099001069','ha.lt@gmail.com',450000.00,4,'2026-04-29 14:50:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(74,'HD073','Vũ Thị Lan','001099001070','lan.vt@gmail.com',1200000.00,1,'2026-04-30 08:30:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(75,'HD074','Nguyễn Minh Quân','001099001071','quan.nm@gmail.com',200000.00,5,'2026-04-30 10:10:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(76,'HD075','Trần Nhật Minh','001099001072','minh.tn@gmail.com',950000.00,2,'2026-04-30 13:25:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(77,'HD076','Lê Quang Huy','001099001073','huy.lq@gmail.com',600000.00,3,'2026-04-30 15:55:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(78,'HD077','Phạm Gia Linh','001099001074','linh.pg@gmail.com',400000.00,1,'2026-05-01 09:40:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(79,'HD078','Bùi Thái Dương','001099001075','duong.bt@gmail.com',750000.00,4,'2026-05-01 11:20:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(80,'HD079','Hoàng Bảo Vy','001099001076','vy.hb@gmail.com',1100000.00,2,'2026-05-01 14:15:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(81,'HD080','Đặng Ngọc Diệp','001099001077','diep.dn@gmail.com',320000.00,5,'2026-05-02 08:55:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(82,'HD081','Trần Kim Ngân','001099001078','ngan.tk@gmail.com',1500000.00,1,'2026-05-02 10:40:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(83,'HD082','Lê Hữu Đạt','001099001079','dat.lh@gmail.com',500000.00,3,'2026-05-02 13:50:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(84,'HD083','Nguyễn Thị My','001099001080','my.nt@gmail.com',850000.00,2,'2026-05-03 09:30:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(85,'HD084','Phạm Việt Bách','001099001081','bach.pv@gmail.com',420000.00,4,'2026-05-03 11:10:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(86,'HD085','Lý Phương Anh','001099001082','anh.lp@gmail.com',1300000.00,1,'2026-05-03 14:45:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(87,'HD086','Vũ Nam Khánh','001099001083','khanh.vn@gmail.com',280000.00,5,'2026-05-04 08:25:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(88,'HD087','Đỗ Thành Trung','001099001084','trung.dt@gmail.com',900000.00,2,'2026-05-04 10:15:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(89,'HD088','Nguyễn Kim Liên','001099001085','lien.nk@gmail.com',600000.00,3,'2026-05-04 13:30:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(90,'HD089','Trần Văn Sang','001099001086','sang.tv@gmail.com',450000.00,1,'2026-05-05 09:05:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(91,'HD090','Lê Thị Quỳnh','001099001087','quynh.lt@gmail.com',750000.00,4,'2026-05-05 11:20:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(92,'HD091','Phạm Mai Trang','001099001088','trang.pm@gmail.com',1100000.00,2,'2026-05-05 14:55:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(93,'HD092','Hoàng Công Lý','001099001089','ly.hc@gmail.com',300000.00,5,'2026-05-06 08:40:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(94,'HD093','Vũ Tiến Anh','001099001090','anh.vt@gmail.com',1800000.00,1,'2026-05-06 10:35:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(95,'HD094','Đặng Thùy Dung','001099001091','dung.dt@gmail.com',550000.00,3,'2026-05-06 13:20:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(96,'HD095','Bùi Văn Hào','001099001092','hao.bv@gmail.com',800000.00,2,'2026-05-07 09:15:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(97,'HD096','Ngô Thị Yến','001099001093','yen.nt@gmail.com',420000.00,4,'2026-05-07 11:50:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(98,'HD097','Đỗ Quang Vinh','001099001094','vinh.dq@gmail.com',1200000.00,1,'2026-05-07 14:10:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(99,'HD098','Lý Thị Ngân','001099001095','ngan.lt@gmail.com',350000.00,5,'2026-05-08 08:45:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(100,'HD099','Dương Văn Tấn','001099001096','tan.dv@gmail.com',950000.00,2,'2026-05-08 10:25:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(101,'HD100','Trần Thị Thu','001099001097','thu.tt@gmail.com',650000.00,3,'2026-05-08 13:40:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(102,'HD101','Lê Minh Hằng','001099001098','hang.lm@gmail.com',500000.00,1,'2026-05-09 09:10:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(103,'HD102','Phạm Anh Tú','001099001099','tu.pa@gmail.com',800000.00,4,'2026-05-09 11:55:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(104,'HD103','Hoàng Văn Lợi','001099001100','loi.hv@gmail.com',1100000.00,2,'2026-05-09 14:30:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(105,'HD104','Vũ Thị Ngọc','001099001101','ngoc.vt@gmail.com',300000.00,5,'2026-05-10 08:20:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(106,'HD105','Đặng Quốc Huy','001099001102','huy.dq@gmail.com',1500000.00,1,'2026-05-10 10:45:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(107,'HD106','Bùi Phương Nam','001099001103','nam.bp@gmail.com',450000.00,3,'2026-05-10 13:10:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(108,'HD107','Ngô Văn Khang','001099001104','khang.nv@gmail.com',750000.00,2,'2026-05-11 09:35:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(109,'HD108','Đỗ Thị Quyên','001099001105','quyen.dt@gmail.com',1100000.00,4,'2026-05-11 11:50:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(110,'HD109','Lý Gia Bảo','001099001106','bao.lg@gmail.com',320000.00,1,'2026-05-11 14:25:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(111,'HD110','Dương Thị Hà','001099001107','ha.dt@gmail.com',900000.00,5,'2026-05-12 08:50:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(112,'HD111','Trần Văn Thắng','001099001108','thang.tv@gmail.com',550000.00,2,'2026-05-12 10:40:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(113,'HD112','Lê Bảo Anh','001099001109','anh.lb@gmail.com',1200000.00,3,'2026-05-12 13:15:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(114,'HD113','Phạm Minh Tuyết','001099001110','tuyet.pm@gmail.com',400000.00,1,'2026-05-13 09:05:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(115,'HD114','Hoàng Quốc Việt','001099001111','viet.hq@gmail.com',850000.00,4,'2026-05-13 11:30:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(116,'HD115','Vũ Thị Diễm','001099001112','diem.vt@gmail.com',1300000.00,2,'2026-05-13 14:45:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(117,'HD116','Đặng Thành Nam','001099001113','nam.dt@gmail.com',250000.00,5,'2026-05-14 08:35:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(118,'HD117','Bùi Ngọc Lan','001099001114','lan.bn@gmail.com',700000.00,1,'2026-05-14 10:15:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(119,'HD118','Ngô Minh Tú','001099001115','tu.nm@gmail.com',1100000.00,3,'2026-05-14 13:55:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(120,'HD119','Đỗ Văn Hòa','001099001116','hoa.dv@gmail.com',450000.00,2,'2026-05-15 09:25:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(121,'HD120','Lý Thị Thúy','001099001117','thuy.lt@gmail.com',950000.00,4,'2026-05-15 11:10:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(122,'HD121','Dương Công Minh','001099001118','minh.dc@gmail.com',320000.00,1,'2026-05-15 14:35:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(123,'HD122','Trần Thị Liên','001099001119','lien.tt@gmail.com',800000.00,5,'2026-05-16 08:45:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(124,'HD123','Lê Văn Tài','001099001120','tai.lv@gmail.com',1500000.00,2,'2026-05-16 10:50:00',3,'2026-04-28 00:57:46','2026-04-28 01:01:59',NULL,NULL),(125,'LOGTEST001','Log Test',NULL,NULL,100000.00,1,'2026-04-28 01:34:02',4,'2026-04-28 01:34:02','2026-04-28 01:34:02',NULL,NULL);
/*!40000 ALTER TABLE `Invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Permissions`
--

DROP TABLE IF EXISTS `Permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Permissions` (
  `Id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PermissionName` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Permissions`
--

LOCK TABLES `Permissions` WRITE;
/*!40000 ALTER TABLE `Permissions` DISABLE KEYS */;
INSERT INTO `Permissions` VALUES ('Invoices.Create','Tạo hóa đơn','Thêm mới hóa đơn.'),('Invoices.Delete','Xóa hóa đơn của mình','Xóa hóa đơn do mình tạo.'),('Invoices.DeleteAll','Xóa tất cả hóa đơn','Xóa hóa đơn của người khác.'),('Invoices.Edit','Sửa hóa đơn của mình','Chỉnh sửa hóa đơn do mình tạo.'),('Invoices.EditAll','Sửa tất cả hóa đơn','Chỉnh sửa hóa đơn của người khác.'),('Invoices.Export','Xuất file hóa đơn','Xuất Excel và PDF hóa đơn.'),('Invoices.View','Xem hóa đơn của mình','Xem danh sách hóa đơn do mình tạo.'),('Invoices.ViewAll','Xem tất cả hóa đơn','Xem danh sách toàn bộ hóa đơn trên hệ thống.'),('Roles.Manage','Quản lý vai trò','Quản lý Role và gán quyền.'),('ServiceTypes.Manage','Quản lý loại dịch vụ','Thêm, sửa, xóa loại dịch vụ.'),('Stats.View','Xem thống kê','Xem dashboard thống kê doanh thu.'),('Users.Manage','Quản lý nhân viên','Thêm, sửa, xóa, đặt lại mật khẩu nhân viên.');
/*!40000 ALTER TABLE `Permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `RolePermissions`
--

DROP TABLE IF EXISTS `RolePermissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `RolePermissions` (
  `RoleId` int NOT NULL,
  `PermissionId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`RoleId`,`PermissionId`),
  KEY `IX_RolePermissions_PermissionId` (`PermissionId`),
  CONSTRAINT `FK_RolePermissions_Permissions_PermissionId` FOREIGN KEY (`PermissionId`) REFERENCES `Permissions` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_RolePermissions_Roles_RoleId` FOREIGN KEY (`RoleId`) REFERENCES `Roles` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `RolePermissions`
--

LOCK TABLES `RolePermissions` WRITE;
/*!40000 ALTER TABLE `RolePermissions` DISABLE KEYS */;
INSERT INTO `RolePermissions` VALUES (1,'Invoices.Create'),(2,'Invoices.Create'),(4,'Invoices.Create'),(1,'Invoices.Delete'),(4,'Invoices.Delete'),(1,'Invoices.DeleteAll'),(4,'Invoices.DeleteAll'),(1,'Invoices.Edit'),(2,'Invoices.Edit'),(4,'Invoices.Edit'),(1,'Invoices.EditAll'),(4,'Invoices.EditAll'),(1,'Invoices.Export'),(2,'Invoices.Export'),(4,'Invoices.Export'),(1,'Invoices.View'),(2,'Invoices.View'),(4,'Invoices.View'),(1,'Invoices.ViewAll'),(4,'Invoices.ViewAll'),(1,'Roles.Manage'),(1,'ServiceTypes.Manage'),(1,'Stats.View'),(2,'Stats.View'),(4,'Stats.View'),(1,'Users.Manage');
/*!40000 ALTER TABLE `RolePermissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Roles`
--

DROP TABLE IF EXISTS `Roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Roles` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `RoleName` varchar(50) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `RoleName` (`RoleName`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Roles`
--

LOCK TABLES `Roles` WRITE;
/*!40000 ALTER TABLE `Roles` DISABLE KEYS */;
INSERT INTO `Roles` VALUES (1,'Admin'),(4,'Quản Lý'),(2,'Staff');
/*!40000 ALTER TABLE `Roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ServiceTypes`
--

DROP TABLE IF EXISTS `ServiceTypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ServiceTypes` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `TypeName` varchar(100) NOT NULL,
  `Description` text,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `TypeName` (`TypeName`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ServiceTypes`
--

LOCK TABLES `ServiceTypes` WRITE;
/*!40000 ALTER TABLE `ServiceTypes` DISABLE KEYS */;
INSERT INTO `ServiceTypes` VALUES (1,'Công chứng Hợp đồng Mua bán',NULL),(2,'Công chứng Hợp đồng Tặng cho',NULL),(3,'Công chứng Hợp đồng Thế chấp',NULL),(4,'Công chứng Di chúc',NULL),(5,'Công chứng Ủy quyền',NULL);
/*!40000 ALTER TABLE `ServiceTypes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Username` varchar(50) NOT NULL,
  `PasswordHash` varchar(255) NOT NULL,
  `FullName` varchar(100) DEFAULT NULL,
  `RoleId` int DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Username` (`Username`),
  KEY `RoleId` (`RoleId`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`RoleId`) REFERENCES `Roles` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES (1,'admin_cc','$2a$11$76fH.9p6fC8/K.1.qY9G0.W2s6O5M0Y1i7r7i.e5vG.v8i1Gv1.','Quản trị viên',1,'2026-04-25 21:00:05'),(2,'canbo_01','$2a$11$K7VNHU95A97uOGoD1AsDEOoD2cl.bVv9G6uE5t8Zl9srX2QWmAhSe','Nguyễn Văn A',2,'2026-04-25 21:00:05'),(3,'duongluan','$2a$11$iDOd4mxIYlEQMszduPwIEOYMXe/4NfU9xs9tnv5QBRsahWksTn4vy','Dương Luận',4,'2026-04-25 21:00:57'),(4,'admin','$2a$11$aOLXdXyqjCKzxdvhwqaj/OUhyh.VA3M46ks.pRdExLA2B4sN9cfVe','Administrator',1,'2026-04-28 01:24:47'),(5,'testuser','$2a$11$4XVDtgE.lKQFCjJZSoBbjevZVUpz.Ho3C30d59mrCWwphcFqBBERq','Test User',2,'2026-04-28 01:29:33');
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-28 11:34:53
