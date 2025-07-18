import { RowDataPacket } from "mysql2";

export interface GigPackageBenefit extends RowDataPacket {
    id: number;
    package_id: number;
    benefit: string;
    createdAt: Date;
    updatedAt: Date;
}
