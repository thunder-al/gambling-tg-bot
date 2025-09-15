import {DB} from '@/db/database.ts'
import {Kysely} from 'kysely'

/**
 * Handles the referral code for a user.
 *
 * @param {string} referralCode - The referral code provided by the user.
 * @param {string} referredUserId - The ID of the user being referred.
 * @param {Kysely<DB>} trx - The transaction object.
 * @returns {Promise<false | string>} The ID of the referral user if successful, otherwise false.
 */
async function handleReferralCodeOnUser(
  referralCode: string,
  referredUserId: string,
  trx: Kysely<DB>): Promise<false | string> {

  referralCode = referralCode.replace(/^UR/i, '').toLowerCase()

  const referralUser = await trx.selectFrom('users')
    .forNoKeyUpdate()
    .select(['id', 'referred_by_id'])
    .where('referrer_str', '=', referralCode)
    .executeTakeFirst()
  if (!referralUser) {
    return false
  }

  const referredUser = await trx.selectFrom('users')
    .forNoKeyUpdate()
    .select(['id'])
    .where('id', '=', referredUserId)
    .executeTakeFirst()
  if (!referredUser) {
    return false
  }

  // check for referral loops
  const browsedUsers = new Set<string>([referralUser.id, referredUser.id])
  let currentReferralUserId = referralUser.id
  let limit = 100
  while (true) {

    // break loop and fail if limit reached
    if (limit-- <= 0) {
      return false
    }

    const parentReferralUser = await trx.selectFrom('users')
      .forNoKeyUpdate()
      .select(['id', 'referred_by_id'])
      .where('id', '=', currentReferralUserId)
      .executeTakeFirst()

    // end loop and continue
    // if current referral user is not referred by anyone or not exists (unexpected behavior)
    if (!parentReferralUser || !parentReferralUser.referred_by_id) {
      break
    }

    // end loop and FAIL
    // if current referral user is already browsed (referral loop detected)
    if (browsedUsers.has(parentReferralUser.id) || browsedUsers.has(parentReferralUser.referred_by_id)) {
      return false
    }
  }

  await trx.updateTable('users')
    .where('id', '=', referredUser.id)
    .set({
      referred_at: qb => qb.fn('now'),
      referred_by_id: referralUser.id,
    })
    .execute()

  return referralUser.id
}

export const userSvc = {
  handleReferralCodeOnUser,
}
