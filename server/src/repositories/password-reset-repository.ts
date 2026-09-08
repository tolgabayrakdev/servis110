import { db } from "../config/database.js";

export const passwordResetRepository = {
  async replaceForUser(userId: string, tokenHash: string, expiresAt: Date) {
    return db.transaction(async (trx) => {
      await trx("password_reset_tokens")
        .where({ user_id: userId })
        .whereNull("used_at")
        .delete();
      await trx("password_reset_tokens").insert({
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt,
      });
    });
  },

  async resetPassword(tokenHash: string, passwordHash: string) {
    return db.transaction(async (trx) => {
      const token = await trx("password_reset_tokens")
        .select(
          "password_reset_tokens.id",
          "password_reset_tokens.user_id as userId",
        )
        .join("users", "users.id", "password_reset_tokens.user_id")
        .where({ "password_reset_tokens.token_hash": tokenHash })
        .where("users.is_active", true)
        .whereNull("password_reset_tokens.used_at")
        .where("password_reset_tokens.expires_at", ">", trx.fn.now())
        .forUpdate()
        .first();

      if (!token) return false;

      await trx("users").where({ id: token.userId, is_active: true }).update({
        password_hash: passwordHash,
        updated_at: trx.fn.now(),
      });
      await trx("password_reset_tokens")
        .where({ user_id: token.userId })
        .whereNull("used_at")
        .update({ used_at: trx.fn.now(), updated_at: trx.fn.now() });
      return true;
    });
  },
};
