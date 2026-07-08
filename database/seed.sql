USE vm_techstore;

INSERT INTO products (sku, name, category, price, stock, description, image_url) VALUES
('VM-SSD-001', 'DISCO EXTERNO ADATA HD330 1TB NEGRO USB 3.1', 'Almacenamiento', 117.00, 8, 'Disco externo resistente a golpes y caidas.', 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=900&q=80'),
('VM-SSD-002', 'SSD CORSAIR 1TB M.2 SERIES GEN.4 PCIE MP600 CORE XT NVME', 'Almacenamiento', 206.00, 5, 'Unidad NVMe de alto rendimiento.', 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=900&q=80'),
('VM-SSD-003', 'SSD KINGSTON 500GB M.2 2280 PCIE 4.0 NVME', 'Almacenamiento', 162.00, 7, 'Lectura hasta 5000MB/s y escritura hasta 3000MB/s.', 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=900&q=80'),
('VM-SSD-004', 'DISCO SSD KINGSTON 2.5 SATA A400 480GB', 'Almacenamiento', 160.00, 10, 'Unidad SATA para equipos de escritorio y portatiles.', 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=900&q=80'),
('VM-SSD-005', 'SSD WESTERN DIGITAL 500GB SATA 2.5 GREEN', 'Almacenamiento', 130.60, 6, 'SSD 2.5 pulgadas de bajo consumo.', 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=900&q=80'),
('VM-IMP-001', 'IMPRESORA CANON G3110 MFP PIXMA WIFI', 'Impresoras', 211.30, 4, 'Multifuncion con conectividad WiFi.', 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=900&q=80'),
('VM-IMP-002', 'IMPRESORA HP 580 SMART TANK MFP WIFI', 'Impresoras', 263.74, 3, 'Impresora tanque de tinta para oficina.', 'https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?auto=format&fit=crop&w=900&q=80'),
('VM-IMP-003', 'IMPRESORA EPSON L15150 MULTIFUNCIONAL A3 WIFI', 'Impresoras', 1298.03, 2, 'Multifuncional A3 duplex automatica.', 'https://images.unsplash.com/photo-1612815154147-ae3b49d3dfe7?auto=format&fit=crop&w=900&q=80'),
('VM-COM-001', 'DELL DC15250 INTEL I7 16GB 512GB 15.6 FHD', 'Computadoras', 834.85, 4, 'Portatil con WiFi 6, HDMI, USB-A y USB-C.', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80'),
('VM-COM-002', 'HP PORTATIL 15-FD0276LA CORE I7 512GB 16GB 15.6 FHD', 'Computadoras', 807.14, 3, 'Laptop color warm gold para trabajo y estudio.', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80'),
('VM-COM-003', 'LENOVO IDEAPAD SLIM 3 RYZEN 7 16GB 1TB 15.3', 'Computadoras', 769.12, 5, 'Portatil Lenovo para productividad.', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=900&q=80'),
('VM-SRV-001', 'Mantenimiento preventivo de computadores', 'Servicios', 25.00, 30, 'Limpieza, diagnostico y optimizacion basica.', 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=900&q=80')
ON DUPLICATE KEY UPDATE name = VALUES(name), price = VALUES(price), stock = VALUES(stock), image_url = VALUES(image_url);

INSERT INTO clients (full_name, email, phone, city, address) VALUES
('Cliente mostrador VM', 'cyber.vm.19@gmail.com', '0978813240', 'Valencia', 'Simon Bolivar 10 y Jorge Herrera'),
('Empresa local Valencia', 'compras@empresa.local', '0999999999', 'Valencia', 'Centro de Valencia'),
('Institucion educativa', 'tic@institucion.edu.ec', '0988888888', 'Quevedo', 'Av. Principal')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

INSERT INTO users (username, password_hash, full_name, role) VALUES
('admin', '$2b$10$BVDDjhr4P/PLFelzEw0XEuyB3WuqWhqVjzOBGsagzIvNAeLEYMHx2', 'Administrador VM', 'admin')
ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), full_name = VALUES(full_name), role = VALUES(role);
