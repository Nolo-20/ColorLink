import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import readline from 'readline';

const prisma = new PrismaClient();
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const ask = (q: string): Promise<string> => new Promise(resolve => rl.question(q, resolve));

async function main() {
  const email = await ask('Email del empleado: ');
  const nombre = await ask('Nombre: ');
  const apellido = await ask('Apellido: ');
  const rolNombre = await ask('Rol (asesor / calidad / administrador): ');
  const password = await ask('Contraseña temporal: ');

  const rol = await prisma.rol.findFirst({ where: { rol: rolNombre.trim() } });
  if (!rol) {
    console.error(`Rol "${rolNombre}" no existe en la tabla Rol.`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.usuario.create({
    data: {
      email: email.toLowerCase().trim(),
      nombre,
      apellido,
      rolId: rol.rolId,
      passwordHash,
      authProvider: 'credentials'
    }
  });

  console.log(`✅ Empleado creado: ${user.email} con rol ${rolNombre}`);
  rl.close();
}

main().finally(() => prisma.$disconnect());
