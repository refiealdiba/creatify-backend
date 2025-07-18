import { RowDataPacket } from "mysql2";

export interface Category extends RowDataPacket {
    id: number;
    name: string;
    created_at: Date;
    updated_at: Date;
}
