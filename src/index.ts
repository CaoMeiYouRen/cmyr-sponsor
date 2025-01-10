import path from 'path'
import { S3Client, PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3'
import fs from 'fs-extra'
import mime from 'mime-types'
import dotenv from 'dotenv'

dotenv.config({
    path: [
        '.env.local',
        '.env',
    ],
})

const logger = console

const ACCOUNT_ID = process.env.ACCOUNT_ID || ''
const ACCESS_KEY_ID = process.env.ACCESS_KEY_ID || ''
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY || ''
const BUCKET_NAME = process.env.BUCKET_NAME || ''

const S3 = new S3Client({
    region: 'auto',
    endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
    },
})

async function upload(filepath: string, rootpath: string, prefix: string) {
    try {
        const Bucket = BUCKET_NAME
        const Body = await fs.readFile(filepath)
        const Key = path.join(prefix, filepath.replace(rootpath, '')).replace(/\\/g, '/')
        const ContentType = mime.lookup(path.extname(filepath)) || ''
        const input: PutObjectCommandInput = {
            Body,
            Bucket,
            Key,
            ContentType,
        }
        const command = new PutObjectCommand(input)
        // logger.info(filepath, Key, ContentType)
        logger.info(`正在上传文件：${Key}`)
        const response = await S3.send(command)
        // logger.info(response)
        logger.info(`文件：${Key} 上传成功！code：${response.$metadata.httpStatusCode}`)
        return response
    } catch (error) {
        logger.error(error)
    }
}

async function start() {
    if (await fs.pathExists('sponsorkit/sponsors.svg')) {
        await upload('sponsorkit/sponsors.svg', 'sponsorkit', 'sponsorkit')
    }
}

start()
