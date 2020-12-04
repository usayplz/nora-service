import { Injectable } from '@andrei-tatar/ts-ioc';
import { Subject } from 'rxjs';
import { PostgressService } from './postgress.service';

@Injectable()
export class UserRepository {
    private userBlocked = new Subject<string>();

    readonly userBlocked$ = this.userBlocked.asObservable();

    constructor(
        private postgress: PostgressService,
    ) {
    }

    async createUserRecordIfNotExists(uid: string) {
        await this.postgress.query(`INSERT INTO appuser (uid) VALUES ($1) ON CONFLICT DO NOTHING`, uid);
    }

    async getUser(uid: string) {
        const [user] = await this.postgress.query<User>(`SELECT * FROM appuser WHERE uid = $1`, uid);
        if (!user) { throw new Error('user does not exist'); }
        return user;
    }

    async isUserLinked(uid: string) {
        const rows = await this.postgress.query<User>('select linked from appuser where uid = $1', uid);
        if (rows && rows.length === 1) { return rows[0].linked; }
        return false;
    }

    async updateUserLinked(uid: string, linked: boolean) {
        await this.postgress.query(`UPDATE appuser SET linked = $1 WHERE uid = $2`, linked, uid);
    }

    async getRefreshToken(uid: string): Promise<number | null> {
        const rows = await this.postgress.query<User>(`SELECT refreshToken FROM appuser WHERE uid = $1`, uid);
        if (rows && rows.length === 1) { return rows[0].refreshtoken; }
        return null;
    }

    async getNodeRedTokenVersion(uid: string): Promise<number> {
        const rows = await this.postgress.query<User>(`SELECT noderedversion FROM appuser WHERE uid = $1`, uid);
        if (rows && rows.length === 1) { return rows[0].noderedversion; }
        return 1;
    }

    async incrementNoderedTokenVersion(uid: string): Promise<void> {
        await this.postgress.query(`UPDATE appuser SET noderedversion = noderedversion + 1 WHERE uid = $1`, uid);
    }
}

export interface User {
    readonly uid: string;
    refreshtoken: number;
    noderedversion: number;
    linked: boolean;
}
