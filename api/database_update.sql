-- Actualización de la base de datos para nuevas funcionalidades
-- Ejecuta este archivo si ya tienes la BD creada

USE sumquiz;

-- Agregar columna tipo_operacion a puntuaciones
ALTER TABLE puntuaciones 
ADD COLUMN tipo_operacion ENUM('suma', 'resta') DEFAULT 'suma' AFTER usuario_id,
ADD COLUMN modo_practica TINYINT(1) DEFAULT 0 COMMENT '0=normal, 1=practica' AFTER tipo_operacion;

-- Agregar índice para tipo_operacion
ALTER TABLE puntuaciones 
ADD INDEX idx_tipo_operacion (tipo_operacion);

-- Tabla de logros
CREATE TABLE IF NOT EXISTS logros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo_logro VARCHAR(50) NOT NULL COMMENT 'Ej: primera_suma, racha_5, perfecto_30',
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_tipo (tipo_logro),
    UNIQUE KEY unique_logro_usuario (usuario_id, tipo_logro)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

