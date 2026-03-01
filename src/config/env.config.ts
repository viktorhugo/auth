import 'dotenv/config';
import * as joi from 'joi';

interface EnvironmentVariables {
  PORT: number;
  HOST: string;
  NODE_ENV: 'development' | 'production' | 'test';
  NATS_SERVERS: string[];
  AWS_REGION: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  DYNAMODB_ENDPOINT: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: number;
  PASSWORD_SALT_ROUNDS: number;
}

const envVarsSchema = joi
  .object<EnvironmentVariables>({
    PORT: joi.number().default(3000),
    HOST: joi.string().required(),
    NODE_ENV: joi
      .string()
      .valid('development', 'production', 'test')
      .required(),
    NATS_SERVERS: joi.array().items(joi.string()).required(),
    AWS_REGION: joi.string().default('us-east-1'),
    AWS_ACCESS_KEY_ID: joi.string().default('test'),
    AWS_SECRET_ACCESS_KEY: joi.string().default('test'),
    DYNAMODB_ENDPOINT: joi.string().required(),
    JWT_SECRET: joi.string().required(),
    JWT_EXPIRES_IN: joi.number().default(3600),
    PASSWORD_SALT_ROUNDS: joi.number().default(10),
  })
  .unknown(true)
  .required();

const { error, value: envVars } = envVarsSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
}) as { error?: joi.ValidationError; value: EnvironmentVariables };
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const envs = {
  port: envVars.PORT,
  host: envVars.HOST,
  nodeEnv: envVars.NODE_ENV,
  natsServers: envVars.NATS_SERVERS,
  awsRegion: envVars.AWS_REGION,
  awsAccessKeyId: envVars.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: envVars.AWS_SECRET_ACCESS_KEY,
  dynamodbEndpoint: envVars.DYNAMODB_ENDPOINT,
  jwtSecret: envVars.JWT_SECRET,
  jwtExpiresIn: envVars.JWT_EXPIRES_IN,
  passwordSaltRounds: envVars.PASSWORD_SALT_ROUNDS,
};
