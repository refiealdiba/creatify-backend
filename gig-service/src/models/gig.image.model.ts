import { RowDataPacket } from "mysql2";

export interface GigImage extends RowDataPacket {
    id: number;
    gig_id: number;
    image_url: string;
    createdAt: Date;
    updatedAt: Date;
}
