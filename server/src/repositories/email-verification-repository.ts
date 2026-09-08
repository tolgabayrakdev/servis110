import { db } from "../config/database.js";

export const emailVerificationRepository = {
  async replaceForUser(userId: string, codeHash: string, expiresAt: Date) {
    return db.transaction(async (trx) => {
      await trx("email_verification_codes")
        .where({ user_id: userId })
        .whereNull("used_at")
        .delete();
      await trx("email_verification_codes").insert({
        user_id: userId,
        code_hash: codeHash,
        expires_at: expiresAt,
      });
    });
  },

  async verify(userId: string, codeHash: string) {
    return db.transaction(async (trx) => {
      const code = await trx("email_verification_codes")
        .select("id")
        .where({ user_id: userId, code_hash: codeHash })
        .whereNull("used_at")
        .where("expires_at", ">", trx.fn.now())
        .forUpdate()
        .first();
      if (!code) return false;

      await trx("users").where({ id: userId }).update({
        email_verified_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      });
      await trx("email_verification_codes")
        .where({ user_id: userId })
        .whereNull("used_at")
        .update({ used_at: trx.fn.now(), updated_at: trx.fn.now() });
      return true;
    });
  },
};
