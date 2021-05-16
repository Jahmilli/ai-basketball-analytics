export interface IApiConfig {
  port: number;
}

export interface IDatabaseConfig {
  type: "postgres";
  host: string;
  port: number;
  schema: string;
}
