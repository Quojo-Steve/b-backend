import { ICohort, ITraining, ITrainingApplication } from '../../types/training.types';

export interface RegistrationNotification {
  application: ITrainingApplication;
  training: ITraining;
  cohort: ICohort;
}

/**
 * Everything that should happen after a successful training registration.
 * Swappable like IEmailService: the composition root picks the implementation,
 * so TrainingApplicationService never knows whether emails are on or off.
 */
export interface IRegistrationNotifier {
  notifyRegistered(notification: RegistrationNotification): Promise<void>;
}
