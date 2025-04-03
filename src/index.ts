import path from 'path'
import { S3Client, PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3'
import fs from 'fs-extra'
import mime from 'mime-types'
import dotenv from 'dotenv'
import Cloudflare from 'cloudflare'

dotenv.config({
    path: [
        '.env.local',
        '.env',
    ],
})

const logger = console

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID || process.env.ACCOUNT_ID || ''
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || process.env.ACCESS_KEY_ID || ''
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || process.env.SECRET_ACCESS_KEY || ''
const BUCKET_NAME = process.env.R2_BUCKET_NAME || process.env.BUCKET_NAME || ''
const BASE_URL = process.env.R2_BASE_URL || process.env.BASE_URL || ''

const S3 = new S3Client({
    region: 'auto',
    endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
    },
})

async function cloudflarePurgeCaches(files: string[]) {
    try {
        const client = new Cloudflare({
            apiEmail: process.env['CLOUDFLARE_EMAIL'], // This is the default and can be omitted
            apiKey: process.env['CLOUDFLARE_API_KEY'], // This is the default and can be omitted
        })
        const CLOUDFLARE_ZONE_ID = process.env['CLOUDFLARE_ZONE_ID']
        const response = await client.cache.purge({ zone_id: CLOUDFLARE_ZONE_ID, files })
        return response
    } catch (error) {
        logger.error(error)
    }
}

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
    const files = ['sponsorkit/sponsors.svg', 'sponsorkit/sponsors.png', 'sponsorkit/sponsors.webp']
    for (const file of files) {
        if (await fs.pathExists(file)) {
            await upload(file, 'sponsorkit', 'sponsorkit')
            const url = `${BASE_URL}/${file}`
            logger.info(`文件：${file} 上传成功！url：${url}`)
            // CDN 刷新
            const response = await cloudflarePurgeCaches([url])
            logger.info(`文件：${file} CDN 刷新成功！code：${response}`)
        }
    }
    logger.info('全部文件上传完成！')
}

start()
