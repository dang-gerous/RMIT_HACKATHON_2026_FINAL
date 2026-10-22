# RentNest (Flatmate TrustVault)

A shared-flat deposit app where every roommate's bond sits in one vault and no single person can touch it alone.

## 1. Vision & originality

Most flatshares hand the whole deposit to one lead tenant, and the landlord later refunds that one person. RentNest proposes a different way of working: each tenant's deposit is held in a shared vault, and money only moves when the rules are met. The product is a simple, friendly rental app. The distinctive part is that deposit release is decided by agreement, not by whoever holds the bank account.

## 2. Trust constraint insight

Two trust problems get in the way today:

- **Roommate risk.** One lead tenant holds everyone's cash. They can delay or keep the refund, and the others can only hope.
- **Landlord power.** The landlord controls the money and can deduct repair fees without anyone agreeing.

When these constraints are removed, a deduction needs both a landlord claim and approval from at least 2/3 of the tenants (`landlord_claim AND approvals >= ceil(2/3 * tenants)`). Refunds then split automatically to each tenant. Nobody has to trust anybody else with the money.

## 3. Value & impact

Tenants (especially students in shared housing), landlords and agents all benefit.

Example: Flat 3B has three tenants who each paid $400, so the bond is $1,200. At move-out the landlord claims $150 for a damaged faucet. Minh and Lan approve and Tuan does not respond. Two of three approvals meet the quorum, so $150 goes to the landlord and $350 goes back to each tenant. Nobody chased a lead tenant, and the landlord could not deduct without evidence and agreement.

## 4. Why TideCloak matters

TideCloak's Emergent Authority is the intended enforcement layer. Its threshold cryptography means no single party holds a master key, so the quorum rule is enforced by the system rather than by promises.

- **Identity:** each tenant's deposit and vote are tied to their own identity (`sub`) through sign-in.
- **Policy:** a release needs the landlord claim plus 2/3 tenant approvals.
- **Data protection:** payout bank details and private landlord notes are encrypted client-side before storage.

**Prototype status:** this build does not call TideCloak yet. Authentication and the escrow rules run on mock data stored in the browser (`localStorage`). The next step is to replace `src/store.ts` with TideCloak sign-in, policy checks and encryption.

## 5. Prototype & storytelling

What the prototype demonstrates today:

- Sign up and sign in with email and password, as a tenant or landlord.
- A vault dashboard with the total deposit, each roommate's share, and a bar showing the tenant refund against the landlord claim.
- A landlord claim form, with a reason, an amount and a description.
- Tenant voting with a live approval meter. Once 2/3 approve, funds are released and refunds are split. Too many rejections freeze the funds for arbitration.
- An activity log of what happened.

**Key interaction for judges:**

1. Sign in as the landlord (`bay@demo.com`) and file a claim.
2. Sign out, then sign in as `minh@demo.com` and approve it.
3. Sign in as `lan@demo.com` and approve it. The quorum is met and the vault settles.

Demo logins: `minh@demo.com`, `lan@demo.com`, `tuan@demo.com` and `bay@demo.com`. The password for all of them is `demo1234`. Use "Reset demo" on the dashboard to start over.

## Run it

```bash
pnpm install
pnpm dev
```
