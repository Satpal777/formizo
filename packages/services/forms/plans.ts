import { env } from "../env";

export const formPlanLimits = {
  developer: {
    maxForms: env.DEVELOPER_PLAN_MAX_FORMS,
  },
  pro: {
    maxForms: env.PRO_PLAN_MAX_FORMS,
  },
};

export type FormPlan = keyof typeof formPlanLimits;

export function getFormPlanLimit(plan: FormPlan) {
  return formPlanLimits[plan];
}
