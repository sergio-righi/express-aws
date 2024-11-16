import AWS from "aws-sdk";

import { Request, Response } from 'express';
import { S3Service } from "services";
import { ApiResponse } from "types";
import { env } from "utils";

class S3Controller {
  s3: AWS.S3;
  bucketName: string;

  constructor() {
    // AWS S3 Configuration
    this.s3 = new AWS.S3({
      endpoint: env.get("s3.endpoint"),
      accessKeyId: env.get("s3.accessKey"),
      secretAccessKey: env.get("s3.secretKey"),
      region: env.get("s3.region"),
      s3ForcePathStyle: true,
    });
    this.bucketName = env.get("s3.bucketName");
  }

  async initiateMultipartUpload(req: Request, res: Response) {
    const { fileName } = req.body;
    try {
      const params = {
        Bucket: this.bucketName,
        Key: fileName,
      };
      const { UploadId, Key } = await this.s3.createMultipartUpload(params).promise();
      res.json({ status: 200, payload: { id: UploadId, key: Key } } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({ status: 500, payload: null, error: error.message } as ApiResponse);
    }
  };

  async generatePresignedUrl(req: Request, res: Response) {
    const { fileKey, fileId, parts } = req.body;
    try {
      const promises = Array.from({ length: parts }, (_, index) =>
        this.s3.getSignedUrlPromise("uploadPart", {
          Bucket: this.bucketName,
          Key: fileKey,
          UploadId: fileId,
          PartNumber: index + 1,
        })
      );
      const urls = await Promise.all(promises);
      res.json({ status: 200, payload: urls.map((url, index) => ({ signedUrl: url, PartNumber: index + 1 })) } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({ status: 500, payload: null, error: error.message } as ApiResponse);
    }
  };

  async completeMultipartUpload(req: Request, res: Response) {
    const { fileKey, fileId, parts } = req.body;

    try {
      // Sort parts by PartNumber before sending to AWS S3
      const sortedParts = parts.sort((a: any, b: any) => a.PartNumber - b.PartNumber);

      // Prepare parameters for completeMultipartUpload
      const params = {
        Bucket: this.bucketName,
        Key: fileKey,
        UploadId: fileId,
        MultipartUpload: { Parts: sortedParts },
      };
      // Complete the multipart upload
      await this.s3.completeMultipartUpload(params).promise();

      // Fetch the file size using headObject after completing the upload
      const headObjectParams = {
        Bucket: this.bucketName,
        Key: fileKey,
      };
      const headObjectResult = await this.s3.headObject(headObjectParams).promise();

      // Return the key name, ETag, and size in the response
      res.json({
        status: 200, payload: {
          key: fileKey,
          size: headObjectResult.ContentLength
        }
      } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({ status: 500, payload: null, error: error.message } as ApiResponse);
    }
  };

  async list(req: Request, res: Response) {
    const { prefix, delimiter } = req.query;
    try {
      const params: any = {
        Bucket: this.bucketName,
        Prefix: prefix || "",
        Delimiter: delimiter || "",
      };
      const data = await this.s3.listObjectsV2(params).promise();
      res.json({ status: 200, payload: (data?.Contents || []).filter((item: any) => delimiter === "/" ? item.Key.endsWith("/") : !item.Key.endsWith("/")) } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({ status: 500, payload: null, error: error.message } as ApiResponse);
    }
  };

  async remove(req: Request, res: Response) {
    const { fileKey } = req.query;
    try {
      const params: AWS.S3.DeleteObjectRequest | any = {
        Bucket: this.bucketName,
        Key: fileKey,
      };
      await this.s3.deleteObject(params).promise();
      res.json({ status: 200, payload: true } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({ status: 500, payload: false, error: error.message } as ApiResponse);
    }
  };

  async rename(req: Request, res: Response) {
    const { oldFileKey, newFileKey } = req.query;
    try {
      // Copy the object to the new key 
      const copyParams: AWS.S3.CopyObjectRequest | any = {
        Bucket: this.bucketName,
        CopySource: [this.bucketName, oldFileKey].join("/"),
        Key: newFileKey,
      };
      await this.s3.copyObject(copyParams).promise();

      // Delete the old object
      const deleteParams: AWS.S3.DeleteObjectRequest | any = {
        Bucket: this.bucketName,
        Key: oldFileKey,
      };
      await this.s3.deleteObject(deleteParams).promise();
      res.json({ status: 200, payload: true } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({ status: 500, payload: false, error: error.message } as ApiResponse);
    }
  }

  async share(req: Request, res: Response) {
    const { fileKey, expiresIn } = req.query;
    try {
      const params: any = {
        Bucket: this.bucketName,
        Key: fileKey,
        Expires: Number(expiresIn || 3600),
      };
      const signedUrl = this.s3.getSignedUrl("getObject", params);
      res.json({ status: 200, payload: signedUrl } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({ status: 500, payload: null, error: error.message } as ApiResponse);
    }
  }
}

export default new S3Controller();