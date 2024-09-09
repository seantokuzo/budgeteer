export const checkEnvVars = () => {
  // CHECK FOR ENVIRONMENTAL VARIABLES
  if (!process.env.PORT) throw Error('❌ PORT must be defined');
  if (!process.env.JWT_SECRET) throw Error('❌ JWT_SECRET must be defined');
  if (!process.env.JWT_LIFETIME) throw Error('❌ JWT_LIFETIME must be defined');
  if (!process.env.MONGO_URI) throw Error('❌ MONGO_URI must be defined');
};
