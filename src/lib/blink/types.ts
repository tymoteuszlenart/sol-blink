export type BlinkTemplate = {
  slug: string;
  title: string;
  description: string;
  icon: string;
  receiver: string;
  defaultAmount: number;
  amountOptions: number[];
  customAmountLabel: string;
  maxAmount: number;
  isActive: boolean;
};

export type BlinkTemplateInput = Omit<BlinkTemplate, "slug"> & {
  slug?: string;
};
