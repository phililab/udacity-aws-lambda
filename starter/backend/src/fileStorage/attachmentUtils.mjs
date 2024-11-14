import {createLogger} from "../utils/logger.mjs"
import {PutObjectCommand, S3Client} from '@aws-sdk/client-s3'
import {getSignedUrl} from '@aws-sdk/s3-request-presigner'

const logger = createLogger('INFO')
const bucketName = process.env.BUCKET_NAME
const s3 = new S3Client()

export async function getUploadUrl(todoId) {

    try {
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: todoId
        })
        const url = await getSignedUrl(s3, command, {expiresIn: 3000})
        logger.info('Image uploaded')
        return url
    } catch (error) {
        logger.error('Upload failed')
        throw new Error(error.message);
    }
}