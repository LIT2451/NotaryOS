-- SQL EXPORT FOR NOTARYOS PRODUCTION (FULL & CLEAN - V3)
-- Created for VPS Deployment
-- Admin Account: admin / 123456

SET NAMES utf8mb4;
CREATE DATABASE IF NOT EXISTS congchungtanmai;
USE congchungtanmai;

-- 1. Table: Roles
CREATE TABLE IF NOT EXISTS `Roles` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `RoleName` varchar(50) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `RoleName` (`RoleName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `Roles` (`Id`, `RoleName`) VALUES (1, 'Admin'), (2, 'Staff'), (3, 'Manager');

-- 2. Table: Permissions
CREATE TABLE IF NOT EXISTS `Permissions` (
  `Id` varchar(255) NOT NULL,
  `PermissionName` varchar(255) NOT NULL,
  `Description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `Permissions` (`Id`, `PermissionName`, `Description`) VALUES 
('Invoices.View', 'Xem hóa đơn của mình', 'Xem danh sách hóa đơn do mình tạo.'),
('Invoices.ViewAll', 'Xem tất cả hóa đơn', 'Xem danh sách toàn bộ hóa đơn trên hệ thống.'),
('Invoices.Create', 'Tạo hóa đơn', 'Thêm mới hóa đơn.'),
('Invoices.Edit', 'Sửa hóa đơn của mình', 'Chỉnh sửa hóa đơn do mình tạo.'),
('Invoices.EditAll', 'Sửa tất cả hóa đơn', 'Chỉnh sửa hóa đơn của người khác.'),
('Invoices.Delete', 'Xóa hóa đơn của mình', 'Xóa hóa đơn do mình tạo.'),
('Invoices.DeleteAll', 'Xóa tất cả hóa đơn', 'Xóa hóa đơn của người khác.'),
('Invoices.Export', 'Xuất file hóa đơn', 'Xuất Excel và PDF hóa đơn.'),
('Stats.View', 'Xem thống kê', 'Xem dashboard thống kê doanh thu.'),
('Users.Manage', 'Quản lý nhân viên', 'Thêm, sửa, xóa, đặt lại mật khẩu nhân viên.'),
('Roles.Manage', 'Quản lý vai trò', 'Quản lý Role và gán quyền.'),
('ServiceTypes.Manage', 'Quản lý loại dịch vụ', 'Thêm, sửa, xóa loại dịch vụ.');

-- 3. Table: RolePermissions
CREATE TABLE IF NOT EXISTS `RolePermissions` (
  `RoleId` int NOT NULL,
  `PermissionId` varchar(255) NOT NULL,
  PRIMARY KEY (`RoleId`,`PermissionId`),
  CONSTRAINT `FK_RolePermissions_Roles` FOREIGN KEY (`RoleId`) REFERENCES `Roles` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Gán quyền cho Admin (Tất cả quyền)
INSERT IGNORE INTO `RolePermissions` (`RoleId`, `PermissionId`) VALUES 
(1, 'Invoices.View'), (1, 'Invoices.ViewAll'), (1, 'Invoices.Create'), (1, 'Invoices.Edit'), 
(1, 'Invoices.EditAll'), (1, 'Invoices.Delete'), (1, 'Invoices.DeleteAll'), (1, 'Invoices.Export'), 
(1, 'Stats.View'), (1, 'Users.Manage'), (1, 'Roles.Manage'), (1, 'ServiceTypes.Manage');

-- Gán quyền cho Staff (Quyền cơ bản)
INSERT IGNORE INTO `RolePermissions` (`RoleId`, `PermissionId`) VALUES 
(2, 'Invoices.View'), (2, 'Invoices.Create'), (2, 'Invoices.Edit'), (2, 'Invoices.Export'), (2, 'Stats.View');

-- Gán quyền cho Manager (Giống Staff + Quản lý dịch vụ)
INSERT IGNORE INTO `RolePermissions` (`RoleId`, `PermissionId`) VALUES 
(3, 'Invoices.View'), (3, 'Invoices.Create'), (3, 'Invoices.Edit'), (3, 'Invoices.Export'), (3, 'Stats.View'), (3, 'ServiceTypes.Manage');

-- 4. Table: Users
CREATE TABLE IF NOT EXISTS `Users` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Username` varchar(50) NOT NULL,
  `PasswordHash` varchar(255) NOT NULL,
  `FullName` varchar(100) DEFAULT NULL,
  `RoleId` int DEFAULT NULL,
  `IsLocked` tinyint(1) DEFAULT '0',
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Username` (`Username`),
  CONSTRAINT `FK_Users_Roles` FOREIGN KEY (`RoleId`) REFERENCES `Roles` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Admin: 123456
INSERT IGNORE INTO `Users` (`Id`, `Username`, `PasswordHash`, `FullName`, `RoleId`, `IsLocked`) 
VALUES (1, 'admin', '$2a$11$aOLXdXyqjCKzxdvhwqaj/OUhyh.VA3M46ks.pRdExLA2B4sN9cfVe', 'Quản trị viên', 1, 0);

-- 5. Table: ServiceTypes
CREATE TABLE IF NOT EXISTS `ServiceTypes` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `TypeName` varchar(255) NOT NULL,
  `Category` varchar(50) NOT NULL,
  `Description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `ServiceTypes` (`TypeName`, `Category`) VALUES 
('Hợp đồng Mua bán', 'CongChung'),
('Hợp đồng Tặng cho', 'CongChung'),
('Hợp đồng Thế chấp', 'CongChung'),
('Văn bản Khai nhận di sản', 'CongChung'),
('Hợp đồng Ủy quyền', 'CongChung'),
('Công chứng Di chúc', 'CongChung'),
('Chứng thực Bản sao (Sao y)', 'SaoY'),
('Chứng thực Chữ ký', 'ChungThuc'),
('Chứng thực Hợp đồng thuê nhà', 'ChungThuc'),
('Chứng thực Sơ yếu lý lịch', 'ChungThuc');

-- 6. Table: Invoices
CREATE TABLE IF NOT EXISTS `Invoices` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `InvoiceNumber` varchar(50) NOT NULL,
  `ClientName` varchar(255) DEFAULT NULL,
  `ClientIdNumber` varchar(50) DEFAULT NULL,
  `ClientEmail` varchar(100) DEFAULT NULL,
  `Amount` decimal(18,2) NOT NULL,
  `ServiceTypeId` int DEFAULT NULL,
  `NotaryDate` datetime NOT NULL,
  `BankName` varchar(100) DEFAULT NULL,
  `BankAccount` varchar(100) DEFAULT NULL,
  `CreatedBy` int DEFAULT NULL,
  `IdCardFrontPath` varchar(500) DEFAULT NULL,
  `IdCardBackPath` varchar(500) DEFAULT NULL,
  `IsDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `InvoiceNumber` (`InvoiceNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Table: AuditLogs (MATCHED WITH CODE MODEL)
CREATE TABLE IF NOT EXISTS `AuditLogs` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `UserId` int DEFAULT NULL,
  `Action` varchar(100) NOT NULL,
  `EntityType` varchar(50) DEFAULT NULL,
  `EntityId` int DEFAULT NULL,
  `OldValues` longtext,
  `NewValues` longtext,
  `Timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
