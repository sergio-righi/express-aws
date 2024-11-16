import express, { Request, Response } from "express";
import { S3Controller } from "controllers";

const router = express.Router();

router.post("/initiate-multipart-upload", (req: Request, res: Response) => S3Controller.initiateMultipartUpload(req, res));
router.post("/generate-presigned-urls", (req: Request, res: Response) => S3Controller.generatePresignedUrl(req, res));
router.post("/complete-multipart-upload", (req: Request, res: Response) => S3Controller.completeMultipartUpload(req, res));
router.get("/list-documents", (req: Request, res: Response) => S3Controller.list(req, res));
router.delete("/remove-document", (req: Request, res: Response) => S3Controller.remove(req, res));
router.patch("/rename-document", (req: Request, res: Response) => S3Controller.rename(req, res));
router.get("/generate-share-url", (req: Request, res: Response) => S3Controller.share(req, res));

export default router;
