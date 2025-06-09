import { Controller, Post, Body, Req, UseGuards, Param, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'; // ✅ Obligatoire
import { Repository } from 'typeorm';                // ✅ Obligatoire
import { StripeService } from './stripe.service';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../users/entities/user.entity'; // ✅ Ton entity

@Controller('payments')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  @Post('intervention-intent')
  createIntentForIntervention(@Body('interventionId') interventionId: number) {
    return this.stripeService.createPaymentIntentForIntervention(interventionId);
  }

  @Get('provider/:id/account-status')
  async getStripeAccountStatus(@Param('id') providerId: number) {
    const user = await this.userRepo.findOneBy({ id: providerId });
    if (!user?.stripeAccountId) {
      return { hasValidAccount: false };
    }

    const account = await this.stripeService.getStripeAccountDetails(user.stripeAccountId);
    return {
      hasValidAccount: account.payouts_enabled && account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      charges_enabled: account.charges_enabled,
      requirements: account.requirements,
    };
  }


  @Post('intervention/:id')
  createPaymentIntentForIntervention(@Param('id') id: number) {
    return this.stripeService.createPaymentIntentForIntervention(+id);
  }

  @Get('platform-fees-overview')
  getPlatformFeesOverview() {
    return this.stripeService.getPlatformFeesOverview();
  }

  @Get('provider/:id/virements')
  getVirements(@Param('id') id: number) {
    return this.stripeService.getVirementsForProvider(+id);
  }


  @Get('admin/finance/overview')
  getAdminFinanceOverview() {
    return this.stripeService.getFinanceOverview();
  }


  @UseGuards(AuthGuard)
@Post('create-express-account')
async onboardStripe(@Req() req) {
  const userId = req.user.sub; // ✅ la vraie valeur du user.id
  return this.stripeService.createOrGetStripeExpressAccount(userId);
}




  @Post('intent')
  createIntent(
    @Body() body: { clientId: number; providerId: number; amount: number; packageId?: number; fee: number }
  ) {
    return this.stripeService.createPaymentIntent(
      body.clientId,
      body.providerId,
      body.amount,
      body.packageId,
      body.fee // 👈 ajoute ceci
    );
  }



  @Get('provider/:id/balance')
  getProviderBalance(@Param('id') id: number) {
    return this.stripeService.getBalanceForProvider(+id);
  }

  @Get('client/:id/history')
  getClientTransferHistory(@Param('id') id: number) {
    return this.stripeService.getTransfersByClient(+id);
  }

  @Get('provider/:id/pending-balance')
  getPendingBalance(@Param('id') id: number) {
    return this.stripeService.getPendingBalance(+id);
  }

  @Post('validate/:transferId')
  validateTransfer(@Param('transferId') transferId: number) {
    return this.stripeService.validateClientTransfer(transferId);
  }

  @Post('provider/:id/transfer')
  async transferFunds(
    @Param('id') providerId: number,
    @Body('amount') amount: number
  ) {
    return this.stripeService.transferFunds(providerId, amount);
  }


  @Post('subscription-checkout')
  createSubscription(@Body() body: { userId: number; priceId: string; plan: string }) {
    return this.stripeService.createSubscriptionCheckoutSession(
      body.userId,
      body.priceId,
      body.plan // 👈 rajoute ce 3e argument
    );
  }


  @Post('webhook')
  handleUnifiedStripeWebhook(@Req() req: Request) {
    return this.stripeService.handleUnifiedWebhook({
      headers: req.headers,
      body: req.body,
    });
  }




  @Post('cancel-subscription')
  cancelSubscription(@Body() body: { email: string }) {
    return this.stripeService.cancelUserSubscription(body.email);
  }

  

}
