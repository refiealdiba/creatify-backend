import { RowDataPacket } from "mysql2";

export interface Gig extends RowDataPacket {
    id: number;
    user_id: number;
    title: string;
    description: string;
    category_id: number;
    price: number;
    delivery_time: number;
    createdAt: Date;
    updatedAt: Date;
}
