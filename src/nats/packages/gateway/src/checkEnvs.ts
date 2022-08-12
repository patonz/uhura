export function checkEnvs(): void {
  const envs = [
    'NATS_SERVER',
    'UHURA_CORE_ID',
  ];

  for (const env of envs) {
    if (!process.env[env]) {
      throw new Error(`${env} is not set`);
    }
  }
}
