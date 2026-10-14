import { IRegistrationNotifier } from './IRegistrationNotifier';

/** Default: confirmation emails are disabled, so nothing is sent. */
export class NoopRegistrationNotifier implements IRegistrationNotifier {
  public async notifyRegistered(): Promise<void> {
    // Intentionally empty.
  }
}
