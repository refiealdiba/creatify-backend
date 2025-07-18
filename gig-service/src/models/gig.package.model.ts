import { RowDataPacket } from "mysql2";

export interface GigPackage extends RowDataPacket {
    id: number;
    gig_id: number;
    name: string;
    title: string;
    description: string;
    price: number;
    delivery_time: number;
    revisions: number;
    createdAt: Date;
    updatedAt: Date;
}
