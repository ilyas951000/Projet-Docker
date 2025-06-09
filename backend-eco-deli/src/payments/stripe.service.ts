import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Transfer } from '../payments/entities/transfer.entity';
import { Intervention } from '../intervention/entities/intervention.entity';
import { Subscription as SubscriptionEntity } from 'src/subscriptions/entities/subscription.entity'; // ⚠️ évite conflit avec Stripe.Subscription
import { PlatformFee } from './entities/platform-fee.entity' // adapte chemin
import { Package } from 'src/packages/entities/package.entity';
import { Advertisement } from 'src/advertisements/entities/advertisement.entity';
import { Virement } from 'src/virement/entities/virement.entity';

// ✅ Typage local étendu pour éviter l'erreur TS2339
interface UserWithStripe extends User {
  stripeAccountId?: string;
}

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Transfer)
    private transferRepo: Repository<Transfer>,
    @InjectRepository(Intervention)
    private interventionRepo: Repository<Intervention>, // ✅ ajouter ceci
    @InjectRepository(SubscriptionEntity)
    private readonly subscriptionRepo: Repository<SubscriptionEntity>,
    @InjectRepository(PlatformFee)
    private readonly platformFeeRepo: Repository<PlatformFee>, // 👈 AJOUT
    @InjectRepository(Package)
    private readonly packageRepo: Repository<Package>,
    @InjectRepository(Advertisement)
    private readonly advertisementRepo: Repository<Advertisement>,
    @InjectRepository(Virement)
    private readonly virementRepo: Repository<Virement>,

  ) {
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeKey) {
      throw new Error(
        '❌ STRIPE_SECRET_KEY is not defined. Please check your .env file and ConfigModule setup.'
      );
    }

    this.stripe = new Stripe(stripeKey, {
      apiVersion: '2025-04-30.basil',
    });
    
  }

  async getFinanceOverview(): Promise<{ totalRevenue: number; totalTransfers: number }> {
  // Total des virements envoyés
  const transferTotalResult = await this.transferRepo
    .createQueryBuilder('transfer')
    .select('SUM(transfer.amount)', 'total')
    .getRawOne();

  // Total des frais de plateforme
  const feeTotalResult = await this.platformFeeRepo
    .createQueryBuilder('fee')
    .select('SUM(fee.amount)', 'total')
    .getRawOne();

  const totalTransfers = parseFloat(transferTotalResult.total) || 0;
  const totalFees = parseFloat(feeTotalResult.total) || 0;

  return {
    totalRevenue: totalTransfers + totalFees, // Revenus = virements + frais
    totalTransfers: totalTransfers,
  };
}

async getAccountStatus(providerId: number) {
  const user = await this.userRepo.findOneBy({ id: providerId }) as UserWithStripe;
  if (!user || !user.stripeAccountId) return { hasValidAccount: false };

  const account = await this.stripe.accounts.retrieve(user.stripeAccountId);
  return { hasValidAccount: account.charges_enabled && account.payouts_enabled };
}

async getStripeAccountDetails(accountId: string) {
  return await this.stripe.accounts.retrieve(accountId);
}






async getPlatformFeesOverview() {
  const feeResult = await this.platformFeeRepo
    .createQueryBuilder('fee')
    .select('SUM(fee.amount)', 'sum')
    .getRawOne();

  const subscriptionTotal = await this.subscriptionRepo
    .createQueryBuilder('subscription')
    .select(`
      SUM(
        CASE 
          WHEN subscription.subscriptionTitle = 'Starter' THEN 9.99
          WHEN subscription.subscriptionTitle = 'Premium' THEN 19.99
          ELSE 0
        END
      )`, 'total')
    .getRawOne();

  const platformFees = parseFloat(feeResult.sum || '0');
  const subscriptionRevenue = parseFloat(subscriptionTotal.total || '0');

  return {
    total: platformFees + subscriptionRevenue,
  };
}

