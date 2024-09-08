export const checkEnvVars = () => {
  // CHECK FOR ENVIRONMENTAL VARIABLES
  if (!process.env.JWT_SECRET) throw Error('❌ JWT_SECRET must be defined');
  if (!process.env.JWT_LIFETIME) throw Error('❌ JWT_LIFETIME must be defined');
  // if (!process.env.POSTGRES_USER)
  //   throw Error('❌ POSTGRES_USER must be defined');
  // if (!process.env.POSTGRES_DB) throw Error('❌ POSTGRES_DB must be defined');
  // if (!process.env.POSTGRES_PASSWORD)
  //   throw Error('❌ POSTGRES_PASSWORD must be defined');
  // if (!process.env.POSTGRES_HOST)
  //   throw Error('❌ POSTGRES_HOST must be defined');
};
