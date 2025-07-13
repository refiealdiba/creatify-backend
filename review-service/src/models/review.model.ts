import { RowDataPacket } from "mysql2";

export default interface Review extends RowDataPacket {
    id: number;
    order_id: number;
    gig_id: number;
    user_id: number;
    rating: number;
    comment: string;
    created_at: Date;
    updated_at: Date;
}
