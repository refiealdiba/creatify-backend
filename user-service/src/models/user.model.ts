import { RowDataPacket } from "mysql2";

export default interface User extends RowDataPacket {
    id: number;
    name: string;
    email: string;
    no_telp: string;
    password: string;
    role: "freelancer" | "client";
    bio: string | null;
    profile_image: string | null;
    created_at: Date;
    updated_at: Date;
}
