const bcrypt = require('bcrypt');

async function verifyPassword() {
  const storedHash = '$2b$10$Q9Qw8Qw8Qw8Qw8Qw8Qw8QeQw8Qw8Qw8Qw8Qw8Qw8Qw8Qw8Qw8Qw8Q';
  
  // Lista de contraseñas comunes a probar
  const passwordsToTry = [
    'admin123',
    'admin',
    'password',
    '123456',
    'admin@correo.com',
    'admin2024',
    'admin2023',
    'admin2022',
    'admin2021',
    'admin2020',
    'Panama2020$',
    'admin2020$',
    'admin123$',
    'admin$2020',
    'Admin123',
    'Admin2020',
    'Admin2020$',
    'admin2020!',
    'admin!2020',
    'admin@2020'
  ];

  console.log('Verificando contraseñas...');
  
  for (const password of passwordsToTry) {
    const isValid = await bcrypt.compare(password, storedHash);
    if (isValid) {
      console.log(`¡Contraseña encontrada!: ${password}`);
      return;
    }
  }
  
  console.log('No se encontró la contraseña correspondiente al hash');
}

verifyPassword(); 