async addIbanToStripeAccount(userId: number, iban: string) {
  const user = await this.userRepo.findOneBy({ id: userId }) as UserWithStripe;
  if (!user || !user.stripeAccountId) throw new Error("Compte Stripe introuvable");

  const bankAccount = await this.stripe.accounts.createExternalAccount(
    user.stripeAccountId,
    {
      external_account: {
        object: 'bank_account',
        country: 'FR',
        currency: 'eur',
        account_holder_name: `${user.userFirstName} ${user.userLastName}`,
        account_holder_type: 'individual',
        account_number: iban,
      },
    }
  );

  return { success: true, bankAccountId: bankAccount.id };
}

async payoutToProvider(providerId: number, amount: number) {
  const provider = await this.userRepo.findOneBy({ id: providerId }) as UserWithStripe;
  if (!provider || !provider.stripeAccountId) {
    throw new Error('Compte Stripe introuvable');
  }

  // On crée un payout vers le compte bancaire
  const payout = await this.stripe.payouts.create(
    {
      amount: Math.round(amount * 100), // En centimes
      currency: 'eur',
    },
    {
      stripeAccount: provider.stripeAccountId, // Compte connecté
    }
  );

  return {
    success: true,
    payoutId: payout.id,
    arrival_date: payout.arrival_date,
    status: payout.status,
  };
}






  async createStripeExpressAccount(userId: number) {
    const user = await this.userRepo.findOneBy({ id: userId }) as UserWithStripe;
    if (!user) throw new Error('Utilisateur introuvable');

    if (user.stripeAccountId) {
      return { success: true, message: 'Compte déjà existant' };
    }

    const account = await this.stripe.accounts.create({
      type: 'express',
      country: 'FR',
      email: user.email,
      business_type: 'individual',
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true }, // ✅ AJOUT ESSENTIEL
      },
      individual: {
        first_name: user.userFirstName,
        last_name: user.userLastName,
        email: user.email,
      },
    });

    user.stripeAccountId = account.id;
    await this.userRepo.save(user);

    const accountLink = await this.stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.FRONT_URL}/dashboard/livreur/wallet`,
      return_url: `${process.env.FRONT_URL}/dashboard/livreur/wallet`,
      type: 'account_onboarding',
    });

    return {
      success: true,
      url: accountLink.url,
    };
  }

  async createOrGetStripeExpressAccount(userId: number) {
    const user = await this.userRepo.findOneBy({ id: userId }) as UserWithStripe;
    if (!user) throw new Error('Utilisateur introuvable');

    // S'il a déjà un compte, renvoyer le lien d'onboarding
    if (!user.stripeAccountId) {
      const account = await this.stripe.accounts.create({
        type: 'express',
        country: 'FR',
        email: user.email,
        business_type: 'individual',
        capabilities: {
          transfers: { requested: true },
        },
        individual: {
          first_name: user.userFirstName,
          last_name: user.userLastName,
          email: user.email,
        },
      });

      user.stripeAccountId = account.id;
      await this.userRepo.save(user);
    }

    // Renvoyer le lien d'onboarding même s'il avait déjà un compte
    const accountLink = await this.stripe.accountLinks.create({
      account: user.stripeAccountId,
      refresh_url: 'http://localhost:3000/dashboard/livreur/wallet',
      return_url: 'http://localhost:3000/dashboard/livreur/wallet',
      type: 'account_onboarding',
    });

    return { success: true, url: accountLink.url };
  }


  async createPaymentIntentForIntervention(interventionId: number) {
    // ✅ Ne pas demander la relation "client" (car elle n'existe pas dans l'entité)
    const intervention = await this.interventionRepo.findOne({
      where: { id: interventionId },
    });

    if (!intervention) {
      throw new Error('Intervention introuvable');
    }

    // ✅ Charger le client manuellement via clientId
    const client = await this.userRepo.findOneBy({ id: intervention.clientId });
    if (!client) {
      throw new Error('Client introuvable');
    }

    // ✅ Créer uniquement le PaymentIntent ici
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(intervention.prix * 100),
      currency: 'eur',
      payment_method_types: ['card'],
      metadata: {
        interventionId: intervention.id,
        clientId: client.id,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
    };
  }







  async createPaymentIntent(
    clientId: number,
    providerId: number,
    amount: number,
    packageId?: number,
    fee?: number
  ) {
    const client = await this.userRepo.findOne({
      where: { id: clientId },
      relations: ['subscription'],
    });
    const provider = await this.userRepo.findOneBy({ id: providerId });

    if (!client || !provider) {
      throw new Error('Client ou prestataire introuvable');
    }

    const subscription = client.subscription?.[0];

    const packageEntity = await this.packageRepo.findOneBy({ id: packageId });
    if (!packageEntity) throw new Error('Colis introuvable');

    const advertisement = await this.advertisementRepo.findOneBy({ id: packageEntity.advertisementId });
    if (!advertisement || advertisement.advertisementPrice == null) {
      throw new Error('Prix de la publicité introuvable');
    }

    const basePrice = parseFloat(advertisement.advertisementPrice.toString());

    let serviceFee: number;

    if (fee !== undefined) {
      // ✅ Si le front a déjà calculé les frais, on les prend directement
      serviceFee = fee;
    } else {
      // ✅ Sinon, on les calcule côté backend
      serviceFee = basePrice * 0.2;

      if (subscription?.subscriptionTitle === 'Starter') {
        serviceFee *= 0.95; // -5%
        if (
          packageEntity.packageDimension &&
          ['xs', 's'].includes(packageEntity.packageDimension)
        ) {
          serviceFee *= 0.95; // -5% supplémentaire
        }
      }

      if (subscription?.subscriptionTitle === 'Premium') {
        const totalDiscount = (subscription.shippingDiscount + subscription.permanentDiscount) / 100;
        serviceFee *= 1 - totalDiscount;

        if (!subscription.hasUsedFreeShipping && basePrice < 150) {
          serviceFee = 0;
          subscription.hasUsedFreeShipping = true;
          await this.subscriptionRepo.save(subscription);
        }
      }

      if (packageEntity.prioritaire) {
        if (!subscription || !subscription.subscriptionTitle) {
          serviceFee += (basePrice + serviceFee) * 0.15;
        } else if (subscription.subscriptionTitle === 'Starter') {
          serviceFee += (basePrice + serviceFee) * 0.05;
        } else if (subscription.subscriptionTitle === 'Premium') {
          const now = new Date();
          const lastReset = subscription.lastPriorityReset;
          const shouldReset =
            !lastReset ||
            now.getMonth() !== new Date(lastReset).getMonth() ||
            now.getFullYear() !== new Date(lastReset).getFullYear();

          if (shouldReset) {
            subscription.priorityShippingUsed = 0;
            subscription.lastPriorityReset = now;
            await this.subscriptionRepo.save(subscription);
          }

          const used = subscription.priorityShippingUsed ?? 0;
          if (used < 3) {
            subscription.priorityShippingUsed = used + 1;
            await this.subscriptionRepo.save(subscription);
          } else {
            serviceFee += (basePrice + serviceFee) * 0.05;
          }
        }
      }
    }

    const finalTotal = parseFloat((basePrice + serviceFee).toFixed(2));

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(finalTotal * 100),
      currency: 'eur',
      payment_method_types: ['card'],
      metadata: {
        clientId: String(clientId),
        providerId: String(providerId),
        ...(packageId && { packageId: String(packageId) }),
        platformFee: serviceFee.toFixed(2),
      },
    });

    const amountToTransfer = serviceFee ? finalTotal - serviceFee : finalTotal;

    await this.transferRepo.save({
      provider,
      client,
      amount: amountToTransfer,
      status: 'pending',
      isValidatedByClient: false,
      ...(packageId && { packageId }),
    });

    if (serviceFee && packageId) {
      await this.platformFeeRepo.save({
        packageId,
        amount: serviceFee,
      });
    }

    return { clientSecret: paymentIntent.client_secret };
  }








  async validateClientTransfer(transferId: number) {
    const transfer = await this.transferRepo.findOne({
      where: { id: transferId },
      relations: ['provider', 'client'],
    });

    if (!transfer) throw new Error('Transfert introuvable');
    if (transfer.status !== 'pending') throw new Error('Déjà transféré');
    if (transfer.isValidatedByClient) throw new Error('Déjà validé');

    transfer.isValidatedByClient = true;
    transfer.status = 'completed';

    await this.transferRepo.save(transfer);
    return { success: true, message: 'Virement validé (virtuellement).' };
  }

  async getTransfersByClient(clientId: number) {
    return this.transferRepo.find({
      where: { client: { id: clientId } },
      relations: ['provider'],
      order: { requestedAt: 'DESC' },
    });
  }

  async getBalanceForProvider(providerId: number) {
    const total = await this.transferRepo
      .createQueryBuilder('transfer')
      .select('SUM(transfer.amount)', 'sum')
      .where('transfer.providerId = :providerId', { providerId })
      .andWhere('transfer.status = :status', { status: 'completed' })
      .andWhere('transfer.isValidatedByClient = true')
      .getRawOne();

    return { balance: parseInt(total.sum || '0', 10) };
  }

  async getPendingBalance(providerId: number) {
    const total = await this.transferRepo
      .createQueryBuilder('transfer')
      .select('SUM(transfer.amount)', 'sum')
      .where('transfer.providerId = :providerId', { providerId })
      .andWhere('transfer.status = :status', { status: 'pending' })
      .andWhere('transfer.isValidatedByClient = false')
      .getRawOne();

    return { pending: parseInt(total.sum || '0', 10) };
  }

  async getVirementsForProvider(providerId: number) {
    return this.virementRepo.find({
      where: { provider: { id: providerId } },
      order: { createdAt: 'DESC' },
    });
  }


  async transferFunds(providerId: number, amount: number) {
    const provider = await this.userRepo.findOneBy({ id: providerId });
    if (!provider || !provider.stripeAccountId) {
      throw new Error('Provider or Stripe account not found');
    }

    const validTransfers = await this.transferRepo.find({
      where: { provider, status: 'completed', isValidatedByClient: true },
      order: { requestedAt: 'ASC' },
    });

    const totalAvailable = validTransfers.reduce((sum, t) => sum + t.amount, 0);
    if (amount > totalAvailable) {
      throw new Error('Solde insuffisant.');
    }

    let toPay = amount;
    for (const t of validTransfers) {
      if (toPay <= 0) break;
      const pay = Math.min(t.amount, toPay);
      t.status = 'paid';
      await this.transferRepo.save(t);
      toPay -= pay;
    }

    // Utilisation de transfer au lieu de payout
    const transfer = await this.stripe.transfers.create({
      amount: Math.round(amount * 100),
      currency: 'eur',
      destination: provider.stripeAccountId, // vers le compte connecté
    });

    // Historique
    await this.virementRepo.save({
      provider,
      amount,
      stripePayoutId: transfer.id,
    });

    return {
      success: true,
      message: 'Virement envoyé au compte Stripe connecté.',
      stripeTransferId: transfer.id,
    };
  }




  async createSubscriptionCheckoutSession(userId: number, priceId: string, subscriptionPlan: string) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new Error('Utilisateur introuvable');

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [
        {
          price: priceId, // Le prix configuré sur Stripe, pas le productId
          quantity: 1,
        },
      ],
      success_url: `http://localhost:3000/dashboard/client/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:3000/subscription/cancel`,
      metadata: {
        userId: user.id.toString(),
        subscriptionPlan, // 👈 starter_plan / premium_plan
      },
    });

    return { url: session.url };
  }



  async cancelActiveSubscription(stripeCustomerEmail: string) {
    const customers = await this.stripe.customers.list({ email: stripeCustomerEmail });
    const customer = customers.data[0];
    if (!customer) throw new Error('Aucun client Stripe trouvé');

    const subscriptions = await this.stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
    });

    for (const sub of subscriptions.data) {
      await this.stripe.subscriptions.cancel(sub.id);
    }

    return { message: 'Abonnement annulé' };
  }

  async cancelUserSubscription(email: string) {
    const customers = await this.stripe.customers.list({ email });
    const customer = customers.data[0];
    if (!customer) throw new Error('Client Stripe introuvable.');

    const subscriptions = await this.stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
    });

    for (const sub of subscriptions.data) {
      await this.stripe.subscriptions.cancel(sub.id);
    }

    const user = await this.userRepo.findOne({
      where: { email },
      relations: ['subscription'],
    });

    if (user) {
      user.userSubscription = 0;

      // ✅ Supprime l’entrée de la table `subscription`
      if (user.subscription) {
        await this.subscriptionRepo.remove(user.subscription);
      }

      await this.userRepo.save(user);
    }

    return { message: 'Abonnement annulé.' };
  }


  async handleUnifiedWebhook(raw: { headers: any; body: any }) {
    const sig = raw.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      throw new Error('❌ STRIPE_WEBHOOK_SECRET non défini dans .env');
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(raw.body, sig, endpointSecret);
    } catch (err: any) {
      console.error('⚠️ Signature Stripe invalide :', err.message);
      throw new Error(`Webhook Error: ${err.message}`);
    }

    const eventType = event.type;
    console.log(`📦 Webhook Stripe reçu : ${eventType}`);

    // ✅ Cas 1 : abonnement réussi
    if (eventType === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_email;
      const plan = session.metadata?.subscriptionPlan;

      if (!email || !plan) return { received: true };

      const user = await this.userRepo.findOne({ where: { email }, relations: ['subscription'] });
      if (!user) return { received: true };

      switch (plan) {
        case 'starter_plan':
          user.userSubscription = 1;
          break;
        case 'premium_plan':
          user.userSubscription = 2;
          break;
        default:
          user.userSubscription = 0;
          break;
      }

      await this.userRepo.save(user);

      const newSub = this.subscriptionRepo.create({
        subscriptionTitle: plan === 'starter_plan' ? 'Starter' : 'Premium',
        packageInsurance: true,
        shippingDiscount: plan === 'premium_plan' ? 9 : 5,
        priorityShipping: plan === 'premium_plan' ? 1 : 0,
        permanentDiscount: plan === 'premium_plan' ? 5 : 5,
        supplement3000: plan === 'premium_plan',
        hasUsedFreeShipping: false,
        users: user,
      });

      await this.subscriptionRepo.save(newSub);
      console.log(`✅ Subscription enregistrée pour ${email}`);
    }

    // ✅ Cas 2 : paiement normal (non abonnement)
    else if (eventType === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`✅ Paiement simple réussi : ${paymentIntent.id}`);
      // tu peux ajouter une logique si nécessaire ici
    }

    return { received: true };
  }



  async processStripeWebhookEvent(raw: { headers: any; body: any }) {
    const sig = raw.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      throw new Error('❌ STRIPE_WEBHOOK_SECRET non défini dans .env');
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(raw.body, sig, endpointSecret);
    } catch (err: any) {
      console.error('⚠️ Signature Stripe invalide :', err.message);
      throw new Error(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_email;
      const plan = session.metadata?.subscriptionPlan;

      if (!email || !plan) return { received: true };

      const user = await this.userRepo.findOne({ where: { email }, relations: ['subscription'] });
      if (!user) return { received: true };

      switch (plan) {
        case 'starter_plan':
          user.userSubscription = 1;
          break;
        case 'premium_plan':
          user.userSubscription = 2;
          break;
        default:
          user.userSubscription = 0;
          break;
      }

      await this.userRepo.save(user);

      const newSub = this.subscriptionRepo.create({
        subscriptionTitle: plan === 'starter_plan' ? 'Starter' : 'Premium',
        packageInsurance: true,
        shippingDiscount: plan === 'premium_plan' ? 9 : 5,
        priorityShipping: plan === 'premium_plan' ? 1 : 0,
        permanentDiscount: plan === 'premium_plan' ? 5 : 5,
        supplement3000: plan === 'premium_plan',
        hasUsedFreeShipping: false,
        users: user,
      });

      await this.subscriptionRepo.save(newSub);
      console.log(`✅ Subscription enregistrée pour ${email}`);
    }

    return { received: true }; // ✅ N'oublie pas le return
  }






    async handleWebhook(event: any) {
    if (event.type === 'payment_intent.succeeded') {
      // Traitement webhook éventuel
    }
  }
}
