import { Controller, Post, UseInterceptors, UploadedFile, HttpException, HttpStatus, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';

@Controller('uploads')
export class UploadsController {
    @Post()
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const uniqueSuffix = uuidv4();
                const ext = extname(file.originalname);
                cb(null, `${uniqueSuffix}${ext}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
                return cb(new HttpException('Only image files are allowed!', HttpStatus.BAD_REQUEST), false);
            }
            cb(null, true);
        },
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB limit
        },
    }))
    uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
        if (!file) {
            throw new HttpException('File is required', HttpStatus.BAD_REQUEST);
        }

        // Construct the public URL
        // Assuming the server is running on localhost or accessible IP.
        // Ideally, the base URL should be from configuration/env.
        // For now, we return a relative path or construct it if we know the host.
        // Since we handle full URLs in frontend, let's return a relative path and frontend or backend can prepend host.
        // Or better, let's try to get protocol and host from request if possible, or just return the filename/path.

        // Simplest approach: Return the static path that will be served.
        // We will serve 'uploads' folder on '/uploads' route (or similar).

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const fileUrl = `${baseUrl}/uploads/${file.filename}`;

        return {
            url: fileUrl,
            filename: file.filename,
        };
    }
}
