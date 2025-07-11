import { RowDataPacket } from "mysql2";

export default interface Portofolio extends RowDataPacket {
    id: number;
    user_id: number;
    title: string;
    description: string;
    image: string | null;
    created_at: Date;
    updated_at: Date;
}
