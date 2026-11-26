import { NestFastifyApplication } from '@nestjs/platform-fastify';

export async function createAuthenticatedUser(app: NestFastifyApplication) {
  const dto = {
    name: 'user',
    email: `user-${crypto.randomUUID()}@email.com`,
    password: 'password',
  };

  const registerResponse = await app.inject({
    method: 'POST',
    url: '/auth/register',
    body: dto,
  });

  expect(registerResponse.statusCode).toBe(201);

  const response = await app.inject({
    method: 'POST',
    url: '/auth/login',
    body: { email: dto.email, password: dto.password },
  });

  const authCookie = response.cookies.find(
    (cookie) => cookie.name === '__Host-sid',
  );

  expect(authCookie).toBeDefined();

  return { user: registerResponse.json(), authCookie: authCookie! };
}
