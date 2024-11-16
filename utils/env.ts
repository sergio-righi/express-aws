import dotenv from "dotenv"
import convict from "convict";

dotenv.config();

export default convict({
  cors: {
    default: "*",
    env: "CORS_ORIGIN"
  },
  env: {
    default: "dev",
    env: "NODE_ENV",
  },
  http: {
    port: {
      doc: "The port to listen on",
      default: 3000,
      env: "PORT",
    },
    host: {
      default: "http://localhost",
      env: "HOST",
    }
  },
  ngrok: {
    doc: "The tunnel token",
    default: "2oTdIpKbPVTAL0odJYliHgVHByP_7YKwrTfMDvoVmX8J7SVrL go run main.go",
    env: "NGROK_AUTHTOKEN"
  },
  s3: {
    accessKey: {
      doc: "AWS Access Key",
      default: "",
      env: "S3_ACCESS_KEY_ID",
    },
    bucketName: {
      doc: "AWS Bucket Name",
      default: "",
      env: "S3_BUCKET_NAME",
    },
    endpoint: {
      doc: "AWS Endpoint",
      default: "",
      env: "S3_ENDPOINT",
    },
    secretKey: {
      doc: "AWS Secret Key",
      default: "",
      env: "S3_SECRET_ACCESS_KEY",
    },
    region: {
      doc: "AWS Region",
      default: "us-east-1",
      env: "S3_REGION",
    }
  },
}).validate